import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Pencil,
  LayoutGrid,
  Rows3,
  PanelsTopLeft,
  LogOut,
  Check,
  ImagePlus,
  X,
  ExternalLink,
  Save,
} from "lucide-react";
import { api } from "../api";
import { MAX_IMAGE_BYTES } from "../data/imageLimits";
import Projects from "./Projects";
import Portfolio from "./Portfolio";
import ContentEditor from "./ContentEditor";
import { validateSite } from "../data/site";
const layouts = [
  {
    id: "grid",
    name: "Classic grid",
    description: "Balanced, two-column project cards.",
    Icon: LayoutGrid,
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "A featured first project with room to shine.",
    Icon: PanelsTopLeft,
  },
  {
    id: "list",
    name: "Showcase list",
    description: "Wide rows with image and story side by side.",
    Icon: Rows3,
  },
];
const blank = () => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  tag: "",
  stack: [],
  image: "",
  link: "",
  published: false,
});
export default function Admin({ path }) {
  const [content, setContent] = useState(null);
  const [auth, setAuth] = useState("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("projects");
  const [edit, setEdit] = useState(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    api("admin")
      .then((data) => {
        setContent(data);
        setAuth("signed-in");
      })
      .catch((e) => {
        setAuth("signed-out");
        if (e.status !== 401)
          setError(
            "Unable to connect to the server. Start it with npm run dev.",
          );
      });
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (dirty || edit) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, edit]);
  function update(value) {
    setContent(value);
    setDirty(true);
    setNotice("");
  }
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("login", {
        method: "POST",
        body: JSON.stringify({ email, password, path }),
      });
      setContent(await api("admin"));
      setPassword("");
      setAuth("signed-in");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      validateSite(content.site);
      const saved = await api("admin", {
        method: "PUT",
        body: JSON.stringify(content),
      });
      setContent(saved);
      setDirty(false);
      setNotice("Changes saved. Your portfolio is up to date.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (dirty && !confirm("Discard unsaved changes and sign out?")) return;
    setBusy(true);
    try {
      await api("logout", { method: "POST", body: "{}" });
      setContent(null);
      setDirty(false);
      setAuth("signed-out");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function move(index, direction) {
    const projects = [...content.projects];
    [projects[index], projects[index + direction]] = [
      projects[index + direction],
      projects[index],
    ];
    update({ ...content, projects });
  }
  if (auth === "loading")
    return (
      <div className="login-page" role="status">
        Opening your studio…
      </div>
    );
  if (auth === "signed-out")
    return (
      <main className="login-page">
        <a className="back-link" href="/">
          <ArrowLeft size={16} /> Back to portfolio
        </a>
        <form className="login-card" onSubmit={login}>
          <a className="brand" href="/">
            tk<span>.</span>
          </a>
          <div className="eyebrow">YOUR CREATIVE SPACE</div>
          <h1>Welcome to Studio.</h1>
          <p>Manage your work. Make it your own.</p>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in to your studio"}{" "}
            <ArrowLeft className="rotate" size={16} />
          </button>
          <small>Protected access · Your portfolio’s control room</small>
        </form>
      </main>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand" href="/">
          tk<span>.</span> <small>studio</small>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Studio navigation">
          <button
            className={tab === "projects" ? "active" : ""}
            onClick={() => setTab("projects")}
          >
            <LayoutGrid size={18} /> Projects{" "}
            <span>{content.projects.length}</span>
          </button>
          <button
            className={tab === "content" ? "active" : ""}
            onClick={() => setTab("content")}
          >
            <Pencil size={18} /> Page content
          </button>
          <button
            className={tab === "appearance" ? "active" : ""}
            onClick={() => setTab("appearance")}
          >
            <PanelsTopLeft size={18} /> Appearance
          </button>
          <button
            className={tab === "preview" ? "active" : ""}
            onClick={() => setTab("preview")}
          >
            <ExternalLink size={18} /> Preview
          </button>
        </nav>
        <div className="sidebar-bottom">
          <p>
            A little space for
            <br />
            <strong>your next big idea.</strong>
          </p>
          <a href="/" target="_blank" rel="noreferrer">
            View portfolio <ExternalLink size={15} />
          </a>
          <button onClick={logout} disabled={busy}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <span>
            Workspace <span className="slash">/</span>{" "}
            {tab === "projects"
              ? "Projects"
              : tab === "appearance"
                ? "Appearance"
                : tab === "content"
                  ? "Page content"
                  : "Preview"}
          </span>
          <div>
            <span className="save-status">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <button
              className="button primary small"
              onClick={save}
              disabled={busy || !dirty}
            >
              <Save size={15} />
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </header>
        <div className="admin-body" inert={busy}>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="notice success" role="status">
              <Check size={16} />
              {notice}
            </p>
          )}
          <div className="admin-title">
            <div>
              <div className="eyebrow">MAKE IT YOURS</div>
              <h1>
                {tab === "projects"
                  ? "Your projects"
                  : tab === "appearance"
                    ? "A layout for your work."
                    : tab === "content"
                      ? "Your words. Your story."
                      : "Looking good."}
              </h1>
              <p>
                {tab === "projects"
                  ? "A home for the things you’re proud to have built."
                  : tab === "appearance"
                    ? "Choose how your projects tell their story."
                    : tab === "content"
                      ? "Edit the text and sections across your portfolio."
                      : "Preview your full portfolio with unsaved changes."}
              </p>
            </div>
            {tab === "projects" && (
              <button
                className="button primary"
                onClick={() => setEdit(blank())}
              >
                <Plus size={18} /> Add project
              </button>
            )}
          </div>
          {tab === "content" && (
            <ContentEditor
              site={content.site}
              onChange={(site) => update({ ...content, site })}
            />
          )}
          {tab === "projects" && (
            <>
              <div className="stats">
                <div>
                  <span>Total projects</span>
                  <strong>
                    {content.projects.length.toString().padStart(2, "0")}
                  </strong>
                </div>
                <div>
                  <span>Published</span>
                  <strong>
                    {content.projects
                      .filter((p) => p.published)
                      .length.toString()
                      .padStart(2, "0")}
                    <i className="status-dot" />
                  </strong>
                </div>
                <div>
                  <span>Current layout</span>
                  <strong className="stat-layout">
                    {layouts.find((l) => l.id === content.layout)?.name}
                  </strong>
                </div>
              </div>
              <div className="project-table">
                <div className="table-heading">
                  <h2>Project library</h2>
                  <span>Use the arrows to set display order</span>
                </div>
                {content.projects.length === 0 && (
                  <div className="empty-state">
                    Your next project starts here. Click “Add project” to get
                    started.
                  </div>
                )}
                {content.projects.map((p, i) => (
                  <div className="project-row" key={p.id}>
                    <div className={`table-thumbnail visual-${i % 4}`}>
                      {p.image ? (
                        <img src={p.image} alt="" />
                      ) : (
                        <LayoutGrid size={24} />
                      )}
                    </div>
                    <div className="row-details">
                      <strong>{p.title}</strong>
                      <span>{p.tag || "Uncategorized"}</span>
                    </div>
                    <span className={`badge ${p.published ? "published" : ""}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Move ${p.title} up`}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Move ${p.title} down`}
                        disabled={i === content.projects.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Edit ${p.title}`}
                        onClick={() => setEdit({ ...p })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        aria-label={`Delete ${p.title}`}
                        onClick={() => {
                          if (
                            confirm(
                              `Delete “${p.title}”? Save changes to apply this deletion.`,
                            )
                          )
                            update({
                              ...content,
                              projects: content.projects.filter(
                                (item) => item.id !== p.id,
                              ),
                            });
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="admin-tip">
                Your edits stay in this workspace until you select{" "}
                <strong>Save changes</strong>.
              </p>
            </>
          )}
          {tab === "appearance" && (
            <>
              <div className="layout-options">
                {layouts.map(({ id, name, description, Icon }) => (
                  <button
                    key={id}
                    className={`layout-option ${content.layout === id ? "selected" : ""}`}
                    aria-pressed={content.layout === id}
                    onClick={() => update({ ...content, layout: id })}
                  >
                    <div className={`layout-mini mini-${id}`}>
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="layout-name">
                      <Icon size={18} />
                      <strong>{name}</strong>
                      {content.layout === id && <Check size={18} />}
                    </div>
                    <p>{description}</p>
                  </button>
                ))}
              </div>
              <h2 className="preview-title">Live preview</h2>
              <Projects
                projects={content.projects.filter((p) => p.published)}
                layout={content.layout}
              />
            </>
          )}
          {tab === "preview" && (
            <div className="portfolio-preview">
              <Portfolio content={content} preview />
            </div>
          )}
        </div>
      </main>
      {edit && (
        <ProjectEditor
          project={edit}
          onClose={() => setEdit(null)}
          onSave={(project) => {
            update({
              ...content,
              projects: content.projects.some((p) => p.id === project.id)
                ? content.projects.map((p) =>
                    p.id === project.id ? project : p,
                  )
                : [...content.projects, project],
            });
            setEdit(null);
          }}
        />
      )}
    </div>
  );
}
function ProjectEditor({ project, onClose, onSave }) {
  const [draft, setDraft] = useState(project);
  const [stack, setStack] = useState(project.stack.join(", "));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const dialog = useRef(null);
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    return () => el.close();
  }, []);
  const field = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > MAX_IMAGE_BYTES
    ) {
      setError("Choose a JPG, PNG, or WebP image 600 KB or smaller.");
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Image could not be read."));
        reader.readAsDataURL(file);
      });
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = () =>
          reject(new Error("This image could not be opened."));
        img.src = image;
      });
      field("image", image);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }
  function submit(e) {
    e.preventDefault();
    const tags = stack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!draft.title.trim()) return setError("A project title is required.");
    if (tags.length > 15 || tags.some((s) => s.length > 50))
      return setError("Use up to 15 tags, each under 50 characters.");
    if (draft.link && !/^https?:\/\//i.test(draft.link))
      return setError("Use an http or https project URL.");
    onSave({ ...draft, stack: tags });
  }
  return (
    <dialog
      ref={dialog}
      aria-label="Project editor"
      className="editor-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="editor-header">
          <div>
            <div className="eyebrow">PROJECT DETAILS</div>
            <h2>
              {project.title ? "Edit project" : "Something worth sharing."}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close editor"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="editor-fields">
          <label>
            Project title
            <input
              autoFocus
              required
              maxLength={150}
              value={draft.title}
              onChange={(e) => field("title", e.target.value)}
              placeholder="What have you been building?"
            />
          </label>
          <label>
            Category
            <input
              maxLength={100}
              value={draft.tag}
              onChange={(e) => field("tag", e.target.value)}
              placeholder="e.g. Full-stack commerce"
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              maxLength={3000}
              value={draft.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="The idea, the challenge, and what you made."
            />
          </label>
          <label>
            Technologies
            <span className="field-hint">
              Separate each technology with a comma.
            </span>
            <input
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="React, Firebase, Tailwind CSS"
            />
          </label>
          <label>
            Project URL
            <input
              type="url"
              value={draft.link}
              onChange={(e) => field("link", e.target.value)}
              placeholder="https://your-project.com"
            />
          </label>
          <div>
            <label htmlFor="project-image">
              Cover image{" "}
              <span className="field-hint">
                JPG, PNG, WebP · Max 600 KB · Landscape recommended
              </span>
            </label>
            {draft.image && (
              <div className="upload-preview">
                <img src={draft.image} alt="Project cover preview" />
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => field("image", "")}
                >
                  Remove image
                </button>
              </div>
            )}
            <label className="upload-area" htmlFor="project-image">
              <ImagePlus size={25} />
              <span>
                {uploading
                  ? "Reading image…"
                  : draft.image
                    ? "Replace cover image"
                    : "Choose a cover image"}
              </span>
              <input
                id="project-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={upload}
                disabled={uploading}
              />
            </label>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => field("published", e.target.checked)}
            />
            <span>
              Publish on portfolio
              <small>Uncheck to keep this project as a private draft.</small>
            </span>
          </label>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="editor-footer">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={uploading}>
            Apply project <Check size={16} />
          </button>
        </div>
      </form>
    </dialog>
  );
}
