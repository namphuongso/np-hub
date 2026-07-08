export async function postFormData<TResponse>(
  url: string,
  body: FormData,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as TResponse;
}
