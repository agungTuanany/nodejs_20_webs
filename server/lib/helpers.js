/*
 * A helpers for various tasks
 *
 */

// Core Dependencies
const crypto = require("crypto");

// Internal Dependencies
const config = require("./config.js");


let helpers = {};


// Create a SHA256 hash
helpers.hash = (str) => {

    if (typeof (str) === "string" && str.length > 0) {
        const hash = crypto.createHash("sha256", config.hashingSecret).update(str).digest("hex");
        return hash;
    }
    else return false
};


// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try{
        const obj = JSON.parse(str);
        return obj;
    }
    catch (err) {
        return {};
    };
};






module.exports = helpers;
