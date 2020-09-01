const BaseUI = require("/scripts/ui/components/base-ui")

class Factory extends BaseUI {
    constructor(kernel) {
        super(kernel)
        this.selected_page = this.kernel.setting.get("general.first_screen") // 当前显示的页面
    }

    home() {
        const HomeUI = require("./home")
        let ui_interface = new HomeUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 0)
    }

    server() {
        const ToolkitUI = require("./toolkit")
        let ui_interface = new ToolkitUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 1)
    }

    setting() {
        const SettingUI = require("./setting")
        let ui_interface = new SettingUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 2)
    }

    /**
     * 渲染页面
     */
    async render() {
        // 视图
        this.set_views([
            this.home(),
            this.server(),
            this.setting()
        ])
        this.set_menus([
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