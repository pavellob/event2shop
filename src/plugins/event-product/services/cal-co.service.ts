/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CustomerService, RequestContext } from "@vendure/core";
import { Booking } from "../types";

@Injectable()
export class CalCoService {
    constructor(
      private readonly httpService: HttpService,
      private customerService: CustomerService
      ) {}

    findAll() {

      return this.httpService.axiosRef.get('/event-types').then(data => data.data.event_types.map((i: {link: string}) => console.log(i.link)));
    }

    handleHook(ctx: RequestContext, booking: Booking) {
      switch (booking.triggerEvent) {
        case "BOOKING_CREATED":
          console.log(JSON.stringify(booking.payload.attendees))
          return this.customerService.create(ctx, {
            emailAddress: booking.payload.attendees[0].email,
            firstName: booking.payload.attendees[0].name.split(" ")[0],
            lastName: booking.payload.attendees[0].name.split(" ")[1],
          });
          break;
      
        default:
          break;
      }
    }
      
}
