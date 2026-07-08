export async function postJson<TResponse>(
  url: string,
  body: unknown,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as TResponse;
}
