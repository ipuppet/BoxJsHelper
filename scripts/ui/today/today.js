class TodayUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    render() {
        // 获取boxdata
        let boxdata = $cache.get("boxdata")
        if(!boxdata){
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("NO_TODAY_CACHE")
            })
            return
        }
        // 关闭服务器节约资源
        this.kernel.server.stop_server()
        // 加载脚本
        let script = this.kernel.setting.get("today.script")
        if (script === "" || !$file.exists(script)) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: $l10n("NO_SCRIPT")
            })
        } else {
            require(script).main(boxdata)
        }
    }
}

module.exports = TodayUI