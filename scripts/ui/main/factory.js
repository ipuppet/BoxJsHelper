const BaseUI = require("/scripts/ui/components/base-ui")

class Factory extends BaseUI {
    constructor(kernel) {
        super(kernel)
        this.selected_page = this.kernel.setting.get("general.first_screen") // 当前显示的页面
        this.page_index = [// 通过索引获取页面id
            "home",// 0 => 首页
            "server",// 1 => 服务器
            "setting"// 2 => 设置
        ]
        this.views = [
            this.home(),
            this.server(),
            this.setting()
        ]
        this.menu_data = [
            {
                icon: { symbol: "cube" },
                title: { text: $l10n("BOXJS") }
            },
            {
                icon: { symbol: "square.grid.2x2" },
                title: { text: $l10n("TOOLKIT") }
            },
            {
                icon: { symbol: "gear" },
                title: { text: $l10n("SETTING") }
            }
        ]
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
}

module.exports = Factory