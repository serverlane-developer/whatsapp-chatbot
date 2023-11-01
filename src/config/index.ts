import dotenv from "dotenv";
dotenv.config();

import joi from "joi";

const envVarsSchema = joi
  .object()
  .keys({
    NODE_ENV: joi.string().valid("production", "development", "staging").required(),
    PORT: joi.number().positive().required(),
    LOG_LEVEL: joi.string().valid("http", "debug", "silly", "info", "warn", "error").required(),
    LOG_TO_FILE: joi.string().optional().allow(null, "").description("Should be 'true' to create local log files"),
    LOG_FORMAT: joi.string().valid("JSON", "PRETTY_PRINT").required(),
    LOG_SENSITIVE_DATA: joi.string().valid("true", "", null, "false").optional(),

    WHATSAPP_NUMBER: joi.string().required(),
    WHATSAPP_TEXT: joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: "key" } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  NODE_ENV: envVars.NODE_ENV,
  PORT: envVars.PORT,
  LOG_LEVEL: envVars.LOG_LEVEL,
  LOG_TO_FILE: envVars.LOG_TO_FILE === "true",
  LOG_FORMAT: envVars.LOG_FORMAT,
  LOG_SENSITIVE_DATA: envVars.LOG_SENSITIVE_DATA === "true",
  WHATSAPP_NUMBER: envVars.WHATSAPP_NUMBER,
  WHATSAPP_TEXT: envVars.WHATSAPP_TEXT,
};
