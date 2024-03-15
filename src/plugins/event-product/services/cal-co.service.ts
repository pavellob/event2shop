/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CalCoService {
    constructor(private readonly httpService: HttpService) {}

    findAll() {
      return this.httpService.axiosRef.get('/event-types').then(data => data.data.event_types.map((i: {link: string}) => console.log(i.link)));
    }
      
}
