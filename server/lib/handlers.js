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

/*
 * HTML handlers
 *
 */

handlers.index = (data, callback) => {

    // Reject any request except GET
    if (data.method === "get") {
        // @TODO: use svelteJS to serve; either using template engine
        // Read in a template or client-side .html as string
        helpers.getTemplate("index", (err, str) => {

            if (err && str) {
                callback(500, {
                    "error code": 500,
                    "error message": "No HTML page serve the request"
                }, "json")
            }
            else {
                // console.log("string from handlers", str);
                callback(200, str, "html");
            };
        });
    }
    else {
        callback(405, {
            "error code": 405,
            "error message": "your request unaccepted"
        }, "json");
    };
};

handlers.staticFile = (data, callback) => {

    if (data.method === "get") {
        let trimmedAssetName = data.trimmedPath.replace("client/", "").trim()

        if (trimmedAssetName.length > 0) {
            helpers.getStaticfile(trimmedAssetName, (err, data) => {

                if (!err && data) {
                    let contentType = "plain";

                    if(trimmedAssetName.indexOf(".css") > -1) {
                        contentType = "css";
                    }
                    if(trimmedAssetName.indexOf(".js") > -1) {
                        contentType = "js";
                    }

                    callback(200, data, contentType);
                }
                else {
                    callback(400,{
                        "error message": err,
                        " response data": data
                    },"json");
                    console.log(`Error: ${err}`);

                }
            })
        }
    }
    else {
        callback(405, {
            "error code": 405,
            "error message": "your request unaccepted"
        }, "json");

    }
}

// Sample handlers
handlers.about = (data, callback) => {

    // Reject any request except GET
    if (data.method === "get") {
        callback(200, {
            "name"  : "About handlers",
            "Group" : "About"
        }, "json");
    }
    else {
        callback(405, {
            "error code": 405,
            "error message": "your request unaccepted"
        }, "json");
    };
};

handlers.projects = (data, callback) => {

    // Reject any request except GET
    if (data.method === "get") {
        callback(200, {
            "name"  : "Project handlers",
            "Group" : "Project"
        }, "json");
    }
    else {
        callback(405, {
            "error code": 405,
            "error message": "your request unaccepted"
        }, "json");
    };
};

handlers.blog = (data, callback) => {

    // Reject any request except GET
    if (data.method === "get") {
        callback(200, {
            "name"  : "Blog handlers",
            "Group" : "Blog"
        }, "json");
    }
    else {
        callback(405, {
            "error code": 405,
            "error message": "your request unaccepted"
        }, "json");
    };
};

// Not found handlers
handlers.notFound = (data, callback) =>{

    return callback(404, {
        "message": `Your request: with method "${data.method}" and path: "${data.trimmedPath}" was unaccepted`,
    }, "json");
}

/*
 * JSON API handlers
 *
 */

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
        }, "json");
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
            }, "json");
        }
        else {
            _data.create("users", phone, userObject, err => {

                if (err) {
                    console.log(err);
                    return callback(500, {
                        "error code": "500",
                        "error message": "could not crete new users, it may exists",
                        "payload": data.payload
                    }, "json");
                }
                else {
                    return callback(200, {
                        "success code": 200,
                        "200": `user has been created with phone number: ${phone}`
                    }, "json");
                };
            });
        };
    };

    const readDataUsers = () => {

        _data.read("users", phone, (err, data) => {

            // it should return err, cause file not exist, if exist callback(400)
            if(err){
                return createDataUsers();
            }
            else {
                console.log("readDataUsers error:", err)
               return callback(400, {
                    "error code": 400,
                    "error message": `User with phone: ${phone} has registered `
                }, "json");
            };
        })
    };

    if (!firstName && !lastName && !phone && !password && !tosAgreement) {
        return callback(400,{
            "error code": "400",
            "error message": "Missing required fields",
            "missing fields": data.payload
        }, "json");
    }
    else {
        return readDataUsers();
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
// @TODO only let authenticated user can access their object. Don't let other users access anyone else
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
                }, "json");
            }
            else {
                // Remove the hashed password from the user object before returning it to requester
                delete data.hashedPassword;
                callback(200, {
                    "success code": 200,
                    "success message": "phone number was valid",
                    "user data": data
                }, "json");
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
        }, "json");
    }
    else {
        return readPhone();
    };

};

/*
 * Example request query on Postman:
 * PUT | localhost:8082/users
 *
 *{
 *    "firstName"     : "BBB",
 *    "phone"         : "1234567890122"
 *}
 *
 */

// User - PUT
// Required data: phone
// Optional data: firstName, lastName, password | at least one must be specified
// @TODO only let authenticated user can update their own object. Don't let other users update access anyone else
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
                }, "json");
            }
            else {
                console.log(err);
                callback(200, {
                    "success code": 200,
                    "succes message": ` Success Update user with phone number ${userData.phone}`,
                    userData
                }, "json");
            };
        });
        return;
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
                }, "json");
            }
            else {
                return updateField(err, userData);
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
            }, "json");
        };
    };

    // Error if the phone is invalid
    if (!phone) {
        callback(400, {
            "error code": 400,
            "error message": "Missing required field",
            "hint": "input the correct phone number",
            "data": data
        }, "json");
    }
    else {
        return readField();
    };
};

/*
 * Example request query on Postman:
 * DELETE | localhost:8082/users?phone=1234567890122
 *
 */

// User - DELETE
// Required field: phone
// Optional field: none
// @TODO only let authenticated user can update their own object. Don't let other users update access anyone else
// @TODO delete any other data files associated with this user
// @TODO Clean old checks with the user
handlers._users.delete = (data, callback) => {

    // Check phone number is valid from query
    const phone = typeof(data.queryStringObject.phone) === "string" && data.queryStringObject.phone.trim().length >= 11 ?
        data.queryStringObject.phone.trim() :
        false;

    const deleteUser = (err, data) => {

        _data.delete("users", phone, err => {

            if (err) {
                console.log(err);
                callback(500, {
                    "error code": 500,
                    "error message": `Could not delete the specified users with phone number ${data.phone}`,
                    data
                }, "json");
            }
            else {
                callback(200, {
                    "sucess code": 200,
                    "success message": `Success delete users with phone number: ${data.phone}`,
                    "deleted user": data,
                    err
                }, "json")
            }
        })
    }

    const readPhone = () => {

        _data.read("users", phone, (err, data) => {

            if (err && data) {
                console.log("readPhone data:" ,err)
                callback(404, {
                    "error code": 404,
                    "error message": "phone was not registered",
                    "query": err
                }, "json");
            }
            else {
                return deleteUser(err, data);
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
            "hint": "input the correct phone number in the query",
        }, "json");
    }
    else {
        return readPhone();
    };
};


module.exports = handlers;
