import { Controller, Post, Body } from '@nestjs/common';
import { Ctx, ProductService, RequestContext } from '@vendure/core';
import { CalCoService } from '../services/cal-co.service';
import { Booking } from '../types';

@Controller('hooks/cal-co')
export class CalCoHookController {
    constructor(private calComService: CalCoService) {
    }

    @Post()
    createBooking(@Ctx() ctx: RequestContext, @Body() body: Booking) {
        return this.calComService.handleHook(ctx, body);
    }
}