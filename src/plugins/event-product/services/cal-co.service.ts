/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import {
  CustomProductVariantFields,
  Customer,
  CustomerService,
  ErrorResult,
  Logger,
  Order,
  OrderService,
  ProductVariant,
  ProductVariantService,
  RequestContext,
  RequestContextService,
  ShippingMethod,
  TransactionalConnection,
  VendureEntity,
} from "@vendure/core";
import { Booking, CalcomBookingStatus } from "../types";

@Injectable()
export class CalCoService {

  private handlerMap = new Map([[CalcomBookingStatus.BOOKING_CREATED, this.bookingCreatedHandler]]);

  constructor(
    private readonly httpService: HttpService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private transactionalConnection: TransactionalConnection,
    private productVariantService: ProductVariantService
  ) {}

  private getSKUFromShowSelectonField(field: string) {
    const sku = field.includes("#")
      ? // TO regexp
        field
          .trim()
          .split(" ")
          .filter((value) => value.startsWith("#"))
          .shift()
          ?.slice(1)
      : field.trim().toLocaleLowerCase().replace(" ", "-");
    if(!sku) {
      throw new Error("Can't find related sku");
    }
    return sku;
  }

  private async getVariantFromHook(ctx: RequestContext, booking: Booking) {
    const repoPV =
      this.transactionalConnection.rawConnection.getRepository(ProductVariant);
    let variant: ProductVariant | null = null;
    if (typeof booking.payload.userFieldsResponses.sku.value === "string") {
      let sku = this.getSKUFromShowSelectonField(
        booking.payload.userFieldsResponses.sku.value
      );
      variant = await repoPV.findOne({
        where: {
          sku,
        },
      });
    }
    if (!variant) {
      throw new Error("No variant");
    }
    return variant;
  }


  private async customerFromHook(ctx: RequestContext, booking: Booking) {
    const customerRepo =
      this.transactionalConnection.rawConnection.getRepository(Customer);
    let customer: Customer | null = null;
    const existedCustomer = await customerRepo.findOne({
      where: {
        emailAddress: booking.payload.attendees[0].email,
      },
    });
    if (existedCustomer instanceof Customer) {
      customer = existedCustomer;
    }
    if (!existedCustomer) {
      const newCustomer = await this.customerService.create(ctx, {
        emailAddress: booking.payload.attendees[0].email,
        firstName:
          booking.payload.attendees[0].firstName ||
          booking.payload.attendees[0].name.split(" ")[0],
        lastName:
          booking.payload.attendees[0].lastName ||
          booking.payload.attendees[0].name.split(" ")[1] ||
          "",
      });
      if (newCustomer instanceof Customer) {
        customer = newCustomer;
      }
    }
    if (!customer) {
      throw new Error("Can't find or create customer in webhook");
    }
    return customer;
  }

  private getShippingAddressFromHook(ctx: RequestContext, booking: Booking) {
    return {
        countryCode: "TH",
        streetLine1: booking.payload.location,
    }
  }

  private async getDefaultShippingMethod(ctx: RequestContext, booking: Booking) {
    const shippingMethod = await
      this.transactionalConnection.rawConnection.getRepository(ShippingMethod).findOne({
      where: {
        customFields: {
          isEvent: true,
        },
      },
    });

    if (!shippingMethod) {
      throw new Error(`Shipping method for event products doesn't exist`);
    }
    return shippingMethod;
  }

  private async bookingCreatedHandler(ctx: RequestContext, booking: Booking) {
    const customer = await this.customerFromHook(ctx, booking);
    const variant = await this.getVariantFromHook(ctx, booking);
    let order = await this.orderService.create(ctx, customer.id);
    await this.orderService.addCustomerToOrder(ctx, order.id, customer);

    await this.orderService.addItemToOrder(
      ctx,
      order.id,
      variant.id,
      1
    );

    const shippingMethod = await this.getDefaultShippingMethod(ctx, booking);
    const shipppingAddress = this.getShippingAddressFromHook(ctx, booking);
    await this.orderService.setShippingAddress(ctx, order.id, shipppingAddress);
    await this.orderService.setShippingMethod(ctx, order.id, [
      shippingMethod.id,
    ]);

    await this.orderService.transitionToState(
      ctx,
      order.id,
      this.orderService.getNextOrderStates(order)[0]
    );

    await this.orderService.addPaymentToOrder(
      ctx,
      order.id,
      {
        method: "manual",
        metadata: {},
      }
    );
    const payments = await this.orderService.getOrderPayments(ctx, order.id);
    await this.orderService.settlePayment(ctx, payments[0].id);
    order = (await this.orderService.findOne(ctx, order.id)) || order;
    const fullfilments = await this.orderService.getOrderFulfillments(
      ctx,
      order
    );

    await Promise.all(
      fullfilments.map((f) =>
        this.orderService.transitionFulfillmentToState(ctx, f.id, "Shipped")
      )
    );

    const shippedresult = await this.orderService.transitionToState(ctx, order.id, "Shipped")

    if(!(shippedresult instanceof Order)) {
      throw new Error(shippedresult.message) 
    }
    order = shippedresult;
    return order;
  }
  

  async handleHook(ctx: RequestContext, booking: Booking) {
    console.log(JSON.stringify(booking));
    const handler = this.handlerMap.get(booking.triggerEvent as CalcomBookingStatus);
    let result;
    try {
      if(!handler) {
        throw new Error(`Handler for that event doesn't exist`);
      }
      result = await handler(ctx, booking);
    } catch (error) {
      if (error instanceof Error) {
        Logger.warn(error.message)
      }
    }

    return result;
  }
}
