import path from 'path'
import pino from 'pino'
// const path = require('path');
// const pino = require('pino');
// const logger = pino({
//   prettyPrint: {
//     // Adds the filename property to the message
//     messageFormat: '{filename}: {msg}',

//     // need to ignore 'filename' otherwise it appears beneath each log
//     ignore: 'pid,hostname,filename', 
//   },
// }).child({ filename: path.basename(__filename) });




export const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
  prettyPrint:
    process.env.NODE_ENV !== "production" ||
    process.env.LOG_PRETTY_PRINT === "true",
    // messageFormat: '{filename}: {msg}'
});


export let log = logger;