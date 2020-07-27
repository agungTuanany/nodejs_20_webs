const http = require ("http")

const port = 8082

const server = http.createServer((req, res) => {
    res.end ("Hello world")
})

server.listen (port, () => console.log(`The server is listening on port ${port}`))
