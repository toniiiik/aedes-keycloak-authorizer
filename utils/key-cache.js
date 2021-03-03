'use strict'


const nodeCache=require('node-cache')

function KeyCache(options){
    this.nodeCache = new nodeCache();
}

module.exports=KeyCache


KeyCache.prototype.get = async function (key, load_function, options, ttl) {
    const that = this

    // key is cached.
    if (that.nodeCache.has(key)) {
        console.debug(`Cache hits key: ${key}`)
        return this.nodeCache.get(key)
    }

    console.debug(`No cache for key: ${key}`)
    // console.trace(options)
    // key is not cached or do not exists
    const valueToCache = await load_function(options);
    ttl = ttl || 60 * 60; //cache for 1 hour by default

    that.nodeCache.set(key, valueToCache);

    // console.debug(`Public key is: ${valueToCache}`)

    return valueToCache;
}