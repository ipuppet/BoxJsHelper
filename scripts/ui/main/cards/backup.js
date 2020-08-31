const Card = require("./card")

class BackupCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
    }

    boxdata(callback) {
        $http.get({
            url: `${this.kernel.server.serverURL}/query/boxdata`,
            handler: response => {
                if (null !== response.error) {
                    $ui.toast($l10n("ERROR_GET_DATA"))
                } else {
                    callback(response.data)
                }
            }
        })
    }

    template_backup_list(callback) {
        this.boxdata(boxdata => {
            let globalbaks = boxdata.globalbaks
            let list = []
            for (let item of globalbaks) {
                list.push({
                    id: { info: item.id },
                    name: { text: item.name },
                    tags: { text: item.tags.join(" ") },
                    date: { text: new Date(item.createTime).toLocaleString() }
                })
            }
            callback(list)
        })
    }

    card() {
        return {
            icon: { symbol: "cloud" },
            title: { text: $l10n("BACKUP") },
            events: {
                tapped: () => {
                    if (this.kernel.setting.get("advanced.domain") !== 1) {
                        $ui.toast($l10n("TF_ONLY"))
                        return
                    }
                    this.factory.push([{
                        type: "list",
                        props: {
                            rowHeight: 60,
                            data: [],
                            id: "list_backup",
                            header: {
                                type: "view",
                                props: { height: 70 },
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
                                        layout: make => {
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
                                        layout: make => {
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
                                        layout: make => {
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
                                                            url: `${this.kernel.server.serverURL}/api/delGlobalBak`,
                                                            body: {
                                                                id: id
                                                            },
                                                            handler: (response) => {
                                                                // 删除操作不会影响iCloud内的文件
                                                                if (null !== response.error) {
                                                                    $ui.toast($l10n("ERROR"))
                                                                    return false
                                                                }
                                                                sender.delete(indexPath)
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
                            didSelect: (sender, indexPath) => {
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
                                                    url: `${this.kernel.server.serverURL}/api/revertGlobalBak`,
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
                            },
                            ready: sender => {
                                // 加载数据
                                this.template_backup_list(list => {
                                    sender.data = list
                                })
                            }
                        },
                        layout: $layout.fillSafeArea
                    }], $l10n("TOOLKIT"), [
                        // 备份
                        this.factory.nav_button("boxdata_backup", "arrow.up.doc", (start, done) => {
                            $ui.alert({
                                title: $l10n("BACKUP"),
                                message: $l10n("BACKUP_NOW"),
                                actions: [
                                    {
                                        title: $l10n("OK"),
                                        handler: () => {
                                            start()
                                            this.boxdata(boxjs => {
                                                $http.post({
                                                    url: `${this.kernel.server.serverURL}/api/saveGlobalBak`,
                                                    body: {
                                                        id: this.kernel.uuid(),
                                                        createTime: new Date().toISOString(),
                                                        name: `BoxJsHelper-${boxjs.globalbaks.length + 1}`,
                                                        tags: [
                                                            "BoxJsHelper",
                                                            boxjs.syscfgs.env,
                                                            boxjs.syscfgs.version,
                                                            boxjs.syscfgs.versionType
                                                        ],
                                                        version: boxjs.syscfgs.version,
                                                        versionType: boxjs.syscfgs.versionType,
                                                        env: boxjs.syscfgs.env
                                                    },
                                                    handler: response => {
                                                        if (null !== response.error) {
                                                            done(false, $l10n("ERROE_BACKUP"))
                                                            return
                                                        }
                                                        if (!$file.exists(this.iCloud)) {
                                                            $file.mkdir(this.iCloud)
                                                        }
                                                        let status_iCloud = $file.write({
                                                            data: $data({ string: JSON.stringify(response.data) }),
                                                            path: `${this.iCloud}globalbaks.json`
                                                        })
                                                        if (!status_iCloud) {
                                                            done(false, $l10n("ERROE_BACKUP"))
                                                            return
                                                        }
                                                        // 操作成功，更新列表
                                                        this.template_backup_list(list => {
                                                            $("list_backup").data = list
                                                            // 动作结束
                                                            done()
                                                        })
                                                    }
                                                })
                                            })
                                        }
                                    },
                                    { title: $l10n("CANCEL") }
                                ]
                            })
                        }),
                        // 恢复
                        this.factory.nav_button("boxdata_revert", "arrow.clockwise", (start, done) => {
                            $ui.alert({
                                title: $l10n("REVERT_FROM_ICLOUD"),
                                actions: [
                                    {
                                        title: $l10n("OK"),
                                        handler: () => {
                                            start()
                                            // 从iCloud恢复
                                            let globalbaks = $file.read(`${this.iCloud}globalbaks.json`)
                                            globalbaks = JSON.parse(globalbaks.string).globalbaks
                                            // 递归调用，用于解决网络请求同步执行问题，若用async、await会破坏整个框架
                                            const update = (data, index = 0) => {
                                                // 先删除，防止重复
                                                $http.post({
                                                    url: `${this.kernel.server.serverURL}/api/delGlobalBak`,
                                                    body: { id: data.id },
                                                    handler: () => {
                                                        // 添加新的备份到BoxJs
                                                        $http.post({
                                                            url: `${this.kernel.server.serverURL}/api/impGlobalBak`,
                                                            body: data,
                                                            handler: () => {
                                                                index++
                                                                // 控制行为
                                                                if (index > globalbaks.length)
                                                                    this.template_backup_list(list => {
                                                                        $("list_backup").data = list
                                                                        done()
                                                                    })
                                                                else
                                                                    update(globalbaks[index - 1], index)
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                            update(globalbaks[0])
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

module.exports = BackupCard