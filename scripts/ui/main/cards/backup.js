const { UIKit } = require("../../../libs/easy-jsbox")
const Card = require("../card")

class BackupCard extends Card {
    constructor(kernel) {
        super(kernel)
        this.listId = "list-backup"
        this.backupStatus = {}
        if (!this.hasiCloud()) {
            $file.mkdir(this.iCloudPath())
        }
    }

    iCloudPath(id = "", cloud = false) {
        if (id.endsWith(".icloud")) {
            if (!cloud) {
                id = id.substring(1, id.length - 7)
            }
        } else if (cloud) {
            return `${this.iCloud}/backup/.${id}.icloud`
        }

        return `${this.iCloud}/backup/${id}`
    }

    hasiCloud(id = "") {
        return $file.exists(this.iCloudPath(id)) || $file.exists(this.iCloudPath(id, true))
    }

    boxdata() {
        return new Promise((resolve, reject) => {
            $http.get({
                url: `${this.kernel.server.serverURL}/query/boxdata`,
                handler: response => {
                    if (null !== response.error) {
                        $ui.toast($l10n("ERROR_GET_DATA"))
                        this.kernel.print(error)
                        reject(response.error)
                    } else {
                        resolve(response.data)
                    }
                }
            })
        })
    }

    backupListTemplate() {
        return new Promise(async (resolve, reject) => {
            try {
                const boxdata = await this.boxdata()
                const list = []
                for (let item of boxdata.globalbaks) {
                    list.push({
                        id: { info: item.id },
                        name: { text: item.name },
                        tags: { text: item.tags.join(" ") },
                        date: { text: new Date(item.createTime).toLocaleString() }
                    })
                }
                resolve(list)
            } catch (error) {
                reject(error)
            }
        })
    }

