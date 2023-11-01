import winston from "winston";

import config from "../config";

import { getLogObject } from "../helpers/logHelpers";

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  silly: 5,
};

const LEVELS = Object.keys(levels);

const LOG_LEVEL = config.LOG_LEVEL;

const level = () => (LEVELS.includes(LOG_LEVEL) ? LOG_LEVEL : "http");

// Create the logger instance that has to be exported and used to log messages.
let transports = [
  new winston.transports.Console(),
  ...(config.LOG_TO_FILE
    ? [
        new winston.transports.File({
          filename: "winston_logs/error.log",
          level: "error",
        }),
        new winston.transports.File({ filename: "winston_logs/all.log" }),
      ]
    : []),
];

interface LOG_FORMATS {
  JSON: any;
  PRETTY_PRINT: any;
}

const LOG_FORMATS: LOG_FORMATS = {
  JSON: winston.format.json(),
  PRETTY_PRINT: winston.format.prettyPrint(),
};

type LOG_FORMAT = "PRETTY_PRINT" | "JSON";

const getLogFormat = () =>
  Object.keys(LOG_FORMATS).includes(config.LOG_FORMAT) ? (config.LOG_FORMAT as LOG_FORMAT) : "PRETTY_PRINT";

const winstonLogger = winston.createLogger({
  level: level(),
  levels,
  format: LOG_FORMATS[getLogFormat()],
  transports,
});

const logger = {
  error: (message: string, data?: any) => winstonLogger.error(message, getLogObject(data, "error")),
  warn: (message: string, data?: any) => winstonLogger.warn(message, getLogObject(data, "warn")),
  info: (message: string, data?: any) =>
    winstonLogger.info(message, getLogObject(data, "info", config.LOG_SENSITIVE_DATA)),
  http: (message: string, data?: any) => winstonLogger.http(message, getLogObject(data, "http")),
  debug: (message: string, data?: any) => winstonLogger.debug(message, getLogObject(data, "debug")),
  silly: (message: string, data?: any) => winstonLogger.silly(message, getLogObject(data, "silly")),
};

export default logger;
