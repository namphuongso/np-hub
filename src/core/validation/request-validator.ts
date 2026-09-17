import type {
    SupportSubmissionInput,
    SupportUser,
    SupportWidgetConfig,
} from '../../types/public';

export const PHONE_REGEX = /^(?:\+84|0)[0-9]{9,10}$/;

export function validateWidgetConfig(config: SupportWidgetConfig): void {
    if (
        config.projectId !== undefined &&
        config.projectId.trim().length === 0
    ) {
        throw new Error('projectId cannot be empty.');
    }
}

export function validateUser(user: SupportUser): void {
    if (!user.name?.trim()) {
        throw new Error('user.name is required.');
    }
    if (!user.email?.trim()) {
        throw new Error('user.email is required.');
    }
    if (user.phoneNumber && user.phoneNumber.trim().length > 0) {
        if (!PHONE_REGEX.test(user.phoneNumber.trim())) {
            throw new Error('Phone number is invalid.');
        }
    }
}

export function validateSubmission(input: SupportSubmissionInput): void {
    if (!input.content?.trim()) {
        throw new Error('Content is required.');
    }
}
