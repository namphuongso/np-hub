export interface SupportUser {
    name: string;
    email: string;
    phoneNumber?: string;
}

export type SupportUserPrefill = Partial<SupportUser>;

export interface SupportWidgetConfig {
    projectId?: string;
    isDev?: boolean;
    priority?: number;
    coordinators?: string[];
    emailContacts?: string[];
    toastDuration?: number | { success?: number; error?: number };
    /** Stacking order of the widget. Defaults to `10000` when omitted. */
    zIndex?: number;
    /** Custom image URL or markup for the launcher button. Takes precedence over `icon`. */
    image?: string;
    /** Custom icon URL or SVG/HTML markup for the launcher button. */
    icon?: string;
}

export interface SupportSubmissionInput {
    content?: string;
    attachments?: string[];
}

export interface SupportRequestPayload {
    Requester: string;
    PhoneNumber?: string;
    Email: string;
    Content: string;
    ProjectId?: string;
    Priority?: number;
    Attachments?: string[];
    Coordinators?: string[];
    EmailContacts?: string[];
}
