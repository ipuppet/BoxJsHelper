const Matrix = require("/scripts/ui/components/matrix")

class ToolkitUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.matrix = new Matrix()
        this.matrix.columns = 2
        this.matrix.height = 90
        this.matrix.spacing = 15
        this.data = [
            {
                icon: { symbol: "arrow.clockwise" },
                title: {
                    text: $l10n("REFRESH") + $l10n("BOXJS")
                },
                events: {
                    tapped: () => {
                        require('/scripts/ui/main/home').refresh(this.kernel.setting.get("general.refresh_confirm"))
                    }
                }
            },
            {
                icon: { symbol: "paperplane" },
                title: { text: $l10n("REMOTE_ACCESS") },
                extra: {
                    type: "switch",
                    props: { on: this.kernel.setting.get("server.remote_access") },
                    events: {
                        changed: sender => {
                            if (sender.on) {
                                this.kernel.setting.save("server.remote_access", true)
                                $ui.toast($l10n("REMOTE_ACCESS_STARTED"))
                            } else {
                                this.kernel.setting.save("server.remote_access", false)
                                $ui.toast($l10n("REMOTE_ACCESS_CLOSED"))
                            }
                        }
                    }
                },
                events: {
                    tapped: () => {
                        $ui.alert(this.kernel.serverURL.string)
                    }
                }
            },
            {
                icon: { symbol: "doc.text" },
                title: { text: $l10n("LOG") },
                extra: {
                    type: "switch",
                    props: { on: this.kernel.setting.get("server.log_request") },
                    events: {
                        changed: sender => {
                            if (sender.on) {
                                this.kernel.setting.save("server.log_request", true)
                            } else {
                                this.kernel.setting.save("server.log_request", false)
                            }
                        }
                    }
                },
                events: {
                    tapped: () => {
                        let path = this.kernel.server.logger.path
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
                        }], $l10n("TOOLKIT"))
                    }
                }
            }
        ]
    }

    /**
     * 卡片内容样式
     * @param {*} data 
     */
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

    template_card() {
        // TODO 排序
        let data = []
        for (let i = 0; i < this.data.length; i++) {
            data[i] = this.matrix.template_card(this.template(this.data[i]), this.data[i]["events"])
        }
        return data
    }

    get_views() {
        return [
            {
                type: "label",
                props: {
                    text: $l10n("TOOLKIT"),
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
            // 第二个参数是为了防止被下面菜单挡住最后一行的内容
            this.matrix.template_scroll(this.template_card(), 50 + this.matrix.spacing)
        ]
    }
}

module.exports = ToolkitUI