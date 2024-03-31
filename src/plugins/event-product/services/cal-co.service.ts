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
  OrderService,
  ProductVariant,
  ProductVariantService,
  RequestContext,
  RequestContextService,
  ShippingMethod,
  TransactionalConnection,
  VendureEntity,
} from "@vendure/core";
import { Booking } from "../types";

@Injectable()
export class CalCoService {
  constructor(
    private readonly httpService: HttpService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private transactionalConnection: TransactionalConnection,
    private productVariantService: ProductVariantService
  ) {}

  private getSKUFromShowSelectonField(field : string) {
    return field.includes("#") 
    ? field.trim().split(" ").filter((value) => value.startsWith("#")).shift()?.slice(1)
    : field.trim().toLocaleLowerCase().replace(" ","-");
  }

  async handleHook(ctx: RequestContext, booking: Booking) {
    console.log(JSON.stringify(booking));
    switch (booking.triggerEvent) {
      case "BOOKING_CREATED":
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
            firstName: booking.payload.attendees[0].firstName || booking.payload.attendees[0].name.split(" ")[0],
            lastName: booking.payload.attendees[0].lastName || booking.payload.attendees[0].name.split(" ")[1] || "",
          });
          if (newCustomer instanceof Customer) {
            customer = newCustomer;
          }
        }
        if (!customer) {
          throw new Error("Can't find or create customer in webhook");
        }

        let order = await this.orderService.create(ctx, customer.id);
        await this.orderService.addCustomerToOrder(ctx, order.id, customer);

        const repoPV =
          this.transactionalConnection.rawConnection.getRepository(
            ProductVariant
          );
        let sku = booking.payload.userFieldsResponses.sku.value;
        let variant: ProductVariant | null = null;
        if (typeof sku === "string") {
          sku = sku.trim().toLocaleLowerCase().replace(" ","-");
          variant = await repoPV.findOne({
            where: {
              sku, 
            },
          });
        }
        if (!variant) {
          throw new Error("No variant");
        }

        const r = await this.orderService.addItemToOrder(ctx, order.id, variant.id, 1);

        const repoSHM =
          this.transactionalConnection.rawConnection.getRepository(
            ShippingMethod
          );
        const shippingMethod = await repoSHM.findOne({
          where: {
            customFields: {
              isEvent: true,
            },
          },
        });

        if (!shippingMethod) {
          throw new Error(`Shipping method for event products doesn't exist`);
        }

        await this.orderService.setShippingAddress(ctx, order.id, {
          countryCode: "TH",
          streetLine1: "",
        });
        await this.orderService.setShippingMethod(ctx, order.id, [
          shippingMethod.id,
        ]);
        
        const result = await this.orderService.transitionToState(ctx, order.id, this.orderService.getNextOrderStates(order)[0])
        const payResult = await this.orderService.getEligiblePaymentMethods(ctx, order.id);
        const paymentResult = await this.orderService.addPaymentToOrder(ctx, order.id, {
          method: "manual",
          metadata: {
          }
        })
        const payments = await this.orderService.getOrderPayments(ctx, order.id)
        await this.orderService.settlePayment(ctx, payments[0].id)
        order = await this.orderService.findOne(ctx, order.id) || order;
        const fullfilments = await this.orderService.getOrderFulfillments(ctx, order);

        await Promise.all(fullfilments.map(f => this.orderService.transitionFulfillmentToState(ctx, f.id, "Shipped")))

        await this.orderService.transitionToState(ctx, order.id, "Shipped")

          break;
          
          default:
        break;
      }
  }
}
