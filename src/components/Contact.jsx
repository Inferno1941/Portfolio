import { motion } from "motion/react";

function Contact() {
  return (
    <section id="contact" className="py-28 px-6 sm:px-10 border-t border-rule">
      <div className="max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm tracking-[0.3em] text-amber uppercase mb-6"
        >
          Get in touch
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display font-bold text-3xl sm:text-5xl text-chalk mb-8"
        >
          Have a project — or a class — in mind?
        </motion.h2>
        <motion.a
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          href="mailto:tarekkhouri7@gmail.com"
          className="inline-block px-8 py-4 bg-amber text-board font-display font-semibold rounded-md hover:bg-chalk transition-colors"
        >
          tarekkhouri7@gmail.com
        </motion.a>

        <p className="mt-16 font-mono text-xs text-chalk-dim tracking-widest">
          Zahle, Lebanon
        </p>
      </div>
    </section>
  );
}

export default Contact;
