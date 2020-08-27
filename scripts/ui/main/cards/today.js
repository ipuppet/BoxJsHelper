const Card = require("./card")

class TodayCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
        this.path_today = "/assets/today/"
    }

    new_file(path, name, callback) {
        this.factory.push([
            {
                type: "text",
                props: {
                    id: "editor_new",
                    info: path + name + ".js",
                    textColor: $color("primaryText", "secondaryText"),
                    text: ""
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
                    tintColor: this.factory.text_color,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(20)
                    make.size.equalTo(20)
                },
                events: {
                    tapped: () => {
                        let editor_new = $("editor_new")
                        $file.write({
                            data: $data({ string: editor_new.text }),
                            path: editor_new.info
                        })
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

    card() {
        return {
            icon: { symbol: "calendar" },
            title: { text: $l10n("TODAY") },
            events: {
                tapped: () => {
                    const script_name = () => {
                        let script = this.kernel.setting.get("today.script")
                        script = script.slice(script.lastIndexOf("/") + 1)
                        return script
                    }
                    const template_script = (path) => {
                        let files = $file.list(path)
                        let template_data = []
                        for (let i = 0; i < files.length; i++) {
                            template_data.push({ label: { text: files[i] } })
                        }
                        return template_data
                    }
                    this.factory.push([{
                        type: "list",
                        props: {
                            id: "list_script",
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
                                            id: "selected_script",
                                            align: $align.right,
                                            text: script_name()
                                        },
                                        layout: (make, view) => {
                                            make.top.equalTo(view.prev)
                                            make.right.inset(10)
                                        }
                                    }
                                ]
                            },
                            data: template_script(this.path_today),
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
                                                        $file.delete(this.path_today + file)
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
                                        let script = this.path_today + sender.object(indexPath).label.text.trim()
                                        this.kernel.setting.set("today.script", script)
                                        $("selected_script").text = script_name()
                                    }
                                }
                            ]
                        },
                        events: {
                            didSelect: (sender, indexPath, data) => {
                                this.factory.push([
                                    {
                                        type: "text",
                                        props: {
                                            id: "editor",
                                            info: this.path_today + data.label.text,
                                            textColor: $color("primaryText", "secondaryText"),
                                            text: $file.read(this.path_today + data.label.text).string
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
                                            tintColor: this.factory.text_color,
                                            bgcolor: $color("clear")
                                        },
                                        layout: make => {
                                            make.right.inset(20)
                                            make.size.equalTo(20)
                                        },
                                        events: {
                                            tapped: () => {
                                                let editor = $("editor")
                                                $file.write({
                                                    data: $data({ string: editor.text }),
                                                    path: editor.info
                                                })
                                                $ui.toast($l10n("SUCCESS_SAVE"))
                                                setTimeout(() => {
                                                    $ui.pop()
                                                }, 600)
                                            }
                                        }
                                    }
                                ])
                            }
                        },
                        layout: $layout.fillSafeArea
                    }], $l10n("TOOLKIT"), [
                        // 新脚本
                        this.factory.nav_button("script_new", "plus", (start, done) => {
                            $ui.menu({
                                items: [$l10n("NEW_FILE"), $l10n("URL")],
                                handler: (title, idx) => {
                                    if (idx === 0) {
                                        $input.text({
                                            type: $kbType.default,
                                            text: "MyScript",
                                            placeholder: $l10n("FILE_NAME"),
                                            handler: text => {
                                                this.new_file(this.path_today, text, () => {
                                                    setTimeout(() => {
                                                        // 更新列表
                                                        $("list_script").data = template_script(this.path_today)
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
                                                        if (name.slice(-3) !== ".js") {
                                                            name = name + ".js"
                                                        }
                                                        $file.write({
                                                            data: $data({ string: response.data + "" }),
                                                            path: this.path_today + name
                                                        })
                                                        $("list_script").data = template_script(this.path_today)
                                                        done()
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }),
                        this.factory.nav_button("script_backup", "cloud", (start, done) => {
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
                                            src: this.path_today,
                                            dst: dst
                                        })
                                        done()
                                    } else if (idx === 1) { // 恢复
                                        start()
                                        // 恢复文件
                                        if (!$file.exists(this.path_today)) {
                                            $file.mkdir(this.path_today)
                                        }
                                        $file.copy({
                                            src: this.iCloud + "Today",
                                            dst: this.path_today
                                        })
                                        $("list_script").data = template_script(this.path_today)
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