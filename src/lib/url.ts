/**
 * Base URL for paste links (e.g. https://your-app.vercel.app).
 * Used in POST /api/pastes response url field.
 */
export function getBaseUrl(): string {
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }
  return "";
}
