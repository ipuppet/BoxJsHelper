const Card = require("../card")

class LogCard extends Card {
    card() {
        return {
            icon: { symbol: "doc.circle" },
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
                    const data = logListTemplate(logPath)
                    this.kernel.UIKit.push({
                        views: [data.length === 0 ? this.emptyList : {
                            type: "list",
                            props: {
                                data: data,
                                id: "list-log",
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
                                        views: [{
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
                        title: $l10n("LOG"),
                        navButtons: [
                            {
                                symbol: "trash",
                                handler: () => {
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
                                                }
                                            },
                                            { title: $l10n("CANCEL") }
                                        ]
                                    })
                                }
                            }
                        ]
                    })
                }
            }
        }
    }
}

module.exports = LogCard