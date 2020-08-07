"use strict";

const http          = require("http");
const https         = require("https");
const url           = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const fs            = require("fs");

const handlers      = require("./lib/handlers");
const config        = require("./lib/config.js");
const helpers       = require("./lib/helpers.js");
const _data         = require("./lib/data.js");

/// XXX TEST STORING DATA XXX
// _data.create("test", "newFile", { "foo": "bar" }, err => console.log(`this was the error: '${err}'`))
// _data.read("test", "newFile", (err, data) => console.log (` this was the error: "${err}"`))
// _data.update("test", "newFile", {"BLOG": "BLOG NUMBER 1"}, (err, data) => console.log(`this was the error: '${err}' and data ${data}`))
// _data.delete("test", "newFile", err => console.log(`this was the error: '${err}'`))


// Server HTTPS server certificate
const httpsServerOptions = {
    "key": fs.readFileSync("./https/key.pem"),
    "cert": fs.readFileSync("./https/cert.pem")
};
// Instantiate HTTP server
const httpServer = http.createServer((request, response) => unifiedServer(request, response));
// Instantiate HTTPS server
const httpsServer = https.createServer(httpsServerOptions, (request, response) => unifiedServer(request, response));


// All the server logic for HTTP and HTTPS server
const unifiedServer = (request, response) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(request.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Get the HTTP method
    const method = request.method.toLowerCase();

    // Get the query string as an object
    const queryStringObject =  parsedUrl.query;                     //JSON.parse(JSON.stringify(parsedUrl.query))

    // Get the headers as an object
    const header = request.headers;

    // Get the payload, if any
    const decoder = new StringDecoder("utf-8");
    let buffer = "";                                                // Just placeholder for string

    // Using stream | emit stream
    request.on("data", data =>  buffer += decoder.write(data));

    request.on("end", () => {

        buffer += decoder.end();

        // Choose the handlers this request should go to if request is not
        // found, use notFound handlers
        let choosenHandler = typeof(router[trimmedPath]) !== "undefined" ?
            router[trimmedPath] :
            handlers.notFound;

        choosenHandler = trimmedPath.indexOf("client/") > -1 ?
            handlers.staticFile :
            choosenHandler;


        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            header,
            payload: helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        // @TODO add content-type to serve not only .json
        choosenHandler(data, (statusCode, payload, contentType) => {

            // Determine the type of response
            contentType = typeof(contentType) === "string" ? contentType : "json";


            // Determine status code
            statusCode = typeof(statusCode) === "number" ? statusCode : 200;

            // Use the payload called back the handler
            // payload    = typeof(payload) === "object" ? payload : {};

            // Convert the payload into a string
            // let payloadString = JSON.stringify(payload, null, 4);
            let payloadString = "";


            // Retrun the response-parts that with content-specific
            if (contentType === "json") {
                response.setHeader("Content-Type", "application/json");
                // Use payload called back the handler, or default to an empty object
                payload = typeof(payload) === "object" ? payload : {};
                payloadString = JSON.stringify(payload, null, 4);
            };

            if (contentType === "html") {
                response.setHeader("Content-type", "text/html");
                payloadString = typeof(payload) === "string" ? payload : "";
            };

            if (contentType === "favicon") {
                response.setHeader("Content-type", "image/x-icon");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
            };

            if (contentType === "css") {
                response.setHeader("Content-type", "text/css");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
            };

            if (contentType === "js") {
                response.setHeader("Content-type", "application/javascript");
                payloadString = typeof(payload) !== "undefined" ? payload : "";
            };

            // Return the response-parts that are common to all content-types
            response.writeHead(statusCode);
            response.end(payloadString);

            // log the request path
            console.log("Returning response: ", statusCode, payloadString);

        });
        // console.log(`Request recieved on path: "${trimmedPath}"`)
        // console.log(`Request recieved method: "${method}"`)
        // console.log("Query string parameters:", queryStringObject)
        // console.log("Request recieved headers:", header)
        // console.log("Request recieved payload", buffer)

        // The request on browser
        // http://localhost:8082/app.js?foo=bad&baz=foo
    });
};

const init = () => {

    // Start HTTP server
    httpServer.listen(config.httpPort, () => {

        console.log(`The "http" server is listening on port "${config.httpPort}" in "${config.envName}" mode`);
    });

    // Start HTTPS server
    httpsServer.listen (config.httpsPort, () => {

        console.log(`The "https" server is listening on port "${config.httpsPort}" in "${config.envName}" mode`);
    });
};

// Init server
init();

// Define a request router
const router = {
    ""         : handlers.index,
    "about"    : handlers.about,
    "projects" : handlers.projects,
    "blog"     : handlers.blog,
    "users"    : handlers.users,
    "client"   : handlers.staticFile
};
