import readdir from "./readdir";
import lstat from "./lstat";

const fs = require("fs");
const path = require("path");


export default async function  directoryStructure(dir){
    const results = []
    if (fs.existsSync(dir)) {
        const list = await readdir(dir)
        if (!list) return []
        let pending = list.length
        if (!pending) return results
        for (let i in list) {
            let file = path.resolve(dir, list[i])
            const stat = await lstat(file)
            results.push(file)
            if (stat && stat.isDirectory) {
                results.push(...(await directoryStructure(file)))
                if (!--pending) return results
            } else if (!--pending) return results
        }
    }
    return []
}

