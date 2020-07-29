"use strict"
/*
 * All Configuration
 *
 * If you want to run in production mode
 * $ NODE_ENV=production node ./server/main.js
 *
 * If you want to run in staging mode
 * $ NODE_ENV=staging node ./server/main.js
 *
 * In production mode httpPort should listen on port "80",
 * $ sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
 *
 * In production mode httpsPort should listen on port "443",
 * $ sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3000
 *
 * XXX TODO XXX
 * Since I'm not used nginx, and I will use nginx after server-side and
 * client-side has established
 */
let environments = {}

environments.staging = {
    "httpPort"  : 8082,
    "httpsPort" : 8084,
    "envName"   : "staging"
}

environments.production = {
    "httpPort"  : 5000,
    "httpsPort" : 5002,
    exclusive   : true,
    envName     : "production"
}

// Determine which environments was passed as a command-line arguments
const currentEnvironment = typeof(process.env.NODE_ENV) === "string" ? process.env.NODE_ENV.toLowerCase() : ""

// Check the current environments is one of the environments list,
// if not set default to staging
const environmentToExport = typeof(environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport
