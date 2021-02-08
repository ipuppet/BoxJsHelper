const { Kernel, VERSION } = require("../EasyJsBox/src/kernel")
const Server = require("./server")

class AppKernel extends Kernel {
    constructor() {
        super()
        // 注册组件
        this.settingComponent = this._registerComponent("Setting")
        this.setting = this.settingComponent.controller
        this.initSettingMethods()
        this.page = this._registerComponent("Page")
        this.menu = this._registerComponent("Menu")
        this.server = new Server(this.setting)
    }

    uuid() {
        let s = []
        const hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
        }
        s[14] = "4" // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-"

        return s.join("")
    }

    iCloudPath(path) {
        let start = path.slice(0, 8) === "drive://" ? 8 : 0
        path = path.slice(start)
        path = path[0] === "/" ? path.slice(1) : path
        let end = path.lastIndexOf("/") === path.length - 1 ? -1 : undefined
        path = path.slice(0, end)
        return `drive://${path}/`
    }

    /**
     * 注入设置中的脚本类型方法
     */
    initSettingMethods() {
        this.setting.readme = animate => {
            animate.touchHighlightStart()
            const content = $file.read("/README.md").string
            this.UIKit.push({
                view: [{
                    type: "markdown",
                    props: { content: content },
                    layout: (make, view) => {
                        make.size.equalTo(view.super)
                    }
                }],
                title: $l10n("README"),
                disappeared: () => {
                    animate.touchHighlightEnd()
                }
            })
        }

        this.setting.tipsDomain = animate => {
            const message = `
点击 "功能->远程访问" 即可查看远程访问地址。
首屏显示将确定软件在打开时显示哪个页面。
更换入口的话，重启应用后才会生效哦~
可在底部README中查看更多信息。`
            animate.touchHighlightStart()
            $ui.alert({
                title: $l10n("TIPS"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => animate.touchHighlightEnd()
                    }
                ],
                message: message
            })
        }
    }
}

module.exports = {
    run: () => {
        const Factory = require("./ui/main/factory")
        const kernel = new AppKernel()
        new Factory(kernel).render()
    }
}