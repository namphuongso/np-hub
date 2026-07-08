import type {
  SupportSubmissionInput,
  SupportUser,
  SupportWidgetConfig,
} from "../../types/public";

export function validateWidgetConfig(config: SupportWidgetConfig): void {
  if (config.projectId !== undefined && config.projectId.trim().length === 0) {
    throw new Error("projectId cannot be empty.");
  }
}

export function validateUser(user: SupportUser): void {
  if (!user.name?.trim()) {
    throw new Error("user.name is required.");
  }
  if (!user.email?.trim()) {
    throw new Error("user.email is required.");
  }
  if (!user.phoneNumber?.trim()) {
    throw new Error("user.phoneNumber is required.");
  }
}

export function validateSubmission(input: SupportSubmissionInput): void {
  if (!input.content?.trim()) {
    throw new Error("Content is required.");
  }
}
