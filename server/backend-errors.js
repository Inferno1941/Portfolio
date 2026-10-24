const messages = {
  BACKEND_FILE_ON_VERCEL:
    "Vercel is configured for local file storage. Set DATA_BACKEND=supabase in Production and redeploy.",
  BACKEND_INVALID:
    "DATA_BACKEND is invalid. Set it to supabase in Vercel Production and redeploy.",
  SUPABASE_URL_MISSING:
    "SUPABASE_URL is missing from this deployment. Add it to Vercel Production and redeploy.",
  SUPABASE_URL_INVALID:
    "SUPABASE_URL is not a valid HTTPS project URL. Correct it in Vercel Production and redeploy.",
  SUPABASE_KEY_MISSING:
    "SUPABASE_SECRET_KEY is missing from this deployment. Add the server-only key to Vercel Production and redeploy.",
  SUPABASE_AUTH:
    "Supabase rejected the server credentials. Check that SUPABASE_URL and SUPABASE_SECRET_KEY belong to the same project.",
  SUPABASE_SCHEMA:
    "The Supabase portfolio schema is missing or inaccessible. Apply the portfolio SQL migration to the configured project.",
  SUPABASE_NETWORK:
    "The deployment could not reach Supabase. Check the project URL and whether the Supabase project is paused.",
};
export function publicBackendError(error) {
  return {
    code: Object.hasOwn(messages, error.code)
      ? error.code
      : "BACKEND_UNAVAILABLE",
    error:
      messages[error.code] ||
      "The backend is unavailable. Check the Vercel function logs for the server error code.",
  };
}
