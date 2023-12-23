import winston from "winston";
import config from "./config/config.js";

const customeLevel = {
  levels: {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5,
  },
  colors: {
    debug: "gray",
    http: "blue",
    info: "green",
    warning: "yellow",
    error: "red",
    fatal: "red",
  },
};
let logger;

if (config.environment === "production") {
  logger = winston.createLogger({
    levels: customeLevel.levels,
    transports: [
      new winston.transports.File({
        filename: "./errors.log",
        level: "error",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.prettyPrint()
        ),
      }),
    ],
  });
} else {
  logger = winston.createLogger({
    levels: customeLevel.levels,
    transports: [
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize({ colors: customeLevel.colors }),
          winston.format.simple()
        ),
      }),
    ],
  });
}

export default logger;