import { OrderProcess, OrderService } from '@vendure/core';

import { eventFulfillmentHandler } from './event-fulfillment-handler';

let orderService: OrderService;

/**
 * @description
 * This OrderProcess ensures that when an Order transitions from ArrangingPayment to
 * PaymentAuthorized or PaymentSettled, then any event products are automatically
 * fulfilled.
 */
export const eventOrderProcess: OrderProcess<string> = {
    init(injector) {
        orderService = injector.get(OrderService);
    },
    async onTransitionEnd(fromState, toState, data) {
        if (
            fromState === 'ArrangingPayment' &&
            (toState === 'PaymentAuthorized' || toState === 'PaymentSettled')
        ) {
            const eventOrderLines = data.order.lines.filter(l => l.productVariant.customFields.isEvent);
            if (eventOrderLines.length) {
                await orderService.createFulfillment(data.ctx, {
                    lines: eventOrderLines.map(l => ({ orderLineId: l.id, quantity: l.quantity })),
                    handler: { code: eventFulfillmentHandler.code, arguments: [data.ctx.req?.body] },
                });
            }
        }
    },
};