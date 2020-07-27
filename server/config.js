/*
 * All Configuration
 *
 * If you want to run in production mode
 * $ NODE_ENV=production node ./server/main.js
 *
 * If you want to run in staging mode
 * $ NODE_ENV=staging node ./server/main.js
 */
let environments = {}

environments.staging = {
    "port"    : 8082,
    "envName" : "staging"
}

environments.production = {
    "port"  : 6073,
    envName : "production"
}

// Determine which environments was passed as a command-line arguments
const currentEnvironment = typeof(process.env.NODE_ENV) === "string" ? process.env.NODE_ENV.toLowerCase() : ""

// Check the current environments is one of the environments list,
// if not set default to staging
const environmentToExport = typeof(environments[currentEnvironment]) === "object" ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport
