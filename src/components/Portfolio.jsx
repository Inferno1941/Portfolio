import { Fragment, useEffect, useRef, useState } from "react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowUpRight,
  ArrowDown,
  Asterisk,
  Code2,
  GraduationCap,
  Layers,
  ArrowRight,
  MapPin,
  Copy,
} from "lucide-react";
import Projects from "./Projects";
import Reveal from "./Reveal";
import { ease, fadeUp, stagger } from "./motionPresets";
const cardIcons = [Code2, GraduationCap, Layers];
const wordUp = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.9, ease } },
};
// Words rise from behind a mask; screen readers get the plain heading text.
function AnimatedHeading({ text, highlight }) {
  const words = (value, className) =>
    value.split("\n").map((line, l) => (
      <Fragment key={l}>
        {l > 0 && "\n"}
        {line.split(" ").map((word, w) => (
          <Fragment key={w}>
            {w > 0 && " "}
            <span className="word-mask">
              <motion.span className={`word ${className}`} variants={wordUp}>
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </Fragment>
    ));
  return (
    <motion.h1 className="editable-copy" variants={stagger(0, 0.055)}>
      <span className="visually-hidden">
        {text}
        {highlight && ` ${highlight}`}
      </span>
      <span aria-hidden="true">
        {words(text, "")}
        {highlight && <> {words(highlight, "hero-highlight")}</>}
      </span>
    </motion.h1>
  );
}
// Each layer drifts a different distance with the pointer for a sense of depth.
function Layer({ pointer, depth, className, children }) {
  const reduce = useReducedMotion();
  const x = useTransform(pointer.x, (v) => (reduce ? 0 : v * depth));
  const y = useTransform(pointer.y, (v) => (reduce ? 0 : v * depth));
  return (
    <motion.div className={`layer ${className}`} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
function HeroVisual({ profile, artwork, photo, pointer }) {
  const codeWindow = artwork.visible && (
    <div className="code-window">
      <div className="window-bar">
        <i />
        <i />
        <i />
        <span>{artwork.windowTitle}</span>
      </div>
      <pre className="code-body editable-code">{artwork.code}</pre>
    </div>
  );
  return (
    <div className={`hero-art ${photo ? "has-photo" : ""}`}>
      <Layer pointer={pointer} depth={-14} className="orbits">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
      </Layer>
      {artwork.visible && artwork.label && (
        <motion.div
          className="art-label"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {artwork.label}
        </motion.div>
      )}
      {photo && (
        <Layer pointer={pointer} depth={10} className="portrait-layer">
          <motion.div
            className="portrait-wrap"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease }}
          >
            <div className="portrait-backdrop" />
            <figure className="portrait">
              <motion.img
                src={profile.image}
                alt={profile.alt}
                initial={{ scale: 1.25, clipPath: "inset(100% 0% 0% 0%)" }}
                animate={{ scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 1.3, delay: 0.35, ease }}
              />
            </figure>
          </motion.div>
        </Layer>
      )}
      {codeWindow && (
        <Layer
          pointer={pointer}
          depth={photo ? -10 : 10}
          className={photo ? "code-layer-mini" : "code-layer"}
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, y: 50, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1, delay: photo ? 0.8 : 0.3, ease }}
          >
            {codeWindow}
          </motion.div>
        </Layer>
      )}
      {photo && profile.caption && (
        <Layer pointer={pointer} depth={22} className="caption-layer">
          <motion.div
            className="portrait-caption"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 1.15,
            }}
          >
            <span className="wave" aria-hidden="true">
              👋
            </span>
            {profile.caption}
          </motion.div>
        </Layer>
      )}
      {artwork.visible && (
        <Layer pointer={pointer} depth={22} className="badge-layer">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1, ease }}
          >
            <div className="art-badge">
              <Code2 size={22} />
              <div>
                {artwork.badgeTitle}
                <small>{artwork.badgeDescription}</small>
              </div>
            </div>
          </motion.div>
        </Layer>
      )}
      <motion.div
        className="art-star"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.1, delay: 0.9, ease }}
      >
        <span>
          <Asterisk size="1em" strokeWidth={1.6} />
        </span>
      </motion.div>
    </div>
  );
}
function Marquee({ items }) {
  // Repeat short lists so one copy is always wider than the strip.
  const copies = Math.max(1, Math.ceil(8 / Math.max(items.length, 1)));
  const set = Array.from({ length: copies }, () => items).flat();
  return (
    <div className="marquee">
      <ul className="visually-hidden">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div
        className="marquee-track"
        aria-hidden="true"
        style={{ "--marquee-duration": `${set.length * 3.2}s` }}
      >
        {[0, 1].map((copy) => (
          <div className="marquee-set" key={copy}>
            {set.map((item, i) => (
              <strong key={i}>
                {item}
                <i>
                  <Asterisk size={14} strokeWidth={2.4} />
                </i>
              </strong>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
export default function Portfolio({ content, preview = false }) {
  const {
    identity,
    profile,
    hero,
    artwork,
    toolkit,
    work,
    about,
    contact,
    footer,
  } = content.site;
  const [copyStatus, setCopyStatus] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const copyTimer = useRef();
  const mounted = useRef(true);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  const pointer = {
    x: useSpring(useMotionValue(0), { stiffness: 80, damping: 20 }),
    y: useSpring(useMotionValue(0), { stiffness: 80, damping: 20 }),
  };
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
  function trackPointer(e) {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.x.set((e.clientX - rect.left) / rect.width - 0.5);
    pointer.y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  const mail = `mailto:${contact.email}`;
  const anchor = (id) => (preview ? `#preview-${id}` : `#${id}`);
  const sectionId = (id) => (preview ? `preview-${id}` : id);
  const photo = profile.visible && Boolean(profile.image);
  const showVisual = artwork.visible || photo;
  return (
    <MotionConfig reducedMotion="user">
      <div className="portfolio-page">
        {!preview && (
          <motion.div
            className="scroll-progress"
            style={{ scaleX: progress }}
          />
        )}
        <motion.div
          className={`header-shell ${preview ? "" : "sticky"} ${scrolled && !preview ? "scrolled" : ""}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <header className="site-header wrap">
            <a
              className="brand"
              href={anchor("top")}
              aria-label={`${identity.name} home`}
            >
              {identity.brand}
              <span>.</span>
            </a>
            <nav
              aria-label={preview ? "Preview navigation" : "Main navigation"}
            >
              {work.visible && (
                <a className="nav-link" href={anchor("projects")}>
                  {identity.workLabel}
                </a>
              )}
              {about.visible && (
                <a className="nav-link" href={anchor("about")}>
                  {identity.aboutLabel}
                </a>
              )}
              {contact.visible && (
                <a href={anchor("contact")} className="nav-contact">
                  {identity.contactLabel}
                  <ArrowUpRight size={15} />
                </a>
              )}
            </nav>
          </header>
        </motion.div>
        <div id={sectionId("top")}>
          {hero.visible && (
            <section
              className={`hero wrap ${!showVisual ? "hero-no-art" : ""} ${photo ? "hero-with-photo" : ""}`}
              onPointerMove={trackPointer}
              onPointerLeave={() => {
                pointer.x.set(0);
                pointer.y.set(0);
              }}
            >
              <motion.div
                className="hero-copy"
                initial="hidden"
                animate="show"
                variants={stagger(0.15, 0.12)}
              >
                <motion.div className="eyebrow" variants={fadeUp}>
                  <span className="status-dot" />
                  {hero.eyebrow}
                </motion.div>
                <AnimatedHeading text={hero.title} highlight={hero.highlight} />
                <motion.p className="editable-copy" variants={fadeUp}>
                  {hero.description}
                </motion.p>
                <motion.div className="hero-actions" variants={fadeUp}>
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
                </motion.div>
                <motion.div className="hero-note" variants={fadeUp}>
                  <MapPin size={14} />
                  {hero.location}
                  {hero.note && (
                    <>
                      <span> / </span>
                      {hero.note}
                    </>
                  )}
                </motion.div>
              </motion.div>
              {showVisual && (
                <HeroVisual
                  profile={profile}
                  artwork={artwork}
                  photo={photo}
                  pointer={pointer}
                />
              )}
            </section>
          )}
          {toolkit.visible && (
            <Reveal className="stack-strip">
              <div className="wrap">
                <span>{toolkit.label}</span>
                <Marquee items={toolkit.items} />
              </div>
            </Reveal>
          )}
          {work.visible && (
            <section id={sectionId("projects")} className="section wrap">
              <Reveal className="section-heading">
                <div>
                  <div className="eyebrow">{work.eyebrow}</div>
                  <h2 className="editable-copy">{work.title}</h2>
                </div>
                <p className="editable-copy">{work.description}</p>
              </Reveal>
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
                <Reveal>
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
                </Reveal>
                <motion.div
                  className="about-cards"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={stagger(0.1, 0.14)}
                >
                  {about.cards.map((card, i) => {
                    const Icon = cardIcons[i % cardIcons.length];
                    return (
                      <motion.div key={i} variants={fadeUp}>
                        <Icon />
                        <h3>{card.title}</h3>
                        <p className="editable-copy">{card.description}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </section>
          )}
          {contact.visible && (
            <section id={sectionId("contact")} className="contact-section">
              <div className="contact-glow" aria-hidden="true" />
              <motion.div
                className="wrap"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger(0, 0.12)}
              >
                <motion.div className="eyebrow" variants={fadeUp}>
                  {contact.eyebrow}
                </motion.div>
                <motion.h2 className="editable-copy" variants={fadeUp}>
                  {contact.title}
                </motion.h2>
                <motion.p className="editable-copy" variants={fadeUp}>
                  {contact.description}
                </motion.p>
                <motion.div className="contact-actions" variants={fadeUp}>
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
                </motion.div>
                <p className="contact-copy-status" role="status">
                  {copyStatus}
                </p>
              </motion.div>
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
    </MotionConfig>
  );
}
