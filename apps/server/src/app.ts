import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import roomsRoutes from "./routes/rooms.routes";
import { errorHandler } from "./middleware/error-handler";
import { cleanupExpiredRooms } from "./jobs/cleanupExpiredRooms";
let cleanupScheduled = false;

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_, res) => {
    res.json({ status: "ok", service: "spectre.io" });
  });

  app.use("/api/rooms", roomsRoutes);

  app.use(errorHandler);
  if (!cleanupScheduled) {
    cleanupScheduled = true;
    setInterval(
      () => {
        cleanupExpiredRooms().catch(console.error);
      },
      1000 * 60 * 1,
    );
  }

  return app;
};
