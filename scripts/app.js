const MainUI = require("./ui/main")
const Setting = require("./setting")

class Kernel {
    constructor() {
        this.setting = new Setting()
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