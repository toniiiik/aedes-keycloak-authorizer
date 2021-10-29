"use strict";

const pino = require("pino");

const prettyOptions = {
  levelFirst: true, // shwo level
  ignore: "pid,hostname,name", // params to ignore in the output
  translateTime: true, // shwo time string instead of timestamp
};

module.exports = function initLogger(options) {
  return pino({
    name: options.name || "keycloak-authorizer",
    level: options.level || process.env['KEYCLOAK_AUTHORIZER_LOG_LEVEL'] || "info",
    prettyPrint: options.pretty ? prettyOptions : false,
  });
};
