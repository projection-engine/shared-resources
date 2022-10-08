const fs = require("fs");
const path = require("path");

export default async function lstat(p, options) {
    return await new Promise(resolve => {
        fs.lstat(path.resolve(p), options, (err, res) => resolve(res ? {isDirectory: res.isDirectory(), ...res} : undefined))
    })
}