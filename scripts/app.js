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
}

module.exports = {
    run: () => {
        // 实例化应用核心
        let kernel = new Kernel()
        // 渲染UI
        new MainUI(kernel).render()
    }
}