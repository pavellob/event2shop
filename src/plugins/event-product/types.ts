import {
    CustomProductVariantFields,
    CustomFulfillmentFields,
    CustomShippingMethodFields,
} from '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomProductVariantFields {
        isEvent: boolean;
    }
    interface CustomShippingMethodFields {
        isEvent: boolean;
    }
    interface CustomFulfillmentFields {
        eventUrls: string[] | null;
    }
}