import { describe, expect, it } from "vitest";
import {
  isCreateRequestSuccess,
  mapCreateRequestFailure,
  mapCreateRequestSuccess,
  mapHttpClientError,
} from "../../src/services/api/create-request-response";

describe("create-request-response mapping", () => {
  it("maps success response from API sample", () => {
    const result = mapCreateRequestSuccess({
      statusCode: 200,
      message: "Successful.",
      totalRecord: 0,
      data: {
        url: "https://hotro.azurewebsites.net/yeu-cau/2607-230-1322",
        requestCode: "2607-230-1322",
      },
    });

    expect(result).toEqual({
      type: "success",
      message: "Successful.",
      statusCode: "200",
      requestCode: "2607-230-1322",
      url: "https://hotro.azurewebsites.net/yeu-cau/2607-230-1322",
    });
  });

  it("maps validation error response from API sample", () => {
    const result = mapCreateRequestFailure({
      statusCode: 400,
      message: "Phone number is invalid",
      totalRecord: 0,
      data: null,
    });

    expect(result).toEqual({
      type: "error",
      message: "Phone number is invalid",
      statusCode: "400",
    });
  });

  it("parses HTTP 400 error body from http client", () => {
    const error = new Error(
      'Request failed (400): {"statusCode":400,"message":"Phone number is invalid","totalRecord":0,"data":null}',
    );

    expect(mapHttpClientError(error)).toEqual({
      type: "error",
      message: "Phone number is invalid",
      statusCode: "400",
    });
  });

  it("treats non-2xx statusCode in body as failure", () => {
    expect(
      isCreateRequestSuccess({
        statusCode: 400,
        message: "Phone number is invalid",
        data: null,
      }),
    ).toBe(false);
  });
});
