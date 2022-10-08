const fs = require("fs");
const path = require("path");
export default async function rm(p, options) {
    return await new Promise(resolve => {
        fs.rm(path.resolve(p), options, (err) => resolve([err]))
    })
}
