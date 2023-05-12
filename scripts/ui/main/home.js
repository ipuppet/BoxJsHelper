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

    getView() {
        return {
            type: "web",
            props: {
                allowsNavigation: true,
                id: "web-boxjs",
                url: this.kernel.server.serverURL,
                opaque: false
            },
            layout: $layout.fill
        }
    }
}

module.exports = HomeUI
