const http = require ("http")
const url  = require ("url")

const port = 8082

const server = http.createServer((req, res) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true)

    // Get the path
    const path = parsedUrl.pathname
    const trimmedPath = path.replace(/^\/+|\/+$/g, "")

    // Get the HTTP method
    const method = req.method.toLowerCase()

    res.end ("Hello world")

    // log the request path
    console.log(`Request recieved on path: "${trimmedPath}"`)
    console.log(`Request recieved method: "${method}"`)

})

server.listen (port, () => console.log(`The server is listening on port ${port}`))
