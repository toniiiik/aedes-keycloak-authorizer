# aedes-keycloak-authorizer&nbsp;&nbsp;[![Build Status](https://github.com/toniiiik/aedes-keycloak-authorizer/build.svg)](toniiiik/aedes-keycloak-authorizer)

A keycloak authorizer for [aedes](https://github.com/mcollina/aedes) MQTT broker loosely inspired by expressjs.


## Install

```bash
npm i -S aedes-keycloak-authorizer
```

## Example

```javascript
const aedes = require("aedes")({
  persistence: new require("aedes-persistence")()
});
const server = require("net").createServer(aedes.handle);
const port = 1883;
const Authorizer = require("aedes-keycloak-authorizer");


const authorizer = new Authorizer({})

// hook it up
aedes.authenticate = authorizer.authenticate();
aedes.authorizeSubscribe = authorizer.authorizeSubscribe();
aedes.authorizePublish = authorizer.authorizePublish();

server.listen(port, function() {
  console.log("server listening on port", port);
});
```

## API

### authorizePublish ( client, sub, callback )

all authenticated clients can publish.
TBD authorize via keycloak authorization services.

### authorizeSubscribe ( client, sub, callback )

all authenticated clients can subscribe.
TBD authorize via keycloak authorization services.

### authenticate ( client, user, password, callback )
client send token in as password. Function parse token check for the sign key and validate token. Authorizer uses `node-cache` module to cache sign keys for 1 hour. 

### printOptions ()
Prints options which can be passed to constructor
```

  ___  ___________ _____ _____                                                              
  / _ \|  ___|  _  \  ___/  ___|                                                             
 / /_\ \ |__ | | | | |__ \ `--.                                                              
 |  _  |  __|| | | |  __| `--. \                                                             
 | | | | |___| |/ /| |___/\__/ /                                                             
 \_| |_|____/|___/ \____/\____/                                                              
  _   __                _             _       ___        _   _                _              
 | | / /               | |           | |     / _ \      | | | |              (_)             
 | |/ /  ___ _   _  ___| | ___   __ _| | __ / /_\ \_   _| |_| |__   ___  _ __ _ _______ _ __ 
 |    \ / _ \ | | |/ __| |/ _ \ / _` | |/ / |  _  | | | | __| '_ \ / _ \| '__| |_  / _ \ '__|
 | |\  \  __/ |_| | (__| | (_) | (_| |   <  | | | | |_| | |_| | | | (_) | |  | |/ /  __/ |   
 \_| \_/\___|\__, |\___|_|\___/ \__,_|_|\_\ \_| |_/\__,_|\__|_| |_|\___/|_|  |_/___\___|_|   
              __/ |                                                                          
             |___/     

  Keycloak aedes Authorizer.

  Keycloak aedes Authorizer.
  available options are:
    wellKnowEndpoint:   well know discovery oidc endpoint
                        default: '/.well-known/openid-configuration',
    issuerClaim:        claim of issuer. The value is used to concat with well known endpoint
                        default: 'iss'
    clientId:           clientId used for password grand authorization
                        default: tlmd-ui
    authUrl:            token endpoint
                        default: null
    realm:              realm used for authorization. If user is specified with realm prefix (realm\usernmae) this will be overriden.
                        default: master
```

## Planned features

 - [ ] missing ip white list in conjuction with fallback authorizer
 - [ ] Whitelist of issuers

## Testing

Pull requests accepted.

TBD

```
npm install -D
npm test:ci
```


## License

MIT licensed, so have your way with it.
