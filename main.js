const http = require ("http")
const url  = require ("url")

const port = 8082

const server = http.createServer((req, res) => {

    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true)

    // get the path
    let path = parsedUrl.pathname
    let trimmedPath = path.replace(/^\/+|\/+$/g, "")

    res.end ("Hello world")

    // log the request path
    console.log(`Request recieved on path ${trimmedPath}`)

})

server.listen (port, () => console.log(`The server is listening on port ${port}`))
