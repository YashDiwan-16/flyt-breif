const ADMIN_SESSION_COOKIE = "flytbdr_admin_session";
const DEFAULT_ADMIN_EMAIL = "admin@flytbase.com";
const DEFAULT_ADMIN_PASSWORD = "flytbdr-admin";
const DEFAULT_ADMIN_SESSION_TOKEN = "flytbdr-local-admin";

export function isAdminLoginValid({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return (
    email.trim().toLowerCase() === getAdminEmail().toLowerCase() &&
    password === getAdminPassword()
  );
}

export function createAdminSessionCookie() {
  return [
    `${ADMIN_SESSION_COOKIE}=${getAdminSessionToken()}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=86400",
  ].join("; ");
}

export function clearAdminSessionCookie() {
  return [
    `${ADMIN_SESSION_COOKIE}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
}

export function isAdminRequestAuthenticated(request: Request) {
  return parseCookieHeader(request.headers.get("cookie"))[ADMIN_SESSION_COOKIE] ===
    getAdminSessionToken();
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || DEFAULT_ADMIN_SESSION_TOKEN;
}

function parseCookieHeader(cookieHeader: string | null) {
  return Object.fromEntries(
    (cookieHeader ?? "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [name, ...valueParts] = cookie.split("=");

        return [name, valueParts.join("=")];
      }),
  );
}
