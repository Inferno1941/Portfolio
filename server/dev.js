import { spawn } from "node:child_process";
const children = [
  spawn(
    process.execPath,
    ["--env-file-if-exists=.env", "--watch", "server/index.js"],
    { stdio: "inherit" },
  ),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
    stdio: "inherit",
  }),
];
for (const child of children)
  child.on("exit", (code) => {
    for (const other of children) if (other !== child) other.kill();
    process.exitCode = code || 0;
  });
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => children.forEach((child) => child.kill(signal)));
