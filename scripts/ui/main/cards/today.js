const { UIKit } = require("../../../libs/easy-jsbox")
const Card = require("../card")

class TodayCard extends Card {
    constructor(kernel) {
        super(kernel)
        this.todayPath = "/assets/today/"
    }

    editor(name, content, callback) {
        UIKit.push({
            views: [
                {
                    type: "code",
                    props: {
                        id: "editor",
                        language: "javascript",
                        lineNumbers: true,
                        theme: $device.isDarkMode ? "atom-one-dark" : "atom-one-light",
                        info: name,
                        text: content
                    },
                    layout: (make, view) => {
                        make.left.right.bottom.equalTo(view.super.safeArea)
                        make.top.equalTo(view.super)
                    }
                }
            ],
            title: $l10n("EDIT"),
            navButtons: [
                {
                    symbol: "checkmark",
                    handler: () => {
                        let editor = $("editor")
                        this.saveScript(editor.info, editor.text)
                        $ui.toast($l10n("SUCCESS_SAVE"))
                        setTimeout(() => {
                            $ui.pop()
                            callback()
                        }, 600)
                    }
                }
            ]
        })
    }

    saveScript(name, content) {
        if (name.slice(-3) !== ".js") {
            name = name + ".js"
        }
        if (name[0] === "/") {
            name = name.slice(1)
        }
        $file.write({
            data: $data({ string: content }),
            path: this.todayPath + name
        })
    }

    card() {
        return {
            icon: { symbol: "calendar.circle" },
            title: { text: $l10n("TODAY") },
            events: {
                tapped: () => {
                    const scriptName = () => {
                        let script = this.kernel.setting.get("today.script")
                        script = script.slice(script.lastIndexOf("/") + 1)
                        return script
                    }
                    const scriptTemplate = () => {
                        const files = $file.list(this.todayPath)
                        let dataTemplate = []
                        for (let i = 0; i < files.length; i++) {
                            dataTemplate.push({ label: { text: files[i] } })
                        }
                        return dataTemplate
                    }
                    const data = scriptTemplate()
                    UIKit.push({
                        views: [data.length === 0 ? this.emptyList : {
                            type: "list",
                            props: {
                                id: "list-script",
                                data: data,
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
                                    { // delete
                                        title: $l10n("DELETE"),
                                        color: $color("red"),
                                        handler: (sender, indexPath) => {
                                            let name = sender.object(indexPath).label.text
                                            $ui.alert({
                                                title: $l10n("ALERT_INFO"),
                                                message: `${$l10n("DELETE")} ${name} ?`,
                                                actions: [
                                                    {
                                                        title: $l10n("OK"),
                                                        handler: () => {
                                                            let file = sender.object(indexPath).label.text
                                                            $file.delete(this.todayPath + file)
                                                            sender.delete(indexPath)
                                                        }
                                                    },
                                                    { title: $l10n("CANCEL") }
                                                ]
                                            })
                                        }
                                    },
                                    { // apply
                                        title: $l10n("APPLY"),
                                        color: $color("orange"),
                                        handler: (sender, indexPath) => {
                                            let script = this.todayPath + sender.object(indexPath).label.text.trim()
                                            this.kernel.setting.set("today.script", script)
                                            $("selected-script").text = scriptName()
                                        }
                                    }
                                ]
                            },
                            events: {
                                didSelect: (sender, indexPath, data) => {
                                    this.editor(data.label.text,
                                        $file.read(this.todayPath + data.label.text).string,
                                        () => {
                                            setTimeout(() => {
                                                // 更新列表
                                                $("list-script").data = scriptTemplate()
                                            }, 500)
                                        }
                                    )
                                }
                            },
                            layout: $layout.fillSafeArea
                        }],
                        title: $l10n("TODAY"),
                        navButtons: [
                            // 新脚本
                            {
                                symbol: "plus",
                                handler: () => {
                                    $ui.menu({
                                        items: [$l10n("NEW_FILE"), $l10n("URL")],
                                        handler: (title, idx) => {
                                            if (idx === 0) {
                                                $input.text({
                                                    type: $kbType.default,
                                                    text: "MyScript",
                                                    placeholder: $l10n("FILE_NAME"),
                                                    handler: text => {
                                                        this.editor(text, "", () => {
                                                            setTimeout(() => {
                                                                // 更新列表
                                                                $("list-script").data = scriptTemplate()
                                                            }, 500)
                                                        })
                                                    }
                                                })
                                            } else if (idx === 1) {
                                                $input.text({
                                                    type: $kbType.url,
                                                    placeholder: $l10n("URL"),
                                                    handler: text => {
                                                        $http.get({
                                                            url: text,
                                                            handler: response => {
                                                                let name = text.slice(text.lastIndexOf("/") + 1)
                                                                this.saveScript(name, response.data + "")
                                                                $("list-script").data = scriptTemplate()
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            },
                            // 备份脚本
                            {
                                symbol: "cloud",
                                handler: () => {
                                    $ui.menu({
                                        items: [$l10n("UPLOAD_TO_ICLOUD"), $l10n("REVERT_FROM_ICLOUD")],
                                        handler: (title, idx) => {
                                            if (idx === 0) { // 备份
                                                // 备份文件
                                                let dst = this.iCloud + "Today"
                                                if (!$file.exists(dst)) {
                                                    $file.mkdir(dst)
                                                }
                                                $file.copy({
                                                    src: this.todayPath,
                                                    dst: dst
                                                })
                                            } else if (idx === 1) { // 恢复
                                                // 恢复文件
                                                if (!$file.exists(this.todayPath)) {
                                                    $file.mkdir(this.todayPath)
                                                }
                                                $file.copy({
                                                    src: this.iCloud + "Today",
                                                    dst: this.todayPath
                                                })
                                                $("list-script").data = scriptTemplate()
                                            }
                                        }
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

module.exports = TodayCard