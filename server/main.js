"use strict"

const http          = require ("http")
const https         = require ("https")
const url           = require ("url")
const StringDecoder = require ("string_decoder").StringDecoder
const fs            = require ("fs")

const handlers      = require ("./lib/handlers")
const config        = require ("./lib/config.js")
const _data         = require ("./lib/data.js")

/// XXX TEST STORING DATA XXX
// _data.create("test", "newFile", { "foo": "bar" }, err => console.log("this was the error:", `"${err}"`))
//_data.read("test", "blog", (err, data) => console.log ('this was the error', `"${err}"`, 'and this was the data', `"${data}"`))
// _data.update("test", "blog", {"BLOG": "BLOG NUMBER 1"}, err => console.log(`this was the error: ${err}`))
// _data.delete("test", "newFile", err => console.log(`this was the error: "${err}"`))


// Instantiate HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)
})

// Start HTTP server
httpServer.listen (config.httpPort, () => {
    console.log(`The server is listening on port "${config.httpPort}" in "${config.envName}" mode `)
})

// Instantiate HTTPS server
const httpsServerOptions = {
    "key": fs.readFileSync("./https/key.pem"),
    "cert": fs.readFileSync("./https/cert.pem")
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res)
})

// Start HTTPS server
httpsServer.listen (config.httpsPort, () => {
    console.log(`The server is listening on port "${config.httpsPort}" in "${config.envName}" mode `)
})

// All the server logic for HTTP and HTTPS server
const unifiedServer = (req, res) => {
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

}

// Define a request router
const router = {
    "about"    : handlers.about,
    "projects" : handlers.projects,
    "blog"     : handlers.blog
}
