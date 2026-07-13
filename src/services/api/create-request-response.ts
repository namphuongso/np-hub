export interface CreateRequestResponse {
  statusCode?: number;
  message?: string;
  totalRecord?: number;
  data?: {
    url?: string;
    requestCode?: string;
  } | null;
}

export interface SubmitToastContent {
  type: "success" | "error";
  message: string;
  statusCode?: string;
  requestCode?: string;
  url?: string;
}

const SUCCESS_FALLBACK_MESSAGE = "Yêu cầu đã được tiếp nhận thành công.";
const ERROR_FALLBACK_MESSAGE = "Có lỗi xảy ra khi gửi yêu cầu.";

export function isCreateRequestSuccess(
  result: CreateRequestResponse,
): boolean {
  if (typeof result.statusCode === "number") {
    return result.statusCode >= 200 && result.statusCode < 300;
  }
  return true;
}

export function mapCreateRequestSuccess(
  result: CreateRequestResponse,
): SubmitToastContent {
  const statusCode =
    typeof result.statusCode === "number"
      ? String(result.statusCode)
      : undefined;
  const requestCode = result.data?.requestCode?.trim() ?? "";
  const url = result.data?.url?.trim() ?? "";

  return {
    type: "success",
    message: result.message?.trim() || SUCCESS_FALLBACK_MESSAGE,
    statusCode,
    requestCode: requestCode || undefined,
    url: url || undefined,
  };
}

export function mapCreateRequestFailure(
  result: CreateRequestResponse,
): SubmitToastContent {
  const statusCode =
    typeof result.statusCode === "number"
      ? String(result.statusCode)
      : undefined;

  return {
    type: "error",
    message: result.message?.trim() || ERROR_FALLBACK_MESSAGE,
    statusCode,
  };
}

export function mapHttpClientError(error: unknown): SubmitToastContent {
  const fallbackMessage = ERROR_FALLBACK_MESSAGE;
  const rawMessage =
    error instanceof Error ? error.message : fallbackMessage;
  const matchedStatus = rawMessage.match(/Request failed \((\d+)\):/);
  const httpStatus = matchedStatus ? matchedStatus[1] : "";
  const afterColon = rawMessage.match(/Request failed \(\d+\):\s*(.*)$/s);
  const payloadText = afterColon?.[1]?.trim() ?? "";

  let parsedMessage = "";
  let bodyStatus = "";
  if (payloadText.startsWith("{")) {
    try {
      const parsed = JSON.parse(payloadText) as CreateRequestResponse;
      if (typeof parsed.statusCode === "number") {
        bodyStatus = String(parsed.statusCode);
      }
      if (typeof parsed.message === "string") {
        parsedMessage = parsed.message.trim();
      }
    } catch {
      // Ignore JSON parse error, fallback to message extraction below.
    }
  }

  if (!parsedMessage && payloadText) {
    parsedMessage = payloadText;
  }
  if (!parsedMessage) {
    parsedMessage = rawMessage || fallbackMessage;
  }

  return {
    type: "error",
    message: parsedMessage,
    statusCode: bodyStatus || httpStatus || undefined,
  };
}
