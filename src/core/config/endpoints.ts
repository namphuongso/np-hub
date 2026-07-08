declare const process: {
  env: {
    PROD_API_URL?: string;
    DEV_API_URL?: string;
    [key: string]: string | undefined;
  };
};

export const PROD_API_URL = process.env.PROD_API_URL || "https://support-api.company.com";
export const DEV_API_URL = process.env.DEV_API_URL || "https://support-api-dev.company.com";
