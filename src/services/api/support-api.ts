import type { SupportRequestPayload } from "../../types/public";
import { postJson } from "./http-client";

interface CreateRequestResponse {
  id?: string;
  message?: string;
}

export async function createSupportRequest(
  baseUrl: string,
  payload: SupportRequestPayload,
): Promise<CreateRequestResponse> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/support/requests`;
  return postJson<CreateRequestResponse>(endpoint, payload);
}
