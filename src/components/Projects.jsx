import { ArrowUpRight, Code2 } from "lucide-react";
export default function Projects({
  projects,
  layout = "grid",
  emptyMessage = "New work is on the way. Check back soon.",
}) {
  if (!projects.length)
    return <div className="empty-state">{emptyMessage}</div>;
  return (
    <div className={`project-layout layout-${layout}`}>
      {projects.map((project, index) => (
        <article className="project-card" key={project.id}>
          <div className={`project-visual visual-${index % 4}`}>
            {project.image ? (
              <img
                src={project.image}
                alt={`${project.title} preview`}
                loading="lazy"
              />
            ) : (
              <div className="project-placeholder">
                <div className="mock-browser">
                  <div className="mock-top">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="mock-content">
                    <Code2 size={30} />
                    <strong>
                      {project.title.replace(" (Under Development)", "")}
                    </strong>
                    <span>{project.stack.slice(0, 2).join(" / ")}</span>
                    <div className="mock-lines">
                      <i />
                      <i />
                      <i />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <span className="project-number">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="project-info">
            <div className="project-category">
              {project.tag.replace(/^\d+\s*·\s*/, "")}
            </div>
            <h3>
              {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer">
                  {project.title}
                  <ArrowUpRight size={22} />
                </a>
              ) : (
                project.title
              )}
            </h3>
            <p>{project.description}</p>
            <div className="tags">
              {project.stack.map((tech, i) => (
                <span key={`${tech}-${i}`}>{tech}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
