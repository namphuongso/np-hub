export const PROD_API_URL = "https://namphuong-api.azurewebsites.net";
export const DEV_API_URL = "https://namphuong-api-dev.azurewebsites.net";

export function resolveBaseUrl(input: { isDev?: boolean }): string {
  return input.isDev ? DEV_API_URL : PROD_API_URL;
}
