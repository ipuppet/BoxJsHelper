const { Kernel } = require("../EasyJsBox/src/kernel")
const Server = require("./server")

class AppKernel extends Kernel {
    constructor() {
        super()
        // 注册组件
        this.settingComponent = this.registerComponent("Setting")
        this.setting = this.settingComponent.controller
        this.initSettingMethods()
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
            animate.touchHighlight()
            const content = $file.read("/README.md").string
            this.UIKit.pushPageSheet({
                views: [{
                    type: "markdown",
                    props: { content: content },
                    layout: (make, view) => {
                        make.size.equalTo(view.super)
                    }
                }],
                title: $l10n("README")
            })
        }
    }
}

module.exports = {
    run: () => {
        const kernel = new AppKernel()
        // 设置样式
        kernel.UIKit.disableLargeTitle()
        kernel.setting.setChildPage(true)
        // 设置 navButtons
        kernel.UIKit.setNavButtons([
            kernel.UIKit.navButton("setting", "arrow.clockwise", () => {
                require("/scripts/ui/main/home").refresh()
            }),
            kernel.UIKit.navButton("toolbox", "square.grid.2x2", () => {
                const ToolboxUI = require("./ui/main/toolbox")
                const interfaceUi = new ToolboxUI(kernel)
                kernel.UIKit.push({
                    title: $l10n("TOOLBOX"),
                    views: interfaceUi.getView(),
                    navButtons: [kernel.UIKit.navButton("setting", "gear", () => {
                        kernel.UIKit.push({
                            title: $l10n("SETTING"),
                            views: kernel.setting.getView()
                        })
                    })]
                })
            })
        ])
        const HomeUI = require("./ui/main/home")
        const interfaceUi = new HomeUI(kernel)
        kernel.UIRender(interfaceUi.getView())
    }
}