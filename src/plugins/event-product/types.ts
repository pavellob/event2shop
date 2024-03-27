import {
    CustomProductVariantFields,
    CustomFulfillmentFields,
    CustomShippingMethodFields,
} from '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomProductVariantFields {
        isEvent: boolean;
        externalBookingLink: string | null;
    }
    interface CustomShippingMethodFields {
        isEvent: boolean;
        externalBookingLink: string | null;
    }
    interface CustomFulfillmentFields {
        eventUrls: string[] | null;
    }
}

export interface Attendee {
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    timeZone: string;
    language: { locale: string };
    utcOffset: number;
}

export interface Organizer {
    id: number;
    name: string;
    email: string;
    username: string;
    timeZone: string;
    language: {
        locale: string;
    };
    timeFormat: string;
    utcOffset: number;
}

export interface Response {
    label: string;
    value?: string | string[];
    isHidden: boolean;
}

export interface Booking {
    triggerEvent: string;
    payload: {
        bookerUrl: string;
        team: {
            name: string;
        }
        type: string;
        title: string;
        description: string;
        additionalNotes: string;
        customInputs: Record<string, any>;
        startTime: string;
        endTime: string;
        organizer: Organizer;
        responses: Record<string, Response>;
        userFieldsResponses: Record<string, Response>;
        attendees: Attendee[];
        location: string;
        destinationCalendar: { id: number; integration: string; externalId: string; primaryEmail: string; userId: number; eventTypeId: number | null; credentialId: number }[];
        hideCalendarNotes: boolean;
        requiresConfirmation: boolean;
        eventTypeId: number;
        seatsShowAttendees: boolean;
        seatsPerTimeSlot: number;
        seatsShowAvailabilityCount: boolean;
        schedulingType: string;
        iCalUID: string;
        iCalSequence: number;
        eventTitle: string;
        eventDescription: string;
        price: number;
        currency: string;
        length: number;
        uid: string;
        bookingId: number;
        metadata: Record<string, any>;
        status: string;
    }
}
