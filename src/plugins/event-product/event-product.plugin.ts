import { HttpModule } from "@nestjs/axios";
import { LanguageCode, PluginCommonModule, VendurePlugin } from "@vendure/core";
import { eventFulfillmentHandler } from "./config/event-fulfillment-handler";
import { eventOrderProcess } from "./config/event-order-process";
import { eventShippingEligibilityChecker } from "./config/event-shipping-eligibility-checker";
import { EventShippingLineAssignmentStrategy } from "./config/event-shipping-line-assignment-strategy";
import { CalCoService } from "./services/cal-co.service";
import { CalCoHookController } from "./controllers/cal-co.hook.controller";

/**
 * @description
 * This is an example plugin which demonstrates how to eventd support for event products.
 */
@VendurePlugin({
  imports: [
    PluginCommonModule,
    HttpModule.register({
      baseURL: "https://api.cal.com/v1/",
      params: {
        apiKey: process.env.CALCO_API_KEY,
      },
    }),
  ],
  providers: [CalCoService],
  controllers: [CalCoHookController],
  configuration: (config) => {
    config.customFields.ProductVariant.push({
      type: "boolean",
      name: "isEvent",
      defaultValue: false,
      label: [
        { languageCode: LanguageCode.en, value: "This product is event" },
      ],
      public: true,
    });
    config.customFields.ProductVariant.push({
      type: "string",
      name: "eventLink",
      nullable: true,      
      label: [
        { languageCode: LanguageCode.en, value: "Related cal.com booking for that event" },
      ],
      public: true,
    });
    config.customFields.Order.push({
      type: "string",
      name: "bookingLink",
      nullable: true,
      label: [
        { languageCode: LanguageCode.en, value: "Urls of any event purchases" },
      ],
      public: true,
    });
    config.customFields.ShippingMethod.push({
      type: "boolean",
      name: "isEvent",
      defaultValue: false,
      label: [
        {
          languageCode: LanguageCode.en,
          value: "This shipping method handles event products",
        },
      ],
      public: true,
    });
    config.customFields.Fulfillment.push({
      type: "string",
      name: "bookingLink",
      nullable: true,
      label: [
        { languageCode: LanguageCode.en, value: "Urls of any event purchases" },
      ],
      public: true,
    });
    config.shippingOptions.fulfillmentHandlers.push(eventFulfillmentHandler);
    config.shippingOptions.shippingLineAssignmentStrategy =
      new EventShippingLineAssignmentStrategy();
    config.shippingOptions.shippingEligibilityCheckers.push(
      eventShippingEligibilityChecker
    );
    config.orderOptions.process.push(eventOrderProcess);
    return config;
  },
  compatibility: "^2.0.0",
})
export class EventProductsPlugin {
  static init() {
    return EventProductsPlugin;
  }
}
