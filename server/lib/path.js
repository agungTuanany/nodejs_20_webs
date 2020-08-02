"use strict";
/*
 * A "path" helper functions
 *
 * example to use:
 * path.join(rootDir, "views", "page-not-found.html")
 *
 */

// Core Dependencies
const path = require("path");

const pathDirName = path.dirname(process.mainModule.filename);

module.exports = pathDirName;

