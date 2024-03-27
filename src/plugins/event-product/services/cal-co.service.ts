/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CustomProductVariantFields, CustomerService, ErrorResult, OrderService, ProductVariant, ProductVariantService, RequestContext, RequestContextService, ShippingMethod, TransactionalConnection, VendureEntity } from "@vendure/core";
import { Booking } from "../types";

@Injectable()
export class CalCoService {
    constructor(
      private readonly httpService: HttpService,
      private customerService: CustomerService,
      private orderService: OrderService,
      private transactionalConnection: TransactionalConnection,
      private productVariantService: ProductVariantService,
      ) {}

    async handleHook(ctx: RequestContext, booking: Booking) {
      console.log(JSON.stringify(booking))
      switch (booking.triggerEvent) {
        case "BOOKING_CREATED":
          const customer = await this.customerService.create(ctx, {
            emailAddress: booking.payload.attendees[0].email,
            firstName: booking.payload.attendees[0].name.split(" ")[0],
            lastName: booking.payload.attendees[0].name.split(" ")[1],
          });
          if (customer instanceof VendureEntity) {
            const order = await this.orderService.create(ctx, customer.id);
            this.orderService.addCustomerToOrder(ctx, order.id, customer);

            const repoPV = this.transactionalConnection.rawConnection.getRepository(ProductVariant);
            const vendureId = booking.payload.userFieldsResponses.vendureId.value;
            let variant: ProductVariant | null = null;
            if(typeof vendureId === "string") {
              variant = await repoPV.findOne({
                where: {
                  id: vendureId
                }
              });
            }
            if(!variant) {
              throw new Error("No variant");
              
            }

            this.orderService.addItemToOrder(ctx, order.id, variant.id, 1);

            const repoSHM = this.transactionalConnection.rawConnection.getRepository(ShippingMethod);
            const shippingMethod = await repoSHM.findOne({
              where: {
                customFields: {
                  isEvent: true,
                }
              }
            })

            if(!shippingMethod) {
              throw new Error(`Shipping method for event products doesn't exist`)
            }


            await this.orderService.setShippingAddress(ctx, order.id, {
              countryCode: "TH",
              streetLine1: ""
            });
            await this.orderService.setShippingMethod(ctx, order.id, [shippingMethod.id]);
            await this.orderService.transitionToState(ctx, order.id, "Shipped")

          }
          
          break;
      
        default:
          break;
      }
    }
      
}
