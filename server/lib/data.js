"use strict"
/*
 * Library for storing and editing data
 *
 * return .json only.
 *
 */

// Dependencies
const fs   = require("fs");
const path = require("path");


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

        const stringData = JSON.stringify(data);

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

            if (err) return callback(`Error close new ${file}.json`);

            return console.log(`The ${file}.json has created`);
        });
    };
};

// Read data from a file
lib.read = (dir, file, callback) => {

    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, "utf-8", (err, data) => {

        if (err) return callback(`Error deleting ${file}, it may not exist`)

        return console.log('This the readed data:', data);
    });
};




// Update data inside a file
lib.update = (dir, file, data, callback) => {

    fs.open(`${lib.baseDir}${dir}/${file}.json`, "r+", (err, fileDescriptor) => {

        if (err && !fileDescriptor) {
            if (err.code === "ENOENT") {
                callback(`could not update "${file}.json", "${file}.json" may not exist`);
                return;
            }

            throw err;
        };

        const stringData = JSON.stringify(data);

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

            return close(fileDescriptor);
        });
    };

    const close = (fileDescriptor) => {

        fs.close(fileDescriptor, err => {

            if (err) return callback(`Error close "${file}.json"`);

            return console.log(`The "${file}.json" has been updated:`, data);
        });
    };
};

// Deleting data inside file
lib.delete = (dir, file, callback) => {

    fs.unlink (`${lib.baseDir}${dir}/${file}.json`, (err, fileDescriptor) => {

        if (err) return callback(`Could not delete "${file}.json", it may not exist yet`);

        return console.log(`The "${file}.json" has been deleted`);
    });
};

module.exports = lib;



