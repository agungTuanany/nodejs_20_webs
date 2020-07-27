const http = require ("http")
const url  = require ("url")
const StringDecoder = require ("string_decoder").StringDecoder

const port = 8082

const server = http.createServer((req, res) => {

    // Get the URL and parse it
    const parsedUrl         = url.parse(req.url, true)

    // Get the path
    const path              = parsedUrl.pathname
    const trimmedPath       = path.replace(/^\/+|\/+$/g, "")

    // Get the HTTP method
    const method            = req.method.toLowerCase()

    // Get the query string as an object
    const queryStringObject =  parsedUrl.query //JSON.parse(JSON.stringify(parsedUrl.query))

    // Get the headers as an object
    const header            = req.headers

    // Get the payload, if any
    const decoder           = new StringDecoder("utf-8")
    let buffer              = "" // Just placeholder for string

    // Using stream | emit stream
    req.on("data", data => {
        buffer += decoder.write(data)
    })

    req.on("end", () => {
        buffer += decoder.end()

        // Choose the handlers this request should go to if request is not
        // found, use notFound handlers
        const choosenHandler = typeof(router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notFound


        // Construct the data object to send to the handler
        let data = {
            trimmedPath,
            queryStringObject,
            method,
            header,
            "payload": buffer
        }

        // Route the request to the handler specified in the router
        choosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) === "number" ? statusCode : 200

            payload    = typeof(payload) === "object" ? payload : {}

            // Convert the payload into a string
            const payloadString = JSON.stringify(payload)

            // Return the response
            res.setHeader("Content-Type", "application/json")
            res.writeHead(statusCode)
            res.end(payloadString)

            // log the request path
            console.log("Returning response: ", statusCode, payloadString)

        })
        // console.log(`Request recieved on path: "${trimmedPath}"`)
        // console.log(`Request recieved method: "${method}"`)
        // console.log("Query string parameters:", queryStringObject)
        // console.log("Request recieved headers:", header)
        // console.log("Request recieved payload", buffer)

        // The request on browser
        // http://localhost:8082/app.js?foo=bad&baz=foo
    })
})

server.listen (port, () => console.log(`The server is listening on port ${port}`))

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

// Define a reqest router
const router = {
    "about"    : handlers.about,
    "projects" : handlers.projects,
    "blog"     : handlers.blog
}
