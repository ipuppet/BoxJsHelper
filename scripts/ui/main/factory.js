const BaseUI = require("/scripts/ui/components/base-ui")

class Factory extends BaseUI {
    constructor(kernel) {
        super(kernel)
        this.selectedPage = this.kernel.setting.get("general.firstScreen") // 当前显示的页面
    }

    home() {
        const HomeUI = require("./home")
        let interfaceUi = new HomeUI(this.kernel, this)
        return this.creator(interfaceUi.getViews(), 0)
    }

    server() {
        const ToolkitUI = require("./toolkit")
        let interfaceUi = new ToolkitUI(this.kernel, this)
        return this.creator(interfaceUi.getViews(), 1)
    }

    setting() {
        const SettingUI = require("./setting")
        let interfaceUi = new SettingUI(this.kernel, this)
        return this.creator(interfaceUi.getViews(), 2)
    }

    /**
     * 渲染页面
     */
    async render() {
        // 视图
        this.setViews([
            this.home(),
            this.server(),
            this.setting()
        ])
        this.setMenus([
            {
                icon: ["cube", "cube.fill"],
                title: $l10n("BOXJS")
            },
            {
                icon: ["square.grid.2x2", "square.grid.2x2.fill"],
                title: $l10n("TOOLKIT")
            },
            {
                icon: "gear",
                title: $l10n("SETTING")
            }
        ])
        super.render()
    }
}

module.exports = Factory