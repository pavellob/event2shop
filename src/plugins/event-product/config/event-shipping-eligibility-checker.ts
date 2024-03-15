import { LanguageCode, ShippingEligibilityChecker } from '@vendure/core';

export const eventShippingEligibilityChecker = new ShippingEligibilityChecker({
    code: 'event-shipping-eligibility-checker',
    description: [
        {
            languageCode: LanguageCode.en,
            value: 'Allows only orders that contain at least 1 event product',
        },
    ],
    args: {},
    check: (ctx, order, args) => {
        const eventOrderLines = order.lines.filter(l => l.productVariant.customFields.isEvent);
        return eventOrderLines.length > 0;
    },
});