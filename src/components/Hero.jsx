import { motion } from "motion/react";

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden chalk-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-board/0 via-board/60 to-board" />

      <div className="relative max-w-5xl mx-auto px-6 sm:px-10 w-full">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm tracking-[0.3em] text-amber uppercase mb-6"
        >
           Tarek AlKhouri /
           Frontend Developer
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-6xl md:text-7xl leading-[1.05] text-chalk"
        >
          I teach the{" "}
          <span className="underline-chalk text-amber">theorem</span>
          <br />
          and I ship the{" "}
          <span className="underline-chalk text-sky">code</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 max-w-xl text-lg sm:text-xl text-chalk-dim font-body leading-relaxed"
        >
         Frontend Developer passionate about building modern, responsive, and user-friendly web applications. I specialize in creating seamless user experiences and turning complex problems into simple, elegant solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a
            href="#projects"
            className="px-6 py-3 bg-amber text-board font-display font-semibold text-sm rounded-md hover:bg-chalk transition-colors"
          >
            See the work
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border border-rule text-chalk font-display font-semibold text-sm rounded-md hover:border-amber hover:text-amber transition-colors"
          >
            Get in touch
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-chalk-dim tracking-widest"
      >
      
      </motion.div>
    </section>
  );
}

export default Hero;
