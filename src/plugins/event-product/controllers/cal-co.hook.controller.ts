import { Controller, Post, Body } from '@nestjs/common';
import { Ctx, ProductService, RequestContext } from '@vendure/core';

@Controller('hooks/cal-co')
export class CalCoHookController {
    constructor(private productService: ProductService) {
    }

    @Post()
    createBooking(@Ctx() ctx: RequestContext, @Body() body: any) {
        return console.log(JSON.stringify(body));
    }
}