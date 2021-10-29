"use strict";

const keycloakValidator = require("./utils/keycloak-validation");
const loggerInit = require("./utils/logger");
const logger = loggerInit({name: "Authorizer", pretty: true})

const mapToObj = (m) => {
  return Array.from(m).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
};

// polyfill for Map
Object.entries =
  typeof Object.entries === "function"
    ? Object.entries
    : (obj) => Object.keys(obj).map((k) => [k, obj[k]]);

/**
 * Authorizer's responsibility is to give an implementation
 * of Aedes callback of authorizations, against a JSON file.
 *
 * @param {Object} users The user hash, as created by this class
 *  (optional)
 * @api public
 */
function Authorizer(config) {
  this.keycloakValidator = new keycloakValidator(config);
  this.config = config
}
module.exports = Authorizer;

/**
 * Save actual user state to credential file
 *
 * @api public
 */
Authorizer.prototype.save = async function () {
  throw Error("read only authorizer");
};

/**
 * Initialize authorizer.
 *
 * @api public
 */
Authorizer.prototype.init = async function (force) {
  const that = this;  
  logger.debug(`Keycloak authorizer initialized`)
};

/**
 * It returns the authenticate function to plug into Aedes.
 *
 * @api public
 */
Authorizer.prototype.authenticate = function () {
  const that = this;
  return function (client, user, pass, cb) {
    // set user claims as user
    // TBD in the future use only required claims
    // client.user = {};
    that.keycloakValidator.isValid(user, pass).then(
      (claims) => {
        client.claims = claims;
        cb(null, true)
      },
      (err) => {
        cb(err, false)
      }
    );
  };
};

/**
 * It returns the authorizePublish function to plug into Aedes.
 *
 * @api public
 */
Authorizer.prototype.authorizePublish = function () {
  const that = this;
  return function (client, packet, cb) {
    if (!client.claims && that.fallback) {
      console.log("Trying with fallback authorizer")
      that.fallback.authorizePublish()(client, packet, cb)
      return
    }
    cb(null);
  };
};

/**
 * It returns the authorizeSubscribe function to plug into Aedes.
 *
 * @api public
 */
Authorizer.prototype.authorizeSubscribe = function () {
  const that = this;
  return function (client, subscription, cb) {
    if (!client.claims && that.fallback) {
      console.log("Trying with fallback authorizer")
      that.fallback.authorizeSubscribe()(client, subscription, cb)
      return
    }
    cb(null, subscription);
  };
};

/**
 * An utility function to add an user.
 *
 * @api public
 * @param {String} user The username
 * @param {String} pass The password
 * @param {String} authorizePublish The authorizePublish pattern
 *   (optional)
 * @param {String} authorizeSubscribe The authorizeSubscribe pattern
 *   (optional)
 */
Authorizer.prototype.addUser = async function (
  user,
  pass,
  authorizePublish,
  authorizeSubscribe
) {
  throw Error("read only authorizer");
};

/**
 * An utility function to delete a user.
 *
 * @api public
 * @param {String} user The username
 */
Authorizer.prototype.rmUser = function (user) {
  throw Error("read only authorizer");
};

/**
 * Print available options
 */
Authorizer.printOptions = function () {
  var options = `
  ___  ___________ _____ _____                                                              
  / _ \\|  ___|  _  \\  ___/  ___|                                                             
 / /_\\ \\ |__ | | | | |__ \\ \`--.                                                              
 |  _  |  __|| | | |  __| \`--. \\                                                             
 | | | | |___| |/ /| |___/\\__/ /                                                             
 \\_| |_|____/|___/ \\____/\\____/                                                              
  _   __                _             _       ___        _   _                _              
 | | / /               | |           | |     / _ \\      | | | |              (_)             
 | |/ /  ___ _   _  ___| | ___   __ _| | __ / /_\\ \\_   _| |_| |__   ___  _ __ _ _______ _ __ 
 |    \\ / _ \\ | | |/ __| |/ _ \\ / _\` | |/ / |  _  | | | | __| '_ \\ / _ \\| '__| |_  / _ \\ '__|
 | |\\  \\  __/ |_| | (__| | (_) | (_| |   <  | | | | |_| | |_| | | | (_) | |  | |/ /  __/ |   
 \\_| \\_/\\___|\\__, |\\___|_|\\___/ \\__,_|_|\\_\\ \\_| |_/\\__,_|\\__|_| |_|\\___/|_|  |_/___\\___|_|   
              __/ |                                                                          
             |___/     

  Keycloak aedes Authorizer.

  available options are:
    wellKnowEndpoint:   well know discovery oidc endpoint
                        default: '/.well-known/openid-configuration',
    issuerClaim:        claim of issuer. The value is used to concat with well known endpoint
                        default: 'iss'
    clientId:           clientId used for broker authentication 
                        default: tlmd-ui
    authUrl:            token endpoint
                        default: null
    realm:              realm used for authorization. If user is specified with realm prefix (realm'\\usernmae) this will be overriden.
                        default: null
  `
  console.log(options)
};

/**
 * Users
 */
Object.defineProperty(Authorizer.prototype, "users", {
  get: function () {
    return mapToObj(this._users);
  },
  set: function (users) {
    users = users || {};
    this._users = new Map(Object.entries(users));
  },
  enumerable: true,
});
