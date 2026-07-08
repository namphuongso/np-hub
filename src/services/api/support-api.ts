import { postFormData } from "./http-client";

interface CreateRequestResponse {
  statusCode?: number;
  message?: string;
  data?: {
    url?: string;
    requestCode?: string;
  };
}

export async function createSupportRequest(
  baseUrl: string,
  formData: FormData,
): Promise<CreateRequestResponse> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/supportcenter/create-request-anonymous`;
  return postFormData<CreateRequestResponse>(endpoint, formData);
}

