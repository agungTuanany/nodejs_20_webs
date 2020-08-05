"use strict"
/*
 * Library for storing and editing data
 *
 * return .json only.
 *
 * XXX TEST STORING DATA XXX
 * _data.create("test", "newFile", { "foo": "bar" }, err => console.log(`this was the error: '${err}'`))
 * _data.read("test", "newFile", (err, data) => console.log (` this was the error: "${err}"`))
// _data.update("test", "newFile", {"BLOG": "BLOG NUMBER 1"}, (err, data) => console.log(`this was the error: '${err}' and data ${data}`))
 * _data.delete("test", "newFile", err => console.log(`this was the error: '${err}'`))
 */

// Core Dependencies
const fs   = require("fs");
const path = require("path");

// Internal Dependencies
const helpers = require("./helpers.js");

// Container for the module (to be exported)
let lib = {};

// Base directory pf the data folder
lib.baseDir = path.join(__dirname, "./../.data/");

// Write data to a file
lib.create = async (dir, file, data, callback) => {

    fs.open(`${lib.baseDir}${dir}/${file}.json`, "wx", (err, fileDescriptor) => {

        if (err && !fileDescriptor) {
            if (err.code === "EEXIST") {
                callback(`could not create "${file}.json", "${file}.json" already exist`);
                return;
            };

            throw err;
        };

        const stringData = JSON.stringify(data, null, 4);

        return write(fileDescriptor, stringData);
    });

    const write = (fileDescriptor, stringData) => {

        fs.write(fileDescriptor, stringData, err => {

            if (err) return callback(`Error writing "${file}.json" to new file`);

            return close(fileDescriptor);

        });
    };

    const close = (fileDescriptor) => {

        fs.close(fileDescriptor, err => {

            if (err) {
                return callback(`Error close new ${file}.json`);
            }
            else {
                console.log("createDataUsers:", data);
                callback(false);
                return;
            };
        });
    };
};

// Read data from a file
lib.read = (dir, file, callback) => {

    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, "utf-8", (err, data) => {

        if (!err && data ){
            const parsedData = helpers.parseJsonToObject(data)
            callback(false, parsedData)
            return;
        }
        else {
            return callback(`Error read ${file}.json, it may not exist`, err, data);
        };
    });
};




// Update data inside a file
lib.update = (dir, file, data, callback) => {

    fs.open(`${lib.baseDir}${dir}/${file}.json`, "r+", (err, fileDescriptor) => {

        if (err && fileDescriptor) {
            if (err.code === "ENOENT") {
                callback(`could not create "${file}.json", "${file}.json" already exist`);
                return;
            };

            throw err;
        };

        const stringData = JSON.stringify(data, null, 4);

        return truncate(fileDescriptor, stringData);
    });

    const truncate = (fileDescriptor, stringData) => {

        fs.ftruncate(fileDescriptor, err => {

            if (err) return callback(`Error while truncating the ${file}`);

            return writeFile(fileDescriptor, stringData);
        });
    };

    const writeFile = (fileDescriptor, stringData) => {

        fs.writeFile(fileDescriptor, stringData, err => {

            if (err) return callback(`Error writing to existing "${file}.json"`);

            return close(fileDescriptor, stringData);
        });
    };

    const close = (fileDescriptor, stringData) => {

        fs.close(fileDescriptor, err => {

            if (err) return callback(`Error close "${file}.json"`);

            return callback(false, stringData);
        });
    };
};

// Deleting data inside file
lib.delete = (dir, file, callback) => {

    fs.unlink (`${lib.baseDir}${dir}/${file}.json`, (err, fileDescriptor) => {

        if (err) return callback(`Could not delete "${file}.json", it may not exist yet`);

        console.log(`The "${file}.json" has been deleted`);
        callback(err)
        return
    });
};

module.exports = lib;



