import { FulfillmentHandler, LanguageCode, OrderLine, TransactionalConnection } from '@vendure/core';
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
        console.log(args)
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
                // await serv
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

function generateEventUrl(orderLine: OrderLine) {
    // This is a dummy function that would generate a downloevent url for the given OrderLine
    // by interfacing with some external system that manages access to the event product.
    // In this example, we just generate a random string.
    const eventUrl = `https://example.com/downloevent?key=${Math.random().toString(36).substring(7)}`;
    return Promise.resolve(eventUrl);
}