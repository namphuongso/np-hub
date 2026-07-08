import { DEV_API_URL, PROD_API_URL } from "./endpoints";

interface ResolveBaseUrlInput {
  baseUrl?: string;
  isDeveloper?: boolean;
}

export function resolveBaseUrl(input: ResolveBaseUrlInput): string {
  if (input.baseUrl && input.baseUrl.trim().length > 0) {
    return input.baseUrl.trim();
  }

  if (input.isDeveloper) {
    return DEV_API_URL;
  }

  return PROD_API_URL;
}
