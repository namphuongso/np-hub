import type { CreateRequestResponse } from "./create-request-response";
import { postFormData } from "./http-client";

export type { CreateRequestResponse };

export async function createSupportRequest(
  baseUrl: string,
  formData: FormData,
): Promise<CreateRequestResponse> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/supportcenter/create-request-anonymous`;
  return postFormData<CreateRequestResponse>(endpoint, formData);
}

