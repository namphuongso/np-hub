import type {
  SupportRequestPayload,
  SupportSubmissionInput,
  SupportUser,
  SupportWidgetConfig,
} from "../../types/public";

interface MapToPayloadInput {
  config: SupportWidgetConfig;
  user: SupportUser;
  submission: SupportSubmissionInput;
}

export function mapToSupportRequestPayload(
  input: MapToPayloadInput,
): SupportRequestPayload {
  const { config, user, submission } = input;

  return {
    Requester: user.name,
    PhoneNumber: user.phoneNumber,
    Email: user.email,
    Content: submission.content,
    ProjectId: config.projectId,
    Priority: submission.priority ?? 0,
    Attachments: submission.attachments ?? [],
    Coordinators: submission.coordinators ?? [],
    EmailContacts: submission.emailContacts ?? [],
  };
}
