/*
 * Request handlers
 *
 */

// Define the handlers
let handlers = {}

// Sample handlers
handlers.about = (data, callback) => {
    // Callback an HTTP status code, and payload object
    callback(200, {
        "name"  : "About handlers",
        "Group" : "Home"
    })
}

handlers.projects = (data, callback) => {
    callback(200, {
        "name"  : "Project handlers",
        "Group" : "Project"
    })
}

handlers.blog = (data, callback) => {
    callback(200, {
        "name"  : "Blog handlers",
        "Group" : "Blog"
    })
}

// Not found handlers
handlers.notFound = (data, callback) => callback(404)

module.exports = handlers
