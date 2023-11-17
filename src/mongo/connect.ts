import mongoose from "mongoose";
import config from "../config";
import logger from "../utils/logger";

const { MONGO_DB_URL } = config;

const connect = async () =>
    await new Promise((resolve, reject) =>
        mongoose
        .connect(MONGO_DB_URL)
        .then((res) => {
            logger.info("Successfully Connected MongoDB", { requestId: "mongoDB" });
            return resolve(res);
        })
        .catch((err) => {
            logger.error("Error while connecting MongoDB", { err, requestId: "mongoDB" });
            return reject(err);
        })
    );

export { connect };
