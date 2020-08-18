const Server = require("/scripts/server")
const Matrix = require("/scripts/ui/components/matrix")

class ServerUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
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
                        textColor: $color("primaryText", "secondaryText"),
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
                        let path = this.server.logger.path
                        let files = $file.list(path)
                        let template_data = []
                        for (let i = 0; i < files.length; i++) {
                            template_data.push({
                                label: { text: files[i] }
                            })
                        }
                        this.factory.push([{
                            type: "list",
                            props: {
                                header: {
                                    type: "view",
                                    props: {
                                        height: 70,
                                    },
                                    views: [{
                                        type: "label",
                                        props: {
                                            text: $l10n("LOG"),
                                            textColor: $color("primaryText", "secondaryText"),
                                            align: $align.left,
                                            font: $font(34),
                                            line: 1
                                        },
                                        layout: make => {
                                            make.left.top.inset(10)
                                        }
                                    }]
                                },
                                data: template_data,
                                template: [
                                    {
                                        type: "label",
                                        props: {
                                            id: "label",
                                            textColor: $color("primaryText", "secondaryText"),
                                        },
                                        layout: (make, view) => {
                                            make.left.inset(10)
                                            make.centerY.equalTo(view.super)
                                        }
                                    }
                                ],
                                actions: [
                                    {
                                        title: "delete",
                                        handler: (sender, indexPath) => {
                                            let file = files[indexPath.item]
                                            $file.delete(path + file)
                                        }
                                    }
                                ]
                            },
                            events: {
                                didSelect: (sender, indexPath, data) => {
                                    this.factory.push([{
                                        type: "text",
                                        props: {
                                            editable: false,
                                            textColor: $color("primaryText", "secondaryText"),
                                            text: $file.read(path + data.label.text).string
                                        },
                                        layout: $layout.fillSafeArea
                                    }], $l10n("LOG"))
                                }
                            },
                            layout: $layout.fillSafeArea
                        }], $l10n("SERVER"))
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
                    font: $font(18),
                    textColor: $color("primaryText", "secondaryText"),
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
                    textColor: $color("primaryText", "secondaryText"),
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