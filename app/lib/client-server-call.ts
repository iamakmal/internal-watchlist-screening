export async function clientApi(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!url.startsWith("/api/") || url.startsWith("//")) {
    throw new Error("Invalid API path");
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.replace(`/login?next=${next}`);
  }

  return response;
}
