"use strict";
/*
 * Request handlers
 *
 */
// Internal Dependencies
const _data = require("./data.js");
const helpers = require("./helpers.js");

// Define the handlers
let handlers = {};

// Sample handlers
handlers.about = (data, callback) => {

    // Callback an HTTP status code, and payload object
    callback(200, {
        "name"  : "About handlers",
        "Group" : "Home"
    });
};

handlers.projects = (data, callback) => {

    callback(200, {
        "name"  : "Project handlers",
        "Group" : "Project"
    });
};

handlers.blog = (data, callback) => {

    callback(200, {
        "name"  : "Blog handlers",
        "Group" : "Blog"
    });
};

// Not found handlers
handlers.notFound = (data, callback) =>{

    return callback(404, {
        "message": `Your request: with method "${data.method}" and path: "${data.trimmedPath}" was unaccepted`,
    });
}

// Users
handlers.users = (data, callback) => {

    const acceptableMethod  = ["post", "get", "put", "delete"];

    const firedMethod = acceptableMethod[acceptableMethod.indexOf(data.method)];
    const dataMethod =  data.method

    // const checkLog = {
    //     logFired: console.log("firedMethod:", firedMethod),
    //     logMethod: console.log("data.method:", dataMethod)
    // };
    // console.log(checkLog)

    if (acceptableMethod.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    }
    else {
        return callback(405, {
            "Error": "handlers does not exist",
            "message": `Your request: "${data.method}" was unaccepted`
        });
    };
};

// _users container
handlers._users = {}

