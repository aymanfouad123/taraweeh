const RAW_BASE_URL =
  process.env.SYNC_SERVER_BASE_URL ?? process.env.SYNC_SERVER_URL ?? "";

export function getUpstreamUrl(path: string): URL | null {
  if (!RAW_BASE_URL) return null;

  const trimmed = RAW_BASE_URL.endsWith("/")
    ? RAW_BASE_URL.slice(0, -1)
    : RAW_BASE_URL;

  try {
    return new URL(`${trimmed}${path}`);
  } catch {
    return null;
  }
}