    recoverToBoxJs(id, name) {
        $ui.alert({
            title: `${$l10n("RECOVER_TO_BOXJS")}`,
            message: name,
            actions: [
                {
                    title: $l10n("OK"),
                    handler: () => {
                        $http.post({
                            url: `${this.kernel.server.serverURL}/api/revertGlobalBak`,
                            body: { id },
                            handler: response => {
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
    }

    delete(id, name, callback) {
        $ui.alert({
            title: `${$l10n("DELETE")} ${name}`,
            message: `${$l10n("ALSO_DELETE_ICLOUD")}`,
            actions: [
                {
                    title: $l10n("OK"),
                    handler: () => {
                        $http.post({
                            url: `${this.kernel.server.serverURL}/api/delGlobalBak`,
                            body: { id },
                            handler: response => {
                                if (null !== response.error) {
                                    $ui.toast($l10n("ERROR"))
                                    return false
                                }
                                // 删除 iCloud 文件
                                if (this.hasiCloud(id)) {
                                    $file.delete(this.iCloudPath(id))
                                }
                                if (typeof callback === "function") {
                                    callback()
                                }
                            }
                        })
                    }
                },
                { title: $l10n("CANCEL") }
            ]
        })
    }

    uploadToiCloud() {
        $ui.alert({
            title: $l10n("UPLOAD_TO_ICLOUD"),
            message: $l10n("UPLOAD_TO_ICLOUD_ALERT"),
            actions: [
                {
                    title: $l10n("OK"),
                    handler: () => {
                        const handler = data => {
                            let uploaded = 0
                            let passed = 0
                            let errorList = []
                            const length = data.globalbaks.length
                            data.globalbaks.forEach(backup => {
                                // 文件存在则跳过
                                if (this.hasiCloud(backup.id)) {
                                    uploaded++
                                    passed++
                                    if (passed === length) {
                                        $ui.toast($l10n("NOTHING_HAPPENS"))
                                    }
                                    return
                                }
                                // 显示加载动画
                                this.backupStatus[backup.id]?.loading(true)
                                $http.get({
                                    url: `${this.kernel.server.serverURL}/query/baks/${backup.id}`,
                                    handler: response => {
                                        // 增加计数器
                                        uploaded++
                                        // 保存至 iCloud
                                        if (
                                            $file.write({
                                                data: $data({
                                                    string: JSON.stringify({
                                                        info: backup,
                                                        data: response.data
                                                    })
                                                }),
                                                path: this.iCloudPath(backup.id)
                                            })
                                        ) {
                                            $delay(0.3, () => {
                                                // 显示成功图标
                                                this.backupStatus[backup.id]?.ok()
                                            })
                                        } else {
                                            errorList.push(backup.name)
                                        }
                                        // 动作结束
                                        if (uploaded === length) {
                                            $ui.success($l10n("SUCCESS"))
                                            this.backupListTemplate().then(list => {
                                                $(this.listId).data = list
                                            })
                                            if (errorList.length > 0) {
                                                $ui.alert({
                                                    title: $l10n("ERROE_BACKUP"),
                                                    message: errorList.join("\n")
                                                })
                                            }
                                        }
                                    }
                                })
                            })
                        }
                        this.boxdata().then(boxdata => {
                            if ($(this.listId).data.length === 0) {
                                $http.post({
                                    url: `${this.kernel.server.serverURL}/api/saveGlobalBak`,
                                    body: {
                                        id: this.kernel.uuid(),
                                        createTime: new Date().toISOString(),
                                        name: `BoxJsHelper`,
                                        tags: [
                                            "BoxJsHelper",
                                            boxdata.syscfgs.env,
                                            boxdata.syscfgs.version,
                                            boxdata.syscfgs.versionType
                                        ],
                                        version: boxdata.syscfgs.version,
                                        versionType: boxdata.syscfgs.versionType,
                                        env: boxdata.syscfgs.env
                                    },
                                    handler: response => {
                                        if (null !== response.error) {
                                            $ui.toast($l10n("ERROE_BACKUP"))
                                            return
                                        }
                                        handler(response.data)
                                    }
                                })
                            } else {
                                handler(boxdata)
                            }
                        })
                    }
                },
                { title: $l10n("CANCEL") }
            ]
        })
    }

    async recoverFromiCloud() {
        const res = await $ui.alert({
            title: $l10n("REVERT_FROM_ICLOUD"),
            actions: [
                {
                    title: $l10n("OK")
                },
                { title: $l10n("CANCEL") }
            ]
        })

        if (res.index === 1) {
            return
        }

        $ui.toast($l10n("LOADING"))
        await $wait(0.2)
        // 从 iCloud 恢复
        const files = $file.list(this.iCloudPath())
        const length = files.length
        if (length === 0) {
            $ui.toast($l10n("EMPTY_LIST"))
            return
        }
        let recovered = 0
        let passed = 0
        let errorList = []
        const backupMap = {}
        ;(await this.boxdata())?.globalbaks?.forEach(item => {
            backupMap[item.id] = item.name
        })
        files.forEach(async id => {
            if (backupMap[id]) {
                // 跳过已存在备份
                recovered++
                passed++
                if (passed === length) {
                    $ui.toast($l10n("NOTHING_HAPPENS"))
                }
                return
            }
            await $file.download(this.iCloudPath(id, true))
            const fileContent = $file.read(this.iCloudPath(id))
            const data = JSON.parse(fileContent?.string ?? "{}")
            // 添加新的备份到 BoxJs
            $http.post({
                url: `${this.kernel.server.serverURL}/api/impGlobalBak`,
                body: Object.assign(
                    {
                        bak: data.data
                    },
                    data.info
                ),
                handler: response => {
                    if (null !== response.error) {
                        errorList.push(backupMap[id])
                    }
                    recovered++
                    // 控制行为
                    if (recovered === length) {
                        $ui.success($l10n("SUCCESS"))
                        this.backupListTemplate().then(list => {
                            $(this.listId).data = list
                        })
                        if (errorList.length > 0) {
                            $ui.alert({
                                title: $l10n("ERROE_BACKUP"),
                                message: errorList.join("\n")
                            })
                        }
                    }
                }
            })
        })
    }

    card() {
        return {
            icon: { symbol: "icloud.circle" },
            title: { text: $l10n("BACKUP") },
            events: {
                tapped: () => {
                    UIKit.push({
                        title: $l10n("BACKUP"),
                        views: [
                            {
                                type: "list",
                                props: {
                                    rowHeight: 60,
                                    data: [],
                                    id: this.listId,
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
                                                type: "spinner",
                                                props: { loading: true },
                                                layout: make => {
                                                    make.top.inset(10)
                                                    make.right.inset(10)
                                                }
                                            },
                                            {
                                                type: "image",
                                                props: { hidden: true },
                                                layout: make => {
                                                    make.top.inset(10)
                                                    make.right.inset(10)
                                                },
                                                events: {
                                                    ready: sender => {
                                                        const id = sender.super.get("id").info
                                                        this.backupStatus[id] = {
                                                            loading: loading => {
                                                                if (loading) {
                                                                    sender.prev.hidden = false
                                                                    sender.hidden = true
                                                                } else {
                                                                    sender.prev.hidden = true
                                                                    sender.hidden = false
                                                                }
                                                            }
                                                        }
                                                        Object.assign(this.backupStatus[id], {
                                                            ok: () => {
                                                                this.backupStatus[id].loading(false)
                                                                sender.symbol = "checkmark.icloud"
                                                            },
                                                            no: () => {
                                                                this.backupStatus[id].loading(false)
                                                                sender.symbol = "icloud.slash"
                                                            }
                                                        })
                                                        if (this.hasiCloud(id)) {
                                                            this.backupStatus[id].ok()
                                                        } else {
                                                            this.backupStatus[id].no()
                                                        }
                                                        this.backupStatus[id].loading(false)
                                                    }
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
                                            title: " " + $l10n("DELETE") + " ", // 加空格防止被检测为默认的删除行为
                                            color: $color("red"),
                                            handler: (sender, indexPath) => {
                                                const id = sender.object(indexPath).id.info
                                                const name = sender.object(indexPath).name.text
                                                this.delete(id, name, () => {
                                                    sender.delete(indexPath)
                                                })
                                            }
                                        }
                                    ]
                                },
                                events: {
                                    didSelect: (sender, indexPath) => {
                                        const id = sender.object(indexPath).id.info
                                        const name = sender.object(indexPath).name.text
                                        this.recoverToBoxJs(id, name)
                                    },
                                    ready: sender => {
                                        // 加载数据
                                        this.backupListTemplate().then(list => {
                                            if (list.length > 0) {
                                                sender.data = list
                                            } else {
                                                $ui.toast($l10n("EMPTY_LIST"))
                                            }
                                        })
                                    }
                                },
                                layout: $layout.fillSafeArea
                            }
                        ],
                        navButtons: [
                            // 备份
                            {
                                symbol: "icloud.and.arrow.up",
                                handler: () => {
                                    this.uploadToiCloud()
                                }
                            },
                            // 恢复
                            {
                                symbol: "icloud.and.arrow.down",
                                handler: () => {
                                    this.recoverFromiCloud()
                                }
                            }
                        ]
                    })
                }
            }
        }
    }
}

module.exports = BackupCard