/*
 * Example request on Postman:
 * POST | localhost:8082/users
 *
 * Body:
 * {
 *   "firstName"     : "Jhon",
 *   "lastName"      : "Smith",
 *   "phone"         : "1234567890122",
 *   "password"      : "thisIsAPassword",
 *   "tosAgreement"  : true
 * }
 *
 */

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional: none
handlers._users.post = (data, callback) => {

    const firstName = typeof(data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() :
        false;
    const lastName = typeof(data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() :
        false;
    //@TODO Use number instead string; I get an error use number
    const phone = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length >= 11 ?
        data.payload.phone.trim() :
        false;
    const password = typeof(data.payload.password) === "string" && data.payload.password.trim().length > 0 ?
        data.payload.password.trim() :
        false;
    const tosAgreement = typeof(data.payload.tosAgreement) === "string" && data.payload.tosAgreement.trim().length > 0 ?
        data.payload.tosAgreement.trim() :
        false;

    const hashedPassword = helpers.hash(password);

    const userObject = {
        firstName,
        lastName,
        phone,
        hashedPassword,
        tosAgreement: true
    };

    const createDataUsers = () => {

        if(!hashedPassword) {
            return callback(500, {
                "error code": "500",
                "error message": "password not hashed"
            });
        }
        else {
            _data.create("users", phone, userObject, err => {

                if (err) {
                    console.log(err);
                    return callback(500, {
                        "error code": "500",
                        "error message": "could not crete new users, it may exists",
                        "payload": data.payload
                    });
                }
                else {
                    return callback(200, {
                        "success code": 200,
                        "200": `user has been created with phone number: ${phone}`
                    });
                };
            });
        };
    };

    const readDataUsers = () => {

        _data.read("users", phone, (err, data) => {

            // it should return err, cause file not exist, if exist callback(400)
            if(err){
                // console.log("readDataUsers: err", err)
                // console.log("readDataUsers: data", phone)
                return createDataUsers();
                // console.log(err)
                // callback(200, {
                //     "200": "success read data it's not exists"
                // })
            }
            else {
                console.log("readDataUsers error:", err)
               return callback(400, {
                    "error code": 400,
                    "error message": `User with phone: ${phone} has registered `
                });
            };
        })
    };

    if (!firstName && !lastName && !phone && !password && !tosAgreement) {
        return callback(400,{
            "error code": "400",
            "error message": "Missing required fields",
            "missing fields": data.payload
        });
    }
    else {
        return readDataUsers();
        // console.log(data.payload)
        // callback(200, {
        //     "payload": data.payload
        // });
    };
};

/*
 * Example request query on Postman:
 * GET | localhost:8082/users?phone=1234567890122
 *
 */

// User - GET
// Required data: phone
// Optional: none
// @TODO only let authenticated user can access their object. Don't let other users access anyone elses
handlers._users.get = (data, callback) => {

    // Check phone number is valid from query
    const phone = typeof(data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim().length >= 11 ?
        data.queryStringObject.phone.trim() :
        false;

    const readPhone = () => {

        _data.read("users", phone, (err, data) => {

            if (err && data) {
                console.log("readPhone data:" ,err)
                callback(404, {
                    "error code": 404,
                    "error message": "phone was not registered",
                    "query": data
                });
            }
            else {
                // Remove the hashed password from the user object before returning it to requester
                delete data.hashedPassword;
                callback(200, {
                    "success code": 200,
                    "success message": "phone number was valid",
                    "user data": data
                });
            };
        });
    };

    if (!phone) {
        callback(400, {
            "error code": 400,
            "requested method": data.method.toUpperCase(),
            "requested url": data.trimmedPath,
            "url query": data.queryStringObject,
            "error message": "Missing required field",
            "hint": "input the correct phone number",
        });
    }
    else {
        return readPhone();
    };

};
// User - PUT
// Required data: phone
// Optional data: firstName, lastName, password | at least one must be specified
// @TODO only let authenticated user can update their own object. Don't let other users update access anyone elses
handlers._users.put = (data, callback) => {

    // Check phone number is valid from payload
    const phone = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length >= 11 ?
        data.payload.phone.trim() :
        false;

    // Check for optional field
    const firstName = typeof(data.payload.firstName) === "string" && data.payload.firstName.trim().length > 0 ?
        data.payload.firstName.trim() :
        false;
    const lastName = typeof(data.payload.lastName) === "string" && data.payload.lastName.trim().length > 0 ?
        data.payload.lastName.trim() :
        false;
    const password = typeof(data.payload.password) === "string" && data.payload.password.trim().length > 0 ?
        data.payload.password.trim() :
        false;

    const storeUpdate = (err, userData) => {

        _data.update("users", phone, userData, err => {

            if (err) {
                console.log(err);
                callback(500, {
                    "error code": 500,
                    "error message": "Could not update the user",
                });
            }
            else {
                console.log(err);
                callback(200, {
                    "success code": 200,
                    "succes message": ` Success Update user with phone number ${userData.phone}`,
                });
            };

        });
    };

    const updateField = (err, userData) => {

        if (firstName) {
             userData.firstName = firstName
        };

        if (lastName) {
             userData.lastName = lastName;
        };

        if (password) {
            userData.password = helpers.hash(password);
        };

        return storeUpdate(err, userData);
    };

    const readPhone = () => {

        _data.read("users", phone, (err, userData) => {

            if (err && userData) {
                console.log("readPhone data:" ,err);
                callback(404, {
                    "error code": 404,
                    "error message": "The specified user does not exist",
                    "payload": data.payload,
                    userData
                });
            }
            else {
                return updateField(err, userData);

                // if (firstName) {
                //     userData.firstName = firstName
                // };

                // if (lastName) {
                //     userData.lastName = lastName;
                // };

                // if (password) {
                //     userData.password = helpers.hash(password);
                // };

                // console.log(err,userData)

                // callback(200,{
                //     userData,
                //     err
                // })
                // console.log(userData)
                // return callback(200, {
                //     data: data.payload,
                //     userData
                // });
            };
        });
    };

    const readField = () => {

        if (firstName || lastName || password) {
            return readPhone();
        }
        else {
            callback(400, {
                "error code": 400,
                "error message": "No field to update",
                "hint": "Please update on of those: 'firstName' or 'lastName' or 'password'",
                "data":  data.payload
            });
        };
    };

    // Error if the phone is invalid
    if (!phone) {
        callback(400, {
            "error code": 400,
            "error message": "Missing required field",
            "hint": "input the correct phone number",
            "data": data
        });
    }
    else {
        return readField();
    };
};

    // const readPhone = () => {

    //     if (!firstName || !lastName || !password) {
    //         callback(400, {
    //             "error code": 400,
    //             "error message": "Missing field to update",
    //             "hint": "Please update on of those firstName or lastName or password",
    //             "data":  data
    //         });

    //     }
    //     else {
    //         _data.read("users", phone, (err, userData) => {

    //             if (err && userData) {
    //                 console.log("readPhone data:" ,err)
    //                 callback(400, {
    //                     "error code": 400,
    //                     "error message": "The specified user does not exist",
    //                     "query": data
    //                 });
    //             }
    //             else {
    //                 // Update the field necessary
    //                 if (firstName) {
    //                     userData.firstName = firstName;
    //                 };

    //                 if (lastName) {
    //                     userData.lastName = lastName;
    //                 };

    //                 if (password) {
    //                     userData.hashedPassword = helpers.hash(password)
    //                 };

    //                 // Store new update
    //                 return storeUpdate(userData);
    //             };
    //         });
    //     };
    // };
        // // Error if nothing is sent to update
        // if (firstName || lastName || password) {

        //     // Lookup the user
        //     _data.read("users", phone, (err, userData) => {

        //     });
        // }
        // else {

        // }
                // if (!err && userData) {

                //     // Update the field necessary
                //     if (firstName) {
                //         userData.firstName = firstName;
                //     };

                //     if (lastName) {
                //         userData.lastName = lastName;
                //     };

                //     if (password) {
                //         userData.hashedPassword = helpers.hash(password)
                //     };

                //     _data.update("users", phone, userData, err => {

                //         if(!err) {
                //             callback(200, {
                //                 "success code": 200,
                //                 "success message": "Update users was success",
                //                 userData
                //             })
                //         }
                //         else {
                //             console.log(err)
                //             return callback(500, {
                //                 "error code": 500,
                //                 "error message": "Could not update the users",
                //                 userData
                //             })
                //         }
                //     })
                // }
                // else {
                //     callback(400, {
                //         "error code": 400,
                //         "error message": "Missing required field",
                //         "hint": "input the correct phone number",
                //         "data": data
                //     });
                // };

    // const storeUpdate = (userData) => {

    //     _data.update("users", phone, userData, err => {

    //         if (err) {
    //             console.log("storeUpdate:", err);
    //             callback(500, {
    //                 "error code": 500,
    //                 "error message": "Could not update the user",
    //                 "data": data
    //             });
    //         }
    //         else {
    //             callback(200, {
    //                 "success code": 200,
    //                 "success message": "Success update specified user",
    //                 "data":  data
    //             });
    //         };
    //     });
    // };


handlers._users.delete = (data, callback) => {

    callback(200, {
        "message": `Your request: "${data.method}" was accepted`,
    });
};


module.exports = handlers;
