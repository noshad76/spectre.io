import { createApp } from "./app";
import { env } from "./env";
import { createServer } from "http";
import { createSocketServer } from "./socket/socket-server";

const app = createApp();

const httpServer = createServer(app);

createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
