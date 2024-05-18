import { FulfillmentHandler, LanguageCode, OrderLine, RequestContext, TransactionalConnection } from '@vendure/core';
import { In } from 'typeorm';
import { CalCoService } from '../services/cal-co.service';

let connection: TransactionalConnection;
let service: CalCoService;

/**
 * @description
 * This is a fulfillment handler for event products which generates a downloevent url
 * for each event product in the order.
 */
export const eventFulfillmentHandler = new FulfillmentHandler({
    code: 'event-fulfillment',
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'Generates product keys for the event downloevent',
        },
    ],
    args: {},
    init: injector => {
        connection = injector.get(TransactionalConnection);
        service = injector.get(CalCoService);
    },
    createFulfillment: async (ctx, orders, lines, args) => {
        const eventUrls: string[] = [];
        const orderLines = await connection.getRepository(ctx, OrderLine).find({
            where: {
                id: In(lines.map(l => l.orderLineId)),
            },
            relations: {
                productVariant: true,
            },
        });
        for (const orderLine of orderLines) {
            if (orderLine.productVariant.customFields.isEvent) {
                eventUrls.push(service.generateEventUrl(ctx.req?.body))
            }
        }
        return {
            method: 'Event Fulfillment',
            trackingCode: 'EVENT',
            customFields: {
                eventUrls,
            },
        };
    },
});

