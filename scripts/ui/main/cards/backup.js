const Card = require("../card")

class BackupCard extends Card {
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

    backupListTemplate(callback) {
        this.boxdata(boxdata => {
            const list = []
            for (let item of boxdata.globalbaks) {
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
                    this.kernel.UIKit.push({
                        title: $l10n("BACKUP"),
                        views: [{
                            type: "list",
                            props: {
                                rowHeight: 60,
                                data: [],
                                id: "list-backup",
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
                                        title: $l10n("DELETE") + " ", // 加空格防止被检测为默认的删除行为
                                        color: $color("red"),
                                        handler: (sender, indexPath) => {
                                            console.log(sender.object(indexPath))
                                            const id = sender.object(indexPath).id.info
                                            const name = sender.object(indexPath).name.text
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
                                    const id = sender.object(indexPath).id.info
                                    const name = sender.object(indexPath).name.text
                                    $ui.alert({
                                        title: $l10n("ALERT_INFO"),
                                        message: `${$l10n("RECOVER_BACKUP")} ${name} ?`,
                                        actions: [
                                            {
                                                title: $l10n("OK"),
                                                handler: () => {
                                                    $http.post({
                                                        url: `${this.kernel.server.serverURL}/api/revertGlobalBak`,
                                                        body: { id: id },
                                                        handler: (response) => {
                                                            if (null !== response.error) {
                                                                $ui.error($l10n("ERROR"))
                                                                return false
                                                            }
                                                            $ui.success($l10n("SUCCESS_RECOVER"))
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
                                    this.backupListTemplate(list => {
                                        if (list.length > 0) {
                                            sender.data = list
                                        } else {
                                            $ui.toast($l10n("EMPTY_LIST"))
                                        }
                                    })
                                }
                            },
                            layout: $layout.fillSafeArea
                        }],
                        navButtons: [
                            // 备份
                            this.kernel.UIKit.navButton("boxdata-backup", "icloud.and.arrow.up", animate => {
                                $ui.alert({
                                    title: $l10n("BACKUP"),
                                    message: $l10n("BACKUP_NOW"),
                                    actions: [
                                        {
                                            title: $l10n("OK"),
                                            handler: () => {
                                                animate.start()
                                                const handler = data => {
                                                    $file.delete(`${this.iCloud}/backup`)
                                                    $file.mkdir(`${this.iCloud}/backup`)
                                                    let status = 0
                                                    const length = data.globalbaks.length
                                                    data.globalbaks.forEach(back => {
                                                        $http.get({
                                                            url: `${this.kernel.server.serverURL}/query/baks/${back.id}`,
                                                            handler: response => {
                                                                const statusICloud = $file.write({
                                                                    data: $data({
                                                                        string: JSON.stringify({
                                                                            info: back,
                                                                            data: response.data
                                                                        })
                                                                    }),
                                                                    path: `${this.iCloud}/backup/${back.id}`
                                                                })
                                                                if (!statusICloud) {
                                                                    animate.done(false, $l10n("ERROE_BACKUP"))
                                                                }
                                                                // 操作成功
                                                                status++
                                                                // 动作结束
                                                                if (status === length) {
                                                                    this.backupListTemplate(list => {
                                                                        $("list-backup").data = list
                                                                        animate.done()
                                                                    })
                                                                }
                                                            }
                                                        })
                                                    })
                                                }
                                                this.boxdata(boxjs => {
                                                    if ($("list-backup").data.length === 0) {
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
                                                                    animate.done(false, $l10n("ERROE_BACKUP"))
                                                                    return
                                                                }
                                                                handler(response.data)
                                                            }
                                                        })
                                                    } else {
                                                        handler(boxjs)
                                                    }
                                                })
                                            }
                                        },
                                        { title: $l10n("CANCEL") }
                                    ]
                                })
                            }),
                            // 恢复
                            this.kernel.UIKit.navButton("boxdata-revert", "icloud.and.arrow.down", animate => {
                                $ui.alert({
                                    title: $l10n("REVERT_FROM_ICLOUD"),
                                    actions: [
                                        {
                                            title: $l10n("OK"),
                                            handler: () => {
                                                animate.start()
                                                // 从iCloud恢复
                                                setTimeout(async () => {
                                                    await $file.download(`${this.iCloud}/backup`)
                                                    const files = $file.list(`${this.iCloud}/backup`)
                                                    let index = 0
                                                    const length = files.length
                                                    files.forEach(async id => {
                                                        const fileContent = await $file.download(`${this.iCloud}/backup/${id}`)
                                                        const data = JSON.parse(fileContent?.string ?? "{}")
                                                        // 先删除，防止重复
                                                        $http.post({
                                                            url: `${this.kernel.server.serverURL}/api/delGlobalBak`,
                                                            body: { id: id },
                                                            handler: () => {
                                                                // 添加新的备份到BoxJs
                                                                $http.post({
                                                                    url: `${this.kernel.server.serverURL}/api/impGlobalBak`,
                                                                    body: Object.assign({
                                                                        bak: data.data
                                                                    }, data.info),
                                                                    handler: () => {
                                                                        index++
                                                                        // 控制行为
                                                                        if (index === length)
                                                                            this.backupListTemplate(list => {
                                                                                $("list-backup").data = list
                                                                                animate.done()
                                                                            })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    })
                                                })
                                            }
                                        },
                                        { title: $l10n("CANCEL") }
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

module.exports = BackupCard