import { useEffect, useState } from "react";
import Admin from "./components/Admin";
import Portfolio from "./components/Portfolio";
import { api } from "./api";
function App() {
  const [content, setContent] = useState(null);
  const [error, setError] = useState("");
  const path = window.location.pathname;
  // The server decides whether this path is the secret admin link.
  const [isAdmin, setIsAdmin] = useState(path === "/" ? false : null);
  useEffect(() => {
    if (isAdmin === null)
      api("route", { method: "POST", body: JSON.stringify({ path }) })
        .then((r) => setIsAdmin(r.admin))
        .catch(() => setIsAdmin(false));
  }, [isAdmin, path]);
  useEffect(() => {
    if (isAdmin === false)
      api("portfolio")
        .then(setContent)
        .catch(() =>
          setError(
            "Your portfolio could not be loaded. Please refresh to try again.",
          ),
        );
  }, [isAdmin]);
  useEffect(() => {
    if (content?.site) document.title = content.site.identity.pageTitle;
  }, [content]);
  if (isAdmin) return <Admin path={path} />;
  if (error)
    return (
      <main className="wrap section">
        <p role="alert" className="notice error">
          {error}
        </p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </main>
    );
  if (!content)
    return (
      <main className="wrap section" role="status">
        Loading portfolio…
      </main>
    );
  return (
    <main>
      <Portfolio content={content} />
    </main>
  );
}
export default App;
