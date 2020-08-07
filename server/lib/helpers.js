/*
 * A helpers for various tasks
 *
 */

// Core Dependencies
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

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


// Get the string content of a Template
helpers.getTemplate = (templateName, callback) => {

    templateName = typeof(templateName) === "string" && templateName.length > 0 ?
        templateName :
        false;

    if (!templateName) {
        callback("A valid template name was not specified");
    }
    else {
        let templatesDir = path.join(__dirname, "./../../client/");

        fs.readFile(templatesDir+templateName+".html", "utf-8", (err, str) => {

            if (err && str && str.length < 0) {
                console.log(err);
                callback("No template could be found");
            }
            else {
                callback(false, str);
            };
        });
    };
};

helpers.getStaticfile = (fileName, callback) => {
    fileName = typeof(fileName) === "string" && fileName.length > 0 ? fileName : false;

    if (fileName) {

        const publicDir = path.join(__dirname, "./../../client/");
        fs.readFile(publicDir+fileName, "utf-8", (err, data) => {

            if(err && data) {
                callback(`No file could be found \n ${err}`)
            }
            else {
                callback(false, data);
            }
        })

    }
    else {
        callback("A valid file name was not specified");
    }
}


module.exports = helpers;
