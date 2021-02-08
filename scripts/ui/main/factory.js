const BaseView = require("../../../EasyJsBox/src/Foundation/view")

class Factory extends BaseView {
    constructor(kernel) {
        super(kernel)
        // 设置初始页面
        this.kernel.page.controller.setSelectedPage(this.kernel.setting.get("general.firstScreen"))
    }

    home() {
        const HomeUI = require("./home")
        let interfaceUi = new HomeUI(this.kernel, this)
        return this.kernel.page.view.creator(interfaceUi.getViews(), 0)
    }

    server() {
        const ToolkitUI = require("./toolkit")
        let interfaceUi = new ToolkitUI(this.kernel)
        return this.kernel.page.view.creator(interfaceUi.getViews(), 1)
    }

    setting() {
        return this.kernel.page.view.creator(this.kernel.setting.getView(), 2, false)
    }

    /**
     * 渲染页面
     */
    render() {
        this.kernel.render([
            this.home(),
            this.server(),
            this.setting()
        ], [
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
        ])()
    }
}

module.exports = Factory