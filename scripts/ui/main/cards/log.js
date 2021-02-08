const Card = require("./card")

class LogCard extends Card {
    card() {
        return {
            icon: { symbol: "doc.text" },
            title: { text: $l10n("LOG") },
            extra: {
                type: "switch",
                props: { on: this.kernel.setting.get("server.logRequest") },
                events: {
                    changed: sender => {
                        if (sender.on) {
                            this.kernel.setting.set("server.logRequest", true)
                        } else {
                            this.kernel.setting.set("server.logRequest", false)
                        }
                    }
                }
            },
            events: {
                tapped: () => {
                    let logPath = this.kernel.server.logger.path
                    const logListTemplate = path => {
                        let files = $file.list(path)
                        let dataTemplate = []
                        for (let file of files) {
                            dataTemplate.push({ label: { text: file } })
                        }
                        return dataTemplate
                    }
                    this.kernel.UIKit.push({
                        view: [{
                            type: "list",
                            props: {
                                data: logListTemplate(logPath),
                                id: "list-log",
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
                                            $file.delete(logPath + file)
                                            sender.delete(indexPath)
                                        }
                                    }
                                ]
                            },
                            events: {
                                didSelect: (sender, indexPath, data) => {
                                    this.kernel.UIKit.push({
                                        view: [{
                                            type: "text",
                                            props: {
                                                editable: false,
                                                textColor: $color("primaryText", "secondaryText"),
                                                text: $file.read(logPath + data.label.text).string
                                            },
                                            layout: $layout.fillSafeArea
                                        }],
                                        title: $l10n("LOG")
                                    })
                                }
                            },
                            layout: $layout.fillSafeArea
                        }],
                        title: $l10n("TOOLKIT"),
                        navButtons: [
                            this.kernel.UIKit.navButton("log.clear", "trash", (start, done, cancel) => {
                                start()
                                $ui.alert({
                                    title: $l10n("ALERT_INFO"),
                                    message: $l10n("CLEAR_LOG_MSG"),
                                    actions: [
                                        {
                                            title: $l10n("OK"),
                                            handler: () => {
                                                $file.delete(logPath)
                                                $file.mkdir(logPath)
                                                $("list-log").data = logListTemplate(logPath)
                                                done()
                                            }
                                        },
                                        {
                                            title: $l10n("CANCEL"),
                                            handler: () => { cancel() }
                                        }
                                    ]
                                })
                            })
                        ]
                    })
                }
            }
        }
    }
}

module.exports = LogCard