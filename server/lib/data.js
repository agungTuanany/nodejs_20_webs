/*
 * Library for storing and editing data
 *
 * return .json only.
 *
 */

// Dependencies
const fs   = require ("fs")
const path = require ("path")


// Container for the module (to be exported)
let lib = {}

// Base directory pf the data folder
lib.baseDir = path.join(__dirname, "./../.data/")

// Write data to a file
lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir}${dir}/${file}.json`, "wx", (err, fileDescriptor) => {
        // If there's no error and there's fileDescriptor
        if (!err && fileDescriptor) {
            // Convert data into string
            let stringData = JSON.stringify(data)

            // Write into file and close
            fs.writeFile(fileDescriptor, stringData, err => {
                if (!err) {
                    fs.close(fileDescriptor, err => {
                        if (!err) {
                            callback(false)
                        }
                    })
                }
                else{
                    console.log("CREATE when fs.writeFile", err)
                    callback("Error writing to new file")
                }
            })
        }
        else {
            console.log ("CREATE when fs.open", err)
            callback("could not create a new file, it may exists")
        }
    })
}

// Read data from a file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, "utf-8", (err, data) => callback(err, data))
}

// Update data inside a file
lib.update = (dir, file, data, callback) => {
    // Open the file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, "r+", (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data into string
            const stringData = JSON.stringify(data)

            // Truncate the file | cut into pieces
            fs.ftruncate(fileDescriptor, err  => {
                if (!err) {
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, err => {
                        if (!err) {
                            fs.close(fileDescriptor,  err  => {
                                if (!err) {
                                    callback(false)
                                }
                                else {
                                    console.log("UPDATE when fs.close", err)
                                    callback("error CLOSING existing file")
                                }
                            })
                        }
                        else {
                            console.log("UPDATE when fs.writeFile", err)
                            callback("error WRITING existing file")
                        }
                    })
                }
                else {
                    console.log("UPDATE when fs.ftruncate", err)
                    callback("Error while truncating the file")
                }
            })
        }
        else {
            console.log("UPDATE when fs.open", err)
            callback("could not open the file for update, it may not exist")
        }
    })
}

// Deleting data inside file
lib.delete = (dir, file, callback) => {
    // // Unlink the file
    fs.unlink (`${lib.baseDir}${dir}/${file}.json`, function (err, fileDescriptor) {
        if (!err) {
            callback(false)
        }
        else {
            // console.log("DELETE when fs.unlink", err)
            callback ("Could not open file for updating, it may not exist yet")
        }
    })
}

module.exports = lib



