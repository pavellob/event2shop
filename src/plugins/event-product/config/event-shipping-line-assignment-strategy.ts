import {
    Order,
    OrderLine,
    RequestContext,
    ShippingLine,
    ShippingLineAssignmentStrategy,
} from '@vendure/core';

/**
 * @description
 * This ShippingLineAssignmentStrategy ensures that event products are assigned to a
 * ShippingLine which has the `isEvent` flag set to true.
 */
export class EventShippingLineAssignmentStrategy implements ShippingLineAssignmentStrategy {
    assignShippingLineToOrderLines(
        ctx: RequestContext,
        shippingLine: ShippingLine,
        order: Order,
    ): OrderLine[] | Promise<OrderLine[]> {
        if (shippingLine.shippingMethod.customFields.isEvent) {
            return order.lines.filter(l => l.productVariant.customFields.isEvent);
        } else {
            return order.lines.filter(l => !l.productVariant.customFields.isEvent);
        }
    }
}