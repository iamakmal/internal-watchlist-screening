let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function clientApi(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!url.startsWith("/api/") || url.startsWith("//")) {
    throw new Error("Invalid API path");
  }

  let response = await fetch(url, options);

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();
console.log("refreshed", refreshed);
  if (!refreshed) {
    window.location.replace("/login");
    return response;
  }

  response = await fetch(url, options);

  if (response.status === 401) {
    window.location.replace("/login");
  }
  return response;
}
