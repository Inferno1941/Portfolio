import { motion } from "motion/react";
import { fadeUp } from "./motionPresets";

export default function Reveal({ children, amount = 0.2, ...props }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={fadeUp}
      {...props}
    >
      {children}
    </motion.div>
  );
}
