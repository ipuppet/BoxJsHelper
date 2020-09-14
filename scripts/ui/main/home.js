class HomeUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        // 开启服务器并记录访问url
        this.kernel.server.startServer()
    }

    static refresh(refreshConfirm) {
        const refreshAction = () => {
            $("web-boxjs").reload()
            $ui.toast($l10n("REFRESH_SUCCESS"))
        }
        if (refreshConfirm) {
            $ui.alert({
                title: $l10n("ALERT_INFO"),
                message: `${$l10n("REFRESH")} ${$l10n("BOXJS")}?`,
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            refreshAction()
                        }
                    },
                    { title: $l10n("CANCEL") }
                ]
            })
        } else {
            refreshAction()
        }
    }

    getViews() {
        return [
            {
                type: "web",
                props: {
                    id: "web-boxjs",
                    url: this.kernel.server.serverURL,
                    opaque: false
                },
                layout: (make, view) => {
                    make.width.top.equalTo(view.super)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-50)
                }
            }
        ]
    }
}

module.exports = HomeUI