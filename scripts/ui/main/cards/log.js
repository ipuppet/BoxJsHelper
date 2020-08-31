const Card = require("./card")

class LogCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
    }

    card() {
        return {
            icon: { symbol: "doc.text" },
            title: { text: $l10n("LOG") },
            extra: {
                type: "switch",
                props: { on: this.kernel.setting.get("server.log_request") },
                events: {
                    changed: sender => {
                        if (sender.on) {
                            this.kernel.setting.set("server.log_request", true)
                        } else {
                            this.kernel.setting.set("server.log_request", false)
                        }
                    }
                }
            },
            events: {
                tapped: () => {
                    let path_log = this.kernel.server.logger.path
                    const template_log_list = path => {
                        let files = $file.list(path)
                        let template_data = []
                        for (let file of files) {
                            template_data.push({ label: { text: file } })
                        }
                        return template_data
                    }
                    this.factory.push([{
                        type: "list",
                        props: {
                            data: template_log_list(path_log),
                            id: "list_log",
                            header: {
                                type: "view",
                                props: { height: 70 },
                                views: [
                                    {
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
                                    }
                                ]
                            },
                            template: [
                                {
                                    type: "label",
                                    props: {
                                        id: "label",
                                        textColor: $color("primaryText", "secondaryText")
                                    },
                                    layout: (make, view) => {
                                        make.left.inset(10)
                                        make.centerY.equalTo(view.super)
                                    }
                                }
                            ],
                            actions: [
                                {
                                    title: $l10n("DELETE"),
                                    color: $color("red"),
                                    handler: (sender, indexPath) => {
                                        let file = sender.object(indexPath).label.text
                                        $file.delete(path_log + file)
                                        sender.delete(indexPath)
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
                                        text: $file.read(path_log + data.label.text).string
                                    },
                                    layout: $layout.fillSafeArea
                                }], $l10n("LOG"))
                            }
                        },
                        layout: $layout.fillSafeArea
                    }], $l10n("TOOLKIT"), [{
                        type: "button",
                        props: {
                            tintColor: this.factory.text_color,
                            symbol: "trash",
                            bgcolor: $color("clear")
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
                                                $file.delete(path_log)
                                                $file.mkdir(path_log)
                                                $("list_log").data = template_log_list(path_log)
                                            }
                                        },
                                        { title: $l10n("CANCEL") }
                                    ]
                                })
                            }
                        },
                        layout: make => {
                            make.right.inset(20)
                            make.size.equalTo(20)
                        }
                    }])
                }
            }
        }
    }
}

module.exports = LogCard