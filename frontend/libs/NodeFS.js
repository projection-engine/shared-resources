import {v4} from "uuid"
import PROJECT_PATH from "../../PROJECT_PATH";
import PROJECT_FILE_EXTENSION from "../../PROJECT_FILE_EXTENSION";
import PROJECT_FOLDER_STRUCTURE from "../../PROJECT_FOLDER_STRUCTURE";

const os = window.require("os")
const {ipcRenderer} = window.require("electron")
const pathRequire = window.require("path")

export function getCall(channel, data, addMiddle = true) {
    return new Promise(resolve => {
        let listenID = v4().toString()
        if (data.listenID)
            listenID = data.listenID
        ipcRenderer.once(channel + (addMiddle ? "-" : "") + listenID, (ev, data) => {
            resolve(data)
        })

        ipcRenderer.send(channel, {...data, listenID})
    })
}

function createTunnel(channel, data, callback, once) {
    if (once)
        ipcRenderer.once(channel, (ev, data) => {
            if (callback) callback(ev, data)
        })
    else
        ipcRenderer.on(channel, (ev, data) => {
            if (callback) callback(ev, data)
        })
    ipcRenderer.send(channel, data)
}


export default class NodeFS {
    static #watcherCallback
    static sep = pathRequire.sep
    static path
    static temp
    static PREVIEW_PATH
    static ASSETS_PATH

    static initializePaths() {
        NodeFS.path = pathRequire.resolve(sessionStorage.getItem(PROJECT_PATH).replace(PROJECT_FILE_EXTENSION, "") + NodeFS.sep)
        NodeFS.temp = pathRequire.resolve(NodeFS.path + NodeFS.sep + PROJECT_FOLDER_STRUCTURE.TEMP + NodeFS.sep)
        NodeFS.PREVIEW_PATH = pathRequire.resolve(NodeFS.path + NodeFS.sep + PROJECT_FOLDER_STRUCTURE.PREVIEWS + NodeFS.sep)
        NodeFS.ASSETS_PATH = pathRequire.resolve(NodeFS.path + NodeFS.sep + PROJECT_FOLDER_STRUCTURE.ASSETS + NodeFS.sep)
    }

    static rootDir = os.homedir()

    static resolvePath(path) {
        return pathRequire.resolve(path)
    }

    static async read(path, options = {}) {
        return (await getCall("fs-read", {path, options}))
    }

    static async write(path, data) {
        return (await getCall("fs-write", {path, data}))
    }

    static async rm(path, options = {}) {
        return (await getCall("fs-rm", {path, options}))
    }

    static async mkdir(path) {
        return (await getCall("fs-mkdir", {path}))
    }

    static async stat(path, options = {}) {
        return (await getCall("fs-stat", {path, options}))
    }

    static async exists(path) {
        return (await getCall("fs-exists", {path}))
    }

    static async readdir(path, options) {
        return (await getCall("fs-readdir", {path, options}))
    }

    static async rename(oldPath, newPath) {
        return (await getCall("fs-rename", {oldPath, newPath}))
    }

    static watch(callback) {
        if (NodeFS.#watcherCallback)
            return
        NodeFS.#watcherCallback = callback
        createTunnel("fs-watch", NodeFS.ASSETS_PATH, callback)
    }

    static reWatch() {
        createTunnel("fs-update-watch", NodeFS.ASSETS_PATH, undefined, true)
    }

    static unwatch() {
        if (NodeFS.#watcherCallback)
            ipcRenderer.removeListener("fs-watch", NodeFS.#watcherCallback)
        else
            return
        createTunnel("fs-unwatch", undefined, undefined, true)
        NodeFS.#watcherCallback = undefined
    }
}