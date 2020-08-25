const MainUI = require("./ui/main")
const Setting = require("./setting")
const Server = require("./server")

class Kernel {
    constructor() {
        this.setting = new Setting()
        this.server = new Server(this.setting)
        this.server.start_server()
        this.serverURL = this.server.server.serverURL
    }

    uuid() {
        var s = []
        var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = "4" // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-"

        var uuid = s.join("")
        return uuid
    }

    iCloud_path(path) {
        let start = path.slice(0, 8) === "drive://" ? 8 : 0
        path = path.slice(start)
        path = path[0] === "/" ? path.slice(1) : path
        let end = path.lastIndexOf("/") === path.length - 1 ? -1 : undefined
        path = path.slice(0, end)
        return `drive://${path}/`
    }
}

module.exports = {
    run: () => {
        // 实例化应用核心
        let kernel = new Kernel()
        // 渲染UI
        new MainUI(kernel).render()
    }
}