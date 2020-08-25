class TodayUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    render() {
        if (this.kernel.setting.get("advanced.domain") !== 1) {
            $ui.alert($l10n("TF_ONLY"))
            return
        }
        // 获取boxdata
        let boxdata = $cache.get("boxdata")
        if (!boxdata) {
            $ui.alert($l10n("NO_TODAY_CACHE"))
            return
        }
        // 加载脚本
        let script = this.kernel.setting.get("today.script")
        if (script === "" || !$file.exists(script)) {
            $ui.alert($l10n("NO_SCRIPT"))
        } else {
            require(script).main(boxdata)
        }
    }
}

module.exports = TodayUI