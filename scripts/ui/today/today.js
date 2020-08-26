class TodayUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    render() {
        if (this.kernel.setting.get("advanced.domain") !== 1) {
            $ui.alert($l10n("TF_ONLY"))
            return
        }
        // 加载脚本
        let script = this.kernel.setting.get("today.script")
        if (script === "" || !$file.exists(script)) {
            $ui.alert($l10n("NO_SCRIPT"))
        } else {
            // 获取boxdata
            $http.get({
                url: `http://boxjs.net/query/boxdata`,
                handler: function (response) {
                    require(script).main(response.data)
                }
            })
        }
    }
}

module.exports = TodayUI