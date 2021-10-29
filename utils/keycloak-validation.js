"use strict";

const keyCache = require("./key-cache");
const jwksClient = require("jwks-rsa");
const got = require("got");
const jwt = require("jsonwebtoken");
const axios = require("axios").default;
const qs = require("qs");
const initLogger = require("./logger");

const logger = initLogger({pretty: true});

const defaultConfig = {
  wellKnowEndpoint: "/.well-known/openid-configuration",
  issuerClaim: "iss",
  clientId: "tlmd-ui",
  realm: "master"
};

function UsernamePasswordValidator(config, cache) {
  this.keyCache = cache || new keyCache();
  this.config = config;
}

function TokenValidator(config, cache) {
  this.keyCache = cache || new keyCache();
  this.config = config;
}

function Validator(config) {
  this.keyCache = new keyCache();
  this.validators = [];
  this.config = { ...defaultConfig, ...(config || {}) };
  this.validators.push(new TokenValidator(this.config, this.keyCache));
  this.validators.push(new UsernamePasswordValidator(this.config, this.keyCache));
}

module.exports = Validator;

Validator.prototype.isValid = async function (username, password) {
  let validator = null;
  this.validators.forEach((v) => {
    logger.debug(`Visiting validator "${v.constructor.name}"`);
    if (v.canValidate(username, password)) {
      logger.debug(
        `Try to validate credentials using "${v.constructor.name}" validator`
      );
      validator = v;
    }
  });

  if (!validator) {
    throw new Error("Cloud not validate user!");
  }
  
  return validator.isValid(username, password);
};

//#region usernamepassword validator

UsernamePasswordValidator.prototype.canValidate = function (
  username,
  password
) {
  return username != "" && username != "jwt" && password != "";
};

UsernamePasswordValidator.prototype.isValid = async function (
  username,
  password
) {
  let user = username;
  let realm = this.config.realm;
  const usernameParts = username.split("\\");
  if (usernameParts.length == 2) {
    realm = usernameParts[0];
    user = usernameParts[1];
  }

  const data = {
    client_id: this.config.clientId,
    grant_type: "password",
    username: user,
    password: password,
  };

  const headers = { "content-type": "application/x-www-form-urlencoded" };

  const url = `${this.config.authUrl}/realms/${realm}/protocol/openid-connect/token`;
  try {
    logger.debug(`Authenticate against '${url}'`)
    const tokenResult = await axios.post(url, qs.stringify(data), {
      headers,
    });
    return jwt.decode(tokenResult.data.access_token);
  } catch (e) {
    throw e;
  }
};

//#endregion

//#region token validator

TokenValidator.prototype.canValidate = function (username, password) {
  return (username == "" || username == "jwt") && password != "";
};

TokenValidator.prototype.isValid = async function (username, password) {
  const that = this;
  // if it is buffer make it string for jwt library
  token = password.toString();
  const parsedToken = jwt.decode(token, { complete: true });
  const issuer = parsedToken.payload[that.config.issuerClaim];

  const wellKnowEndpoint = issuer + that.config.wellKnowEndpoint;
  // console.log(wellKnowEndpoint)

  const signKey = await that.keyCache.get(issuer, that.getSigningKey, {
    wellKnowEndpoint: wellKnowEndpoint,
    kid: parsedToken.header.kid,
  });

  return jwt.verify(token, signKey);
};

TokenValidator.prototype.getSigningKey = async function (options) {
  logger.debug(`Request for the sign keys: ${options}`);
  const endpoints = await got(options.wellKnowEndpoint);
  // console.trace(JSON.parse(endpoints.body))
  const jwks_uri = JSON.parse(endpoints.body).jwks_uri;

  logger.debug(`Jwks uri: ${jwks_uri}`);

  const client = jwksClient({
    jwksUri: jwks_uri,
  });

  const key = await client.getSigningKeyAsync(options.kid);
  // console.debug(key)
  return key.publicKey || key.rsaPublicKey;
};

//#endregion
