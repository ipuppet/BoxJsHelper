class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        // 开启服务器并记录访问url
        this.kernel.server.start_server()
        // 无法获取地址可能是ipv6的问题
        if (this.kernel.server.server.serverURL) {
            this.kernel.serverURL = this.kernel.server.server.serverURL.string
            this.kernel.remoteURL = this.kernel.serverURL
        } else {
            this.kernel.serverURL = `http://localhost:${this.kernel.server.port}`
            this.kernel.remoteURL = `http://${$device.wlanAddress}:${this.kernel.server.port}`
        }
    }

    static refresh(refresh_confirm) {
        const refresh_action = () => {
            $("web_boxjs").reload()
            $ui.toast($l10n("REFRESH_SUCCESS"))
        }
        if (refresh_confirm) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: `${$l10n("REFRESH")} ${$l10n("BOXJS")}?`,
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            refresh_action()
                        }
                    },
                    { title: $l10n("CANCEL") }
                ]
            })
        } else {
            refresh_action()
        }
    }

    get_views() {
        return [
            {
                type: "web",
                props: {
                    id: "web_boxjs",
                    url: this.kernel.serverURL,
                    opaque: false
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