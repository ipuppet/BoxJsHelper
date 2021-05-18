class HomeUI {
    constructor(kernel) {
        this.kernel = kernel
        // 开启服务器并记录访问url
        this.kernel.server.startServer()
    }

    static refresh() {
        $("web-boxjs").reload()
        $ui.toast($l10n("REFRESH_SUCCESS"))
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