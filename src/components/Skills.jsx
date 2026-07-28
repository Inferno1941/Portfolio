import { motion } from "motion/react";

const groups = [
  {
    label: "Core stack",
    items: ["React", "Firebase", "Flutter", "React Native", "Tailwind CSS", "Git"],
  },
  {
    label: "Currently learning",
    items: ["React Native", "TypeScript", "Node.js / Express", "AppWrite"],
  },
  {
    label: "Also teach",
    items: ["Physics", "Mathematics", "Web & mobile dev fundamentals"],
  },
  
];

function Skills() {
  return (
    <section id="skills" className="py-28 px-6 sm:px-10 border-t border-rule chalk-grid">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm tracking-[0.3em] text-amber uppercase mb-14"
        >
          Toolkit
        </motion.p>

        <div className="grid sm:grid-cols-3 gap-10">
          {groups.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className="font-display text-sm text-sky mb-4">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="font-body text-chalk-dim border-b border-rule/60 pb-2"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
