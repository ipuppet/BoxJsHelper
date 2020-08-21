class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
    }

    static refresh() {
        $ui.alert({
            title: $l10n("ALERT_INFO"),
            message: `${$l10n("REFRESH")} ${$l10n("BOXJS")}?`,
            actions: [
                {
                    title: $l10n("OK"),
                    handler: () => {
                        $("web_boxjs").reload()
                        $ui.toast($l10n("REFRESH_SUCCESS"))
                    }
                },
                { title: $l10n("CANCEL") }
            ]
        })
    }

    get_views() {
        let domain = "boxjs.com"
        // 目前只有这两个域名
        if (this.kernel.setting.get("setting.about.domain"))
            domain = "boxjs.net"
        return [
            {
                type: "web",
                props: {
                    id: "web_boxjs",
                    url: `http://${domain}/`,
                    opaque: false,
                },
                layout: (make, view) => {
                    make.top.equalTo(view.super.safeAreaTop)
                    make.width.equalTo(view.super)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-50)
                }
            }
        ]
    }
}

module.exports = HomeUI