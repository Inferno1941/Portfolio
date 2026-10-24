import http from "node:http";
import handler from "./handler.js";
http
  .createServer(handler)
  .listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
    console.log(`Portfolio API listening on port ${process.env.PORT || 3001}`),
  );
