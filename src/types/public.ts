export interface SupportUser {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface SupportWidgetConfig {
  projectId: string;
  isDev?: boolean;
}

export interface SupportSubmissionInput {
  content: string;
  attachments: string[];
  priority?: number;
  coordinators?: string[];
  emailContacts?: string[];
}

export interface SupportRequestPayload {
  Requester: string;
  PhoneNumber: string;
  Email: string;
  Content: string;
  ProjectId: string;
  Priority: number;
  Attachments: string[];
  Coordinators: string[];
  EmailContacts: string[];
}
