'use strict'

const keyCache = require('./key-cache')
const jwksClient = require('jwks-rsa')
const got = require('got')
const jwt = require('jsonwebtoken')


const defaultConfig = {
    wellKnowEndpoint: '/.well-known/openid-configuration',
    issuerClaim: 'iss'
}


function TokenValidator (config){
    this.keyCache = new keyCache()
    this.config = { ...(config || {}), ...defaultConfig }
}

module.exports=TokenValidator


TokenValidator.prototype.isValid = async function(token) {
    const that = this
    // if it is buffer make it string for jwt library
    token = token.toString();
    const parsedToken = jwt.decode(token, {complete: true});
    const issuer = parsedToken.payload[that.config.issuerClaim]

    const wellKnowEndpoint =  issuer + that.config.wellKnowEndpoint
    // console.log(wellKnowEndpoint)

    const signKey = await that.keyCache.get(issuer, that.getSigningKey, {
        wellKnowEndpoint: wellKnowEndpoint,
        kid: parsedToken.header.kid
    })
    
    return jwt.verify(token, signKey);
}

TokenValidator.prototype.getSigningKey = async function(options) {
    console.debug(`Request for the sign keys: ${options}`)
    const endpoints = await got(options.wellKnowEndpoint)
    // console.trace(JSON.parse(endpoints.body))
    const jwks_uri = JSON.parse(endpoints.body).jwks_uri

    console.debug(`Jwks uri: ${jwks_uri}`)

    const client = jwksClient({
        jwksUri: jwks_uri
    });

    const key = await client.getSigningKeyAsync(options.kid)
    // console.debug(key)
    return key.publicKey || key.rsaPublicKey
}