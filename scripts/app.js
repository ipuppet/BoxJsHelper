const { UIKit, Kernel, FileStorage, Logger, Setting } = require("./libs/easy-jsbox")
const Server = require("./libs/server")

/**
 * @typedef {AppKernel} AppKernel
 */
class AppKernel extends Kernel {
    constructor() {
        super()
        this.fileStorage = new FileStorage({ basePath: "shared://BoxjsHelper" })

        this.logger = new Logger()
        this.logger.setWriter(this.fileStorage, "logs/boxjs-helper.log")

        this.setting = new Setting({ logger: this.logger, fileStorage: this.fileStorage })

        this.server = new Server(this)
        this.initSettingMethods()
        this.initSettingEvents()
    }

    iCloudPath(path) {
        let start = path.slice(0, 8) === "drive://" ? 8 : 0
        path = path.slice(start)
        path = path[0] === "/" ? path.slice(1) : path
        let end = path.lastIndexOf("/") === path.length - 1 ? -1 : undefined
        path = path.slice(0, end)
        return `drive://${path}/`
    }

    initSettingEvents() {
        this.setting.setEvent("onSet", (key, value) => {
            const serverConfigKeys = ["advanced.timeout", "advanced.domain", "advanced.serverPort", "server.logRequest"]
            if (serverConfigKeys.includes(key)) {
                this.server.reloadServer()
            }
        })
    }

    /**
     * 注入设置中的脚本类型方法
     */
    initSettingMethods() {
        this.setting.method.tips = () => {
            $ui.alert({
                title: $l10n("TIPS"),
                message: $l10n("DOMAIN") + "与浏览器访问地址一致" + "\n QuantumultX 用户超时时间可以设置的久一点"
            })
        }
    }
}

module.exports = {
    run: () => {
        const kernel = new AppKernel()
        // 设置样式
        kernel.useJsboxNav()
        // 设置 navButtons
        kernel.setNavButtons([
            {
                symbol: "arrow.clockwise",
                handler: () => {
                    require("./ui/main/home").refresh()
                }
            },
            {
                symbol: "square.grid.2x2",
                handler: () => {
                    const ToolboxUI = require("./ui/main/toolbox")
                    const interfaceUi = new ToolboxUI(kernel)
                    UIKit.push({
                        title: $l10n("TOOLBOX"),
                        views: [interfaceUi.getView()],
                        navButtons: [
                            {
                                symbol: "gear",
                                handler: () => {
                                    UIKit.push({
                                        title: $l10n("SETTING"),
                                        views: [kernel.setting.getListView()]
                                    })
                                }
                            }
                        ]
                    })
                }
            }
        ])
        const HomeUI = require("./ui/main/home")
        const interfaceUi = new HomeUI(kernel)
        kernel.UIRender({
            views: [interfaceUi.getView()]
        })
    }
}
