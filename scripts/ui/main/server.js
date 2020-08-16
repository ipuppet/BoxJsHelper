const Server = require("/scripts/server")
const Matrix = require("/scripts/ui/components/matrix")

class ServerUI {
    constructor(kernel) {
        this.kernel = kernel
        this.server = new Server(kernel)
        this.access_link = `${$device.wlanAddress}:${this.server.port}`
        this.columns = 2
        this.height = 90
        this.spacing = 15
        this.matrix = new Matrix()
        this.matrix.columns = this.columns
        this.matrix.height = this.height
        this.matrix.spacing = this.spacing
        this.data = [
            {
                icon: { symbol: "link" },
                title: {
                    text: this.access_link,
                    font: $font(12)
                },
                extra: {
                    type: "label",
                    props: {
                        text: $l10n("ACCESS"),
                        font: $font(20)
                    }
                },
                events: {
                    tapped: () => {
                        $ui.alert(this.access_link)
                    }
                }
            },
            {
                icon: { symbol: "paperplane" },
                title: { text: $l10n("SERVER") },
                extra: {
                    type: "switch",
                    events: {
                        changed: sender => {
                            if (sender.on) {
                                this.server.start_server()
                                $ui.toast($l10n("SERVER_STARTED"))
                            } else {
                                this.server.stop_server()
                                $ui.toast($l10n("SERVER_CLOSED"))
                            }
                        }
                    }
                },
            },
            {
                icon: { symbol: "doc.text" },
                title: { text: $l10n("LOG") },
                events: {
                    tapped: () => {
                        let nav_button = [
                            {
                                type: "button",
                                props: {
                                    title: $l10n("CLEAR_LOG"),
                                    contentEdgeInsets: 10
                                },
                                layout: make => {
                                    make.height.equalTo(30)
                                    make.right.inset(10)
                                },
                                events: {
                                    tapped: () => {
                                        $ui.alert({
                                            title: $l10n("ALERT_INFO"),
                                            message: $l10n("CLEAR_LOG_MSG"),
                                            actions: [
                                                {
                                                    title: $l10n("OK"),
                                                    handler: () => {
                                                        $file.write({
                                                            data: $data({ string: "" }),
                                                            path: this.server.logger.path
                                                        })
                                                        $("log_view").text = ""
                                                        $ui.toast($l10n("CLEAR_LOG_DONE"))
                                                    }
                                                },
                                                { title: $l10n("CANCEL") }
                                            ]
                                        })
                                    }
                                }
                            }
                        ]
                        this.kernel.ui_push([{
                            type: "text",
                            props: {
                                id: "log_view",
                                editable: false,
                                text: $file.read(this.server.logger.path).string
                            },
                            layout: $layout.fillSafeArea
                        }], $l10n("BACK"), nav_button)
                    }
                }
            }
        ]
    }

    template(data) {
        let views = [
            {
                type: "image",
                props: Object.assign({}, data.icon),
                layout: make => {
                    make.top.left.inset(10)
                    make.size.equalTo(30)
                }
            },
            {
                type: "label",
                props: Object.assign({
                    font: $font(18)
                }, data.title),
                layout: make => {
                    make.bottom.left.inset(10)
                }
            },
        ]
        if (data.extra) {
            views.push({
                type: data.extra.type,
                props: Object.assign({}, data.extra.props),
                events: data.extra.events,
                layout: make => {
                    make.right.top.inset(10)
                    make.height.equalTo(30)
                }
            })
        }
        return views
    }

    get_views() {
        // 套入模板，生成卡片
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = this.matrix.create_card(this.template(this.data[i]), this.data[i]["events"])
        }
        // 计算尺寸
        let line = Math.ceil(this.data.length / this.columns)
        let bottom = 50 + this.spacing // bottom是为了防止被下面菜单挡住最后一行的内容
        let height = line * (this.height + this.spacing) + bottom
        return [
            {
                type: "label",
                props: {
                    text: $l10n("SERVER"),
                    align: $align.left,
                    font: $font("bold", 34),
                    line: 1,
                },
                layout: (make, view) => {
                    make.left.inset(10)
                    make.width.equalTo(120)
                    make.height.equalTo(40)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            },
            {
                type: "scroll",
                props: {
                    bgcolor: $color("insetGroupedBackground"),
                    scrollEnabled: true,
                    indicatorInsets: $insets(this.spacing, 0, 50, 0),
                    contentSize: $size(0, height)
                },
                views: this.data,
                layout: (make, view) => {
                    make.left.right.inset(0)
                    make.bottom.inset(0)
                    make.top.equalTo(view.prev).offset(50)
                }
            }
        ]
    }
}

module.exports = ServerUI