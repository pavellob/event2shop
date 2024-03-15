import { Controller, Get } from '@nestjs/common';
import { Ctx, ProductService, RequestContext } from '@vendure/core';

@Controller('hooks/cal-co')
export class CalCoHookController {
    constructor(private productService: ProductService) {
    }

    @Get()
    findAll(@Ctx() ctx: RequestContext) {
        return console.log("call");
    }
}