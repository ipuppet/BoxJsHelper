const Matrix = require("/scripts/ui/components/matrix")

class ToolkitUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.iCloud = this.kernel.iCloud_path("/BoxJsHepler")
        this.matrix = new Matrix()
        this.matrix.columns = 2
        this.matrix.height = 90
        this.matrix.spacing = 15
        this.data = [ // 工具箱卡片
            { // 刷新BoxJs
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
            { // 远程访问
                icon: { symbol: "paperplane" },
                title: { text: $l10n("REMOTE_ACCESS") },
                extra: {
                    type: "switch",
                    props: { on: this.kernel.setting.get("server.remote_access") },
                    events: {
                        changed: sender => {
                            if (sender.on) {
                                this.kernel.setting.set("server.remote_access", true)
                                $ui.toast($l10n("REMOTE_ACCESS_STARTED"))
                            } else {
                                this.kernel.setting.set("server.remote_access", false)
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
            { // 日志记录
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
                                template_data.push({
                                    label: { text: file }
                                })
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
                                    props: {
                                        height: 70,
                                    },
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
                                            $file.delete(path_log + file)
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
            },
            { // 备份
                icon: { symbol: "cloud" },
                title: { text: $l10n("BACKUP") },
                events: {
                    tapped: async () => {
                        if (this.kernel.setting.get("advanced.domain") !== 1) {
                            $ui.toast($l10n("TF_ONLY"))
                            return
                        }
                        const template_backup_list = async () => {
                            let globalbaks = await this.boxdata()
                            globalbaks = globalbaks.globalbaks
                            let template_data = []
                            for (let item of globalbaks) {
                                template_data.push({
                                    id: { info: item.id },
                                    name: { text: item.name },
                                    tags: { text: item.tags.join(" ") },
                                    date: { text: new Date(item.createTime).toLocaleString() },
                                })
                            }
                            return template_data
                        }
                        this.factory.push([{
                            type: "list",
                            props: {
                                rowHeight: 60,
                                data: await template_backup_list(),
                                id: "list_backup",
                                header: {
                                    type: "view",
                                    props: {
                                        height: 70,
                                    },
                                    views: [
                                        {
                                            type: "label",
                                            props: {
                                                text: $l10n("BACKUP"),
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
                                template: {
                                    views: [
                                        {
                                            type: "label",
                                            props: {
                                                id: "id",
                                                hidden: true
                                            }
                                        },
                                        {
                                            type: "label",
                                            props: {
                                                id: "name",
                                                font: $font(18),
                                                align: $align.left
                                            },
                                            layout: (make, view) => {
                                                make.top.inset(10)
                                                make.left.inset(10)
                                            }
                                        },
                                        {
                                            type: "label",
                                            props: {
                                                id: "tags",
                                                font: $font(14),
                                                textColor: $color({
                                                    light: "#C0C0C0",
                                                    dark: "#545454"
                                                }),
                                                align: $align.left
                                            },
                                            layout: (make, view) => {
                                                make.bottom.inset(5)
                                                make.left.inset(10)
                                            }
                                        },
                                        {
                                            type: "label",
                                            props: {
                                                id: "date",
                                                font: $font(14),
                                                textColor: $color({
                                                    light: "#C0C0C0",
                                                    dark: "#545454"
                                                }),
                                                align: $align.right
                                            },
                                            layout: (make, view) => {
                                                make.bottom.inset(5)
                                                make.right.inset(10)
                                            }
                                        }
                                    ]
                                },
                                actions: [
                                    {
                                        title: $l10n("DELETE"),
                                        color: $color("red"),
                                        handler: (sender, indexPath) => {
                                            let id = sender.object(indexPath).id.info
                                            let name = sender.object(indexPath).name.text
                                            $ui.alert({
                                                title: $l10n("ALERT_INFO"),
                                                message: `${$l10n("DELETE")} ${name} ?`,
                                                actions: [
                                                    {
                                                        title: $l10n("OK"),
                                                        handler: () => {
                                                            $http.post({
                                                                url: `${this.kernel.serverURL.string}api/delGlobalBak`,
                                                                body: {
                                                                    id: id
                                                                },
                                                                handler: (response) => {
                                                                    if (null !== response.error) {
                                                                        $ui.toast($l10n("ERROR"))
                                                                        return false
                                                                    }
                                                                    sender.delete(indexPath)
                                                                    // 删除操作将不会影响iCloud内的文件
                                                                    /* $http.get({
                                                                        url: `${this.kernel.serverURL.string}query/baks`,
                                                                        handler: (response) => {
                                                                            this.update_iCloud(JSON.stringify(response.data))
                                                                        }
                                                                    }) */
                                                                }
                                                            })
                                                        }
                                                    },
                                                    { title: $l10n("CANCEL") }
                                                ]
                                            })
                                        }
                                    }
                                ]
                            },
                            events: {
                                didSelect: (sender, indexPath, data) => {
                                    let id = sender.object(indexPath).id.info
                                    let name = sender.object(indexPath).name.text
                                    $ui.alert({
                                        title: $l10n("ALERT_INFO"),
                                        message: `${$l10n("RECOVER_BACKUP")} ${name} ?`,
                                        actions: [
                                            {
                                                title: $l10n("OK"),
                                                handler: () => {
                                                    $http.post({
                                                        url: `${this.kernel.serverURL.string}api/revertGlobalBak`,
                                                        body: {
                                                            id: id
                                                        },
                                                        handler: (response) => {
                                                            if (null !== response.error) {
                                                                $ui.toast($l10n("ERROR"))
                                                                return false
                                                            }
                                                            $ui.toast($l10n("SUCCESS_RECOVER"))
                                                        }
                                                    })
                                                }
                                            },
                                            { title: $l10n("CANCEL") }
                                        ]
                                    })
                                }
                            },
                            layout: $layout.fillSafeArea
                        }], $l10n("TOOLKIT"), [
                            {
                                type: "spinner",
                                props: {
                                    id: "spinner_backup",
                                    loading: true,
                                    alpha: 0
                                },
                                layout: make => {
                                    make.right.inset(20)
                                    make.size.equalTo(20)
                                }
                            },
                            {
                                type: "button",
                                props: {
                                    tintColor: this.factory.text_color,
                                    id: "button_backup",
                                    symbol: "arrow.up.doc",
                                    bgcolor: $color("clear"),
                                    alpha: 1
                                },
                                events: {
                                    tapped: () => {
                                        $ui.alert({
                                            title: $l10n("BACKUP"),
                                            message: $l10n("BACKUP_NOW"),
                                            actions: [
                                                {
                                                    title: $l10n("OK"),
                                                    handler: () => {
                                                        $("button_backup").alpha = 0
                                                        $("spinner_backup").alpha = 1
                                                        this.backup(async () => {
                                                            // 更新列表
                                                            $("list_backup").data = await template_backup_list()
                                                            // 播放动画
                                                            $("button_backup").symbol = "checkmark"
                                                            $("spinner_backup").alpha = 0
                                                            $ui.animate({
                                                                duration: 0.6,
                                                                animation: () => {
                                                                    $("button_backup").alpha = 1
                                                                },
                                                                completion: () => {
                                                                    setTimeout(() => {
                                                                        $ui.animate({
                                                                            duration: 0.4,
                                                                            animation: () => {
                                                                                $("button_backup").alpha = 0
                                                                            },
                                                                            completion: () => {
                                                                                $("button_backup").symbol = "arrow.up.doc"
                                                                                $ui.animate({
                                                                                    duration: 0.4,
                                                                                    animation: () => {
                                                                                        $("button_backup").alpha = 1
                                                                                    },
                                                                                    completion: () => {
                                                                                        $("button_backup").alpha = 1
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }, 600)
                                                                }
                                                            })
                                                        })
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
                            },
                            {
                                type: "spinner",
                                props: {
                                    id: "spinner_revert",
                                    loading: true,
                                    alpha: 0
                                },
                                layout: make => {
                                    make.right.inset(60)
                                    make.size.equalTo(20)
                                }
                            },
                            {
                                type: "button",
                                props: {
                                    tintColor: this.factory.text_color,
                                    id: "button_revert",
                                    symbol: "arrow.clockwise",
                                    bgcolor: $color("clear"),
                                    alpha: 1
                                },
                                events: {
                                    tapped: () => {
                                        $ui.alert({
                                            title: $l10n("REVERT_FROM_ICLOUD"),
                                            actions: [
                                                {
                                                    title: $l10n("OK"),
                                                    handler: async () => {
                                                        $("button_revert").alpha = 0
                                                        $("spinner_revert").alpha = 1
                                                        // 从iCloud恢复
                                                        let globalbaks = $file.read(`${this.iCloud}globalbaks.json`)
                                                        globalbaks = JSON.parse(globalbaks.string).globalbaks
                                                        for (let item of globalbaks) {
                                                            // 先删除，防止重复
                                                            await $http.post({
                                                                url: `${this.kernel.serverURL.string}api/delGlobalBak`,
                                                                body: { id: item.id }
                                                            })
                                                            // 添加新的备份到BoxJs
                                                            await $http.post({
                                                                url: `${this.kernel.serverURL.string}api/impGlobalBak`,
                                                                body: item
                                                            })
                                                        }
                                                        // 更新列表
                                                        $("list_backup").data = await template_backup_list()
                                                        // 播放动画
                                                        $("button_revert").symbol = "checkmark"
                                                        $("spinner_revert").alpha = 0
                                                        $ui.animate({
                                                            duration: 0.6,
                                                            animation: () => {
                                                                $("button_revert").alpha = 1
                                                            },
                                                            completion: () => {
                                                                setTimeout(() => {
                                                                    $ui.animate({
                                                                        duration: 0.4,
                                                                        animation: () => {
                                                                            $("button_revert").alpha = 0
                                                                        },
                                                                        completion: () => {
                                                                            $("button_revert").symbol = "arrow.clockwise"
                                                                            $ui.animate({
                                                                                duration: 0.4,
                                                                                animation: () => {
                                                                                    $("button_revert").alpha = 1
                                                                                },
                                                                                completion: () => {
                                                                                    $("button_revert").alpha = 1
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }, 600)
                                                            }
                                                        })
                                                    }
                                                },
                                                { title: $l10n("CANCEL") }
                                            ]
                                        })
                                    }
                                },
                                layout: make => {
                                    make.right.inset(60)
                                    make.size.equalTo(20)
                                }
                            }
                        ])
                    }
                }
            },
            { // Today
                icon: { symbol: "calendar" },
                title: {
                    text: $l10n("TODAY")
                },
                events: {
                    tapped: () => {
                        const script_name = () => {
                            let script = this.kernel.setting.get("today.script")
                            script = script.slice(script.lastIndexOf("/") + 1)
                            return script
                        }
                        let path_today = "/assets/today/"
                        const template_script = (path) => {
                            let files = $file.list(path)
                            let template_data = []
                            for (let i = 0; i < files.length; i++) {
                                template_data.push({
                                    label: { text: files[i] }
                                })
                            }
                            return template_data
                        }
                        this.factory.push([{
                            type: "list",
                            props: {
                                id: "list_script",
                                header: {
                                    type: "view",
                                    props: {
                                        height: 90,
                                    },
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
                                data: template_script(path_today),
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
                                                            $file.delete(path_today + file)
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
                                            let script = path_today + sender.object(indexPath).label.text.trim()
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
                                                info: path_today + data.label.text,
                                                textColor: $color("primaryText", "secondaryText"),
                                                text: $file.read(path_today + data.label.text).string
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
                                                    $file.write({
                                                        data: $data({ string: $("editor").text }),
                                                        path: $("editor").info
                                                    })
                                                    $ui.toast($l10n("SUCCESS_SAVE"))
                                                    setTimeout(() => { $ui.pop() }, 600)
                                                }
                                            }
                                        }
                                    ])
                                }
                            },
                            layout: $layout.fillSafeArea
                        }], $l10n("TOOLKIT"), [
                            { // 更新缓存
                                type: "button",
                                props: {
                                    tintColor: this.factory.text_color,
                                    symbol: "arrow.clockwise",
                                    id: "refresh_today_cache",
                                    bgcolor: $color("clear")
                                },
                                events: {
                                    tapped: () => {
                                        $ui.alert({
                                            title: $l10n("REFRESH"),
                                            message: $l10n("REFRESH_TODAY_CACHE_NOW"),
                                            actions: [
                                                {
                                                    title: $l10n("OK"),
                                                    handler: () => {
                                                        // 更新缓存
                                                        this.update_today_cache()
                                                        // 播放动画
                                                        $("refresh_today_cache").alpha = 0
                                                        $ui.animate({
                                                            duration: 0.6,
                                                            animation: () => {
                                                                $("refresh_today_cache").symbol = "checkmark"
                                                                $("refresh_today_cache").alpha = 1
                                                            },
                                                            completion: () => {
                                                                setTimeout(() => {
                                                                    $ui.animate({
                                                                        duration: 0.4,
                                                                        animation: () => {
                                                                            $("refresh_today_cache").alpha = 0
                                                                        },
                                                                        completion: () => {
                                                                            $("refresh_today_cache").symbol = "arrow.clockwise"
                                                                            $ui.animate({
                                                                                duration: 0.4,
                                                                                animation: () => {
                                                                                    $("refresh_today_cache").alpha = 1
                                                                                },
                                                                                completion: () => {
                                                                                    $("refresh_today_cache").alpha = 1
                                                                                }
                                                                            })
                                                                        }
                                                                    })
                                                                }, 600)
                                                            }
                                                        })
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
                            },
                            { // 新脚本
                                type: "button",
                                props: {
                                    tintColor: this.factory.text_color,
                                    symbol: "plus",
                                    bgcolor: $color("clear")
                                },
                                events: {
                                    tapped: () => {
                                        $ui.menu({
                                            // items: [$l10n("NEW_FILE"), $l10n("URL")],
                                            items: [$l10n("NEW_FILE")],
                                            handler: (title, idx) => {
                                                if (idx === 0) {
                                                    $input.text({
                                                        type: $kbType.default,
                                                        text: "MyScript",
                                                        placeholder: $l10n("FILE_NAME"),
                                                        handler: text => {
                                                            this.new_file(path_today, text, () => {
                                                                setTimeout(() => {
                                                                    $("list_script").data = template_script(path_today)
                                                                }, 500)
                                                            })
                                                        }
                                                    })
                                                } else if (idx === 1) {
                                                    $input.text({
                                                        type: $kbType.url,
                                                        placeholder: $l10n("URL"),
                                                        handler: text => {
                                                            // TODO 从URL添加
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                },
                                layout: make => {
                                    make.right.inset(60)
                                    make.size.equalTo(20)
                                }
                            }
                        ])
                    }
                }
            }
        ]
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
                        $file.write({
                            data: $data({ string: $("editor_new").text }),
                            path: $("editor_new").info
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

    async update_today_cache() {
        $cache.set("boxdata", await this.boxdata())
    }

    async boxdata() {
        let response = await $http.get(`${this.kernel.serverURL.string}query/boxdata`)
        let boxdata = response.data
        if (null !== response.error) {
            $ui.toast($l10n("ERROR_GET_DATA"))
            return false
        }
        return boxdata
    }

    update_iCloud(data) {
        if (!$file.exists(this.iCloud)) {
            $file.mkdir(this.iCloud)
        }
        return $file.write({
            data: $data({ string: data }),
            path: `${this.iCloud}globalbaks.json`
        })
    }

    async backup(callback) {
        let boxjs = await this.boxdata()
        let name = `BoxJsHelper-${boxjs.globalbaks.length + 1}`
        let date = new Date()
        let response = await $http.post({
            url: `${this.kernel.serverURL.string}api/saveGlobalBak`,
            body: {
                id: this.kernel.uuid(),
                createTime: date.toISOString(),
                name: name,
                tags: [
                    "BoxJsHelper",
                    boxjs.syscfgs.env,
                    boxjs.syscfgs.version,
                    boxjs.syscfgs.versionType
                ],
                version: boxjs.syscfgs.version,
                versionType: boxjs.syscfgs.versionType,
                env: boxjs.syscfgs.env,
            }
        })
        if (null !== response.error) {
            $ui.toast($l10n("ERROE_BACKUP"))
            return
        }
        if (this.update_iCloud(JSON.stringify(response.data))) {
            callback()
        } else {
            $ui.toast($l10n("ERROE_BACKUP"))
        }
    }

    /**
     * 卡片内容样式
     * @param {*} data 
     */
    template(data) {
        let views = [
            {
                type: "image",
                props: Object.assign({
                    tintColor: this.factory.text_color
                }, data.icon),
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