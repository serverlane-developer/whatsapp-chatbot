import { Server } from "http";
import logger from "./logger";

const gracefulShutdown = async (server: Server) => {
  try {
    server.close();
    process.exit();
  } catch (error: any) {
    logger.error("Error during Graceful Shutdown", { err: error });
    process.exit(1);
  }
};

export default gracefulShutdown;
