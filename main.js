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
    const queryStringObject = JSON.parse(JSON.stringify(parsedUrl.query)) // parsedUrl.query

    // Get the headers as an object
    const header            = req.headers

    // Get the payload, if any
    const decoder           = new StringDecoder("utf-8")
    let buffer              = "" // Just placeholder for string

    // Using stream
    req.on("data", data => {
        buffer += decoder.write(data)
    })

    req.on("end", () => {
        buffer += decoder.end()

        res.end ("Hello world\n")

        // log the request path
        console.log(`Request recieved on path: "${trimmedPath}"`)
        console.log(`Request recieved method: "${method}"`)
        console.log("Query string parameters:", queryStringObject)
        console.log("Request recieved headers:", header)
        console.log("Request recieved payload", buffer)
    })


    // The request on browser
    // http://localhost:8082/app.js?foo=bad&baz=foo

})

server.listen (port, () => console.log(`The server is listening on port ${port}`))


