const {
    UIKit,
    Kernel,
    Setting
} = require("./easy-jsbox")
const Server = require("./server")

class AppKernel extends Kernel {
    constructor() {
        super()
        // 注册组件
        this.setting = new Setting()
        this.setting.loadConfig()
        this.initSettingMethods()
        this.server = new Server(this.setting)
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
        this.setting.method.tips = animate => {
            animate.touchHighlight()
            $ui.alert({
                title: $l10n("TIPS"),
                message: $l10n("DOMAIN") + "与浏览器访问地址一致"
            })
        }

        this.setting.method.readme = animate => {
            animate.touchHighlight()
            const content = $file.read("README.md").string
            UIKit.push({
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
                        navButtons: [{
                            symbol: "gear",
                            handler: () => {
                                UIKit.push({
                                    title: $l10n("SETTING"),
                                    views: [kernel.setting.getListView()]
                                })
                            }
                        }]
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