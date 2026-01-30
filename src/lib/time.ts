/**
 * Returns "current time" in milliseconds since epoch.
 * Used only for expiry logic (comparing with expires_at).
 *
 * When TEST_MODE=1 and the request has header x-test-now-ms, that value
 * is treated as current time (for deterministic tests). Otherwise uses real time.
 *
 * @param headers - Request headers (from request.headers in API routes, or from headers() in Server Components). Pass null to always use real time.
 */
export function getCurrentTimeMs(headers: Headers | null): number {
  if (process.env.TEST_MODE === "1" && headers) {
    const value = headers.get("x-test-now-ms");
    if (value !== null && value !== "") {
      const ms = parseInt(value, 10);
      if (!Number.isNaN(ms)) return ms;
    }
  }
  return Date.now();
}
