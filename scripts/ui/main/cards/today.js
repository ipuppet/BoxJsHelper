const Card = require("./card")

class TodayCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
        this.path_today = "/assets/today/"
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
                        this.save_script(editor.info, editor.text)
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

    save_script(name, content) {
        if (name.slice(-3) !== ".js") {
            name = name + ".js"
        }
        if (name[0] === "/") {
            name = name.slice(1)
        }
        $file.write({
            data: $data({ string: content }),
            path: this.path_today + name
        })
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
                    const template_script = () => {
                        let files = $file.list(this.path_today)
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
                            data: template_script(),
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
                                },
                                { // edit
                                    title: $l10n("EDIT"),
                                    handler: (sender, indexPath) => {
                                        let data = sender.object(indexPath)
                                        this.editor(data.label.text,
                                            $file.read(this.path_today + data.label.text).string,
                                            () => {
                                                setTimeout(() => {
                                                    // 更新列表
                                                    $("list_script").data = template_script()
                                                }, 500)
                                            }
                                        )
                                    }
                                }
                            ]
                        },
                        events: {
                            didSelect: (sender, indexPath, data) => {
                                // TODO 脚本细节设置
                                this.factory.push([
                                    {
                                        type: "view",
                                        props: {
                                            id: "detail",
                                            info: data
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
                                                let detail = {
                                                    name: data.label.text
                                                }
                                                console.log(detail)
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
                                                this.editor(text, "", () => {
                                                    setTimeout(() => {
                                                        // 更新列表
                                                        $("list_script").data = template_script()
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
                                                        // 保存到数据库
                                                        this.kernel.storage.save({
                                                            name: name,
                                                            url: text,
                                                            script: response.data + "",
                                                            date: new Date().getTime()
                                                        })
                                                        $("list_script").data = template_script()
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
                                        $("list_script").data = template_script()
                                        done()
                                    }
                                }
                            })
                        }),
                        // TODO 更新脚本
                        this.factory.nav_button("script_update", "arrow.clockwise", (start, done) => {
                            let scripts = this.kernel.storage.all()
                            if (scripts.length === 0) {
                                $ui.toast($l10n("NO_SCRIPT_FROM_URL"))
                                return
                            }
                            $ui.alert({
                                title: $l10n("UPDATE_ALL_SCRIPT"),
                                actions: [
                                    {
                                        title: $l10n("OK"),
                                        handler: () => {
                                            console.log(scripts)
                                        }
                                    },
                                    { title: $l10n("CANCEL") }
                                ]
                            })
                        })
                    ])
                }
            }
        }
    }
}

module.exports = TodayCard