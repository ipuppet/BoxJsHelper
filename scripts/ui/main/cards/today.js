const Card = require("./card")

class TodayCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
        this.todayPath = "/assets/today/"
    }

    editor(name, content, callback) {
        this.factory.push([
            {
                type: "text",
                props: {
                    id: "editor",
                    info: name,
                    textColor: $color("primaryText", "secondaryText"),
                    text: content
                },
                layout: (make, view) => {
                    make.left.right.bottom.equalTo(view.super.safeArea)
                    make.top.equalTo(view.super.safeAreaTop).offset(10)
                }
            },
            {
                type: "canvas",
                layout: (make, view) => {
                    make.top.equalTo(view.prev.top)
                    make.height.equalTo(1 / $device.info.screen.scale)
                    make.left.right.inset(0)
                },
                events: {
                    draw: (view, ctx) => {
                        let width = view.frame.width
                        let scale = $device.info.screen.scale
                        ctx.strokeColor = $color("gray")
                        ctx.setLineWidth(1 / scale)
                        ctx.moveToPoint(0, 0)
                        ctx.addLineToPoint(width, 0)
                        ctx.strokePath()
                    }
                }
            }
        ], $l10n("TODAY"), [
            {
                type: "button",
                props: {
                    symbol: "checkmark",
                    tintColor: this.factory.textColor,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(20)
                    make.size.equalTo(20)
                },
                events: {
                    tapped: () => {
                        let editor = $("editor")
                        this.saveScript(editor.info, editor.text)
                        $ui.toast($l10n("SUCCESS_SAVE"))
                        setTimeout(() => {
                            $ui.pop()
                            callback()
                        }, 600)
                    }
                }
            }
        ])
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
            icon: { symbol: "calendar" },
            title: { text: $l10n("TODAY") },
            events: {
                tapped: () => {
                    const scriptName = () => {
                        let script = this.kernel.setting.get("today.script")
                        script = script.slice(script.lastIndexOf("/") + 1)
                        return script
                    }
                    const scriptTemplate = () => {
                        let files = $file.list(this.todayPath)
                        let dataTemplate = []
                        for (let i = 0; i < files.length; i++) {
                            dataTemplate.push({ label: { text: files[i] } })
                        }
                        return dataTemplate
                    }
                    this.factory.push([{
                        type: "list",
                        props: {
                            id: "list-script",
                            header: {
                                type: "view",
                                props: { height: 90 },
                                views: [
                                    {
                                        type: "label",
                                        props: {
                                            text: $l10n("TODAY"),
                                            textColor: $color("primaryText", "secondaryText"),
                                            align: $align.left,
                                            font: $font(34),
                                            line: 1
                                        },
                                        layout: make => {
                                            make.left.top.inset(10)
                                        }
                                    },
                                    {
                                        type: "label",
                                        props: {
                                            align: $align.left,
                                            text: $l10n("SELECTED_SCRIPT") + ": "
                                        },
                                        layout: (make, view) => {
                                            make.top.equalTo(view.prev.bottom).offset(12)
                                            make.left.inset(10)
                                        }
                                    },
                                    {
                                        type: "label",
                                        props: {
                                            id: "selected-script",
                                            align: $align.right,
                                            text: scriptName()
                                        },
                                        layout: (make, view) => {
                                            make.top.equalTo(view.prev)
                                            make.right.inset(10)
                                        }
                                    }
                                ]
                            },
                            data: scriptTemplate(),
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
                    }], $l10n("TOOLKIT"), [
                        // 新脚本
                        this.factory.navButton("script-new", "plus", (start, done) => {
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
                                                start()
                                                $http.get({
                                                    url: text,
                                                    handler: response => {
                                                        let name = text.slice(text.lastIndexOf("/") + 1)
                                                        this.saveScript(name, response.data + "")
                                                        // 保存信息到数据库
                                                        // 换更新脚本思路
                                                        /* this.kernel.storage.save({
                                                            name: name,
                                                            url: text,
                                                            script: response.data + "",
                                                            date: new Date().getTime()
                                                        }) */
                                                        $("list-script").data = scriptTemplate()
                                                        done()
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }),
                        // 备份脚本
                        this.factory.navButton("script-backup", "cloud", (start, done) => {
                            $ui.menu({
                                items: [$l10n("BACKUP_ICLOUD"), $l10n("REVERT_FROM_ICLOUD")],
                                handler: (title, idx) => {
                                    if (idx === 0) { // 备份
                                        start()
                                        // 备份文件
                                        let dst = this.iCloud + "Today"
                                        if (!$file.exists(dst)) {
                                            $file.mkdir(dst)
                                        }
                                        $file.copy({
                                            src: this.todayPath,
                                            dst: dst
                                        })
                                        done()
                                    } else if (idx === 1) { // 恢复
                                        start()
                                        // 恢复文件
                                        if (!$file.exists(this.todayPath)) {
                                            $file.mkdir(this.todayPath)
                                        }
                                        $file.copy({
                                            src: this.iCloud + "Today",
                                            dst: this.todayPath
                                        })
                                        $("list-script").data = scriptTemplate()
                                        done()
                                    }
                                }
                            })
                        })
                    ])
                }
            }
        }
    }
}

module.exports = TodayCard