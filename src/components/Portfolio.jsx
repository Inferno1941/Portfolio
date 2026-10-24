import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Code2,
  GraduationCap,
  Layers,
  ArrowRight,
  MapPin,
  Copy,
} from "lucide-react";
import Projects from "./Projects";
const cardIcons = [Code2, GraduationCap, Layers];
export default function Portfolio({ content, preview = false }) {
  const { identity, hero, artwork, toolkit, work, about, contact, footer } =
    content.site;
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimer = useRef();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(copyTimer.current);
    };
  }, []);
  // A message about an address that has since been edited would be misleading.
  useEffect(() => {
    clearTimeout(copyTimer.current);
    setCopyStatus("");
  }, [contact.email]);
  async function copyEmail() {
    clearTimeout(copyTimer.current);
    // Clearing first makes screen readers announce a repeated message again.
    setCopyStatus("");
    let message;
    try {
      await navigator.clipboard.writeText(contact.email);
      message = contact.copiedMessage;
    } catch {
      message = `${contact.copyFailedMessage} ${contact.email}`.trim();
    }
    if (!mounted.current) return;
    setCopyStatus(message);
    copyTimer.current = setTimeout(() => setCopyStatus(""), 5000);
  }
  const mail = `mailto:${contact.email}`;
  const anchor = (id) => (preview ? `#preview-${id}` : `#${id}`);
  const sectionId = (id) => (preview ? `preview-${id}` : id);
  return (
    <div className="portfolio-page">
      <header className="site-header wrap">
        <a
          className="brand"
          href={anchor("top")}
          aria-label={`${identity.name} home`}
        >
          {identity.brand}
          <span>.</span>
        </a>
        <nav aria-label={preview ? "Preview navigation" : "Main navigation"}>
          {work.visible && (
            <a href={anchor("projects")}>{identity.workLabel}</a>
          )}
          {about.visible && <a href={anchor("about")}>{identity.aboutLabel}</a>}
          {contact.visible && (
            <a href={anchor("contact")} className="nav-contact">
              {identity.contactLabel}
              <ArrowUpRight size={15} />
            </a>
          )}
        </nav>
      </header>
      <div id={sectionId("top")}>
        {hero.visible && (
          <section
            className={`hero wrap ${!artwork.visible ? "hero-no-art" : ""}`}
          >
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" />
                {hero.eyebrow}
              </div>
              <h1 className="editable-copy">
                {hero.title}
                {hero.highlight && (
                  <>
                    {" "}
                    <span>{hero.highlight}</span>
                  </>
                )}
              </h1>
              <p className="editable-copy">{hero.description}</p>
              <div className="hero-actions">
                {work.visible && hero.workButton && (
                  <a className="button primary" href={anchor("projects")}>
                    {hero.workButton}
                    <ArrowDown size={17} />
                  </a>
                )}
                {hero.contactButton && (
                  <a
                    className="text-link"
                    href={contact.visible ? anchor("contact") : mail}
                  >
                    {hero.contactButton}
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </div>
              <div className="hero-note">
                <MapPin size={14} />
                {hero.location}
                {hero.note && (
                  <>
                    <span> / </span>
                    {hero.note}
                  </>
                )}
              </div>
            </div>
            {artwork.visible && (
              <div className="hero-art" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="art-label">{artwork.label}</div>
                <div className="code-window">
                  <div className="window-bar">
                    <i />
                    <i />
                    <i />
                    <span>{artwork.windowTitle}</span>
                  </div>
                  <pre className="code-body editable-code">{artwork.code}</pre>
                </div>
                <div className="art-badge">
                  <Code2 size={22} />
                  <div>
                    {artwork.badgeTitle}
                    <small>{artwork.badgeDescription}</small>
                  </div>
                </div>
                <div className="art-star">✳</div>
              </div>
            )}
          </section>
        )}
        {toolkit.visible && (
          <div className="stack-strip">
            <div className="wrap">
              <span>{toolkit.label}</span>
              {toolkit.items.map((item, i) => (
                <strong key={i}>{item}</strong>
              ))}
            </div>
          </div>
        )}
        {work.visible && (
          <section id={sectionId("projects")} className="section wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">{work.eyebrow}</div>
                <h2 className="editable-copy">{work.title}</h2>
              </div>
              <p className="editable-copy">{work.description}</p>
            </div>
            <Projects
              projects={content.projects.filter((p) => p.published)}
              layout={content.layout}
              emptyMessage={work.emptyMessage}
            />
          </section>
        )}
        {about.visible && (
          <section id={sectionId("about")} className="about-section">
            <div
              className={`wrap about-grid ${!about.cards.length ? "about-no-cards" : ""}`}
            >
              <div>
                <div className="eyebrow">{about.eyebrow}</div>
                <h2 className="editable-copy">{about.title}</h2>
                {about.paragraphs.map((p, i) => (
                  <p className="editable-copy" key={i}>
                    {p}
                  </p>
                ))}
                {contact.visible && about.buttonLabel && (
                  <a className="text-link" href={anchor("contact")}>
                    {about.buttonLabel}
                    <ArrowUpRight size={17} />
                  </a>
                )}
              </div>
              <div className="about-cards">
                {about.cards.map((card, i) => {
                  const Icon = cardIcons[i % cardIcons.length];
                  return (
                    <div key={i}>
                      <Icon />
                      <h3>{card.title}</h3>
                      <p className="editable-copy">{card.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        {contact.visible && (
          <section id={sectionId("contact")} className="contact-section wrap">
            <div className="eyebrow">{contact.eyebrow}</div>
            <h2 className="editable-copy">{contact.title}</h2>
            <p className="editable-copy">{contact.description}</p>
            <div className="contact-actions">
              {contact.buttonLabel && (
                <a className="button primary" href={mail}>
                  {contact.buttonLabel}
                  <ArrowRight size={18} />
                </a>
              )}
              {contact.email && contact.copyLabel && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={copyEmail}
                >
                  <Copy size={16} /> {contact.copyLabel}
                </button>
              )}
            </div>
            <p className="contact-copy-status" role="status">
              {copyStatus}
            </p>
          </section>
        )}
      </div>
      {footer.visible && (
        <footer className="wrap">
          <a className="brand" href={anchor("top")}>
            {identity.brand}
            <span>.</span>
          </a>
          <span>
            © {new Date().getFullYear()} {footer.copyright}
          </span>
          {footer.studioLabel && (
            <a href="/admin">
              {footer.studioLabel}
              <ArrowUpRight size={14} />
            </a>
          )}
        </footer>
      )}
    </div>
  );
}
