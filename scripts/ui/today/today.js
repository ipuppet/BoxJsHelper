class TodayUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    render() {
        // 加载脚本
        let script = this.kernel.setting.get("today.script")
        if (script === "" || !$file.exists(script)) {
            $ui.alert($l10n("NO_SCRIPT"))
        } else {
            require(script).main(async () => {
                // 获取boxdata
                let response = await $http.get(`http://boxjs.net/query/boxdata`)
                if (response.error !== null) {
                    let message = response.error
                    if (typeof message === "object") {
                        message = JSON.stringify(message)
                    }
                    $ui.toast(`${$l10n("GET_BOXJS_DATA_ERROR")} ${message}`)
                    return
                }
                return response.data
            })
        }
    }
}

module.exports = TodayUI