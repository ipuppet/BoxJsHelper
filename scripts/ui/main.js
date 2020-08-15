class MainUI {
    constructor(kernel) {
        this.kernel = kernel
        this.password = null
    }

    ui_main() {
        const Factory = require("./main/factory")
        new Factory(this.kernel).render()
    }

    ui_today() {
        const TodayUI = require("./today/today")
        new TodayUI(this.kernel).render()
    }

    render() {
        switch ($app.env) {
            case $env.app:
                this.ui_main()
                break
            case $env.today:
                if (this.kernel.setting.get("setting.general.today_server"))
                    this.ui_today()
                else
                    $ui.alert($l10n("ENABLE_IN_SETTING"))
                break
            default:
                $ui.alert({
                    title: $l10n("ALERT_INFO"),
                    message: "未开发！",
                })
        }
    }
}

module.exports = MainUI