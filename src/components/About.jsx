import { motion } from "motion/react";

function About() {
  return (
    <section id="about" className="py-28 px-6 sm:px-10 border-t border-rule">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm tracking-[0.3em] text-amber uppercase"
        >
          Who am I ?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6 text-lg text-chalk-dim leading-relaxed font-body"
        >
          <p>
         I hold a Bachelor's degree in Computer Science and Information from the <span className="text-chalk">American University of Science and Technology (AUST)</span>. During the day, I teach Mathematics and Physics to middle school students in Zahle, where I turn complex ideas into simple, practical lessons. Alongside teaching, I’m building my path as a software developer, working with technologies like React, React Native, Flutter, Firebase, and Appwrite to create practical web and mobile applications that solve real-world problems.
          </p>
          <p>
            I run{" "}
            <span className="text-chalk">Digital Builders Academy</span>, a
           teaching beginners web and mobile development from scratch using {" "}
            <span className="font-mono text-sky">React</span>,{" "}
            <span className="font-mono text-sky">Firebase</span>,{" "}
            <span className="font-mono text-sky">React Native</span>, and{" "}
           
            with React Native currently on the bench, in progress.
          </p>
         
        </motion.div>
      </div>
    </section>
  );
}

export default About;
