// One easing curve keeps every entrance feeling like part of the same page.
export const ease = [0.22, 1, 0.36, 1];
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
export const stagger = (delay = 0, gap = 0.08) => ({
  hidden: {},
  show: { transition: { delayChildren: delay, staggerChildren: gap } },
});
