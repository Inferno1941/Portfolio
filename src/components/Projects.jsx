import { motion } from "motion/react";
import projects from "../data/projects";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function ProjectCard({ project }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative border border-rule rounded-lg p-8 bg-board-light hover:border-amber/60 transition-colors"
    >
      <p className="font-mono text-xs tracking-[0.2em] text-amber uppercase mb-4">
        {project.tag}
      </p>
      <h3 className="font-display font-bold text-2xl text-chalk mb-3">
        {project.title}
      </h3>
      <p className="text-chalk-dim leading-relaxed mb-6">
        {project.description}
      </p>
      {project.link && (
        <a
          href={project.link}
          className="inline-block text-sky hover:text-chalk underline-chalk mb-6 transition-colors"
        >
          View Project →
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-xs px-2.5 py-1 border border-rule rounded text-sky"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function Projects() {
  return (
    <section id="projects" className="py-28 px-6 sm:px-10 border-t border-rule">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm tracking-[0.3em] text-amber uppercase mb-4"
        >
          Selected work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-display font-bold text-3xl sm:text-4xl text-chalk mb-14"
        >
          Built for real classrooms and real users.
        </motion.h2>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div> 
        
      </div>
    </section>
  );
}

export default Projects;
