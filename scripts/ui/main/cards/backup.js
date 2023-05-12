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

    async boxdata() {
        const response = await $http.get({
            url: `${this.kernel.server.serverURL}/query/boxdata`
        })
        if (null !== response.error) {
            $ui.toast($l10n("ERROR_GET_DATA"))
            this.kernel.print(error)
            throw response.error
        }
        return response.data
    }

    async updateList() {
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
        $(this.listId).data = list
        $(this.emptyList.props.id).hidden = list.length > 0
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

    async createBackup() {
        $ui.toast($l10n("LOADING"), 10000)
        try {
            const boxdata = await this.boxdata()
            const syscfgs = boxdata.syscfgs
            const response = await $http.post({
                url: `${this.kernel.server.serverURL}/api/saveGlobalBak`,
                body: {
                    id: $text.uuid,
                    createTime: new Date().toISOString(),
                    name: `BoxJsHelper`,
                    tags: ["BoxJsHelper", syscfgs.env, syscfgs.version, syscfgs.versionType],
                    version: syscfgs.version,
                    versionType: syscfgs.versionType,
                    env: syscfgs.env
                }
            })
            if (null !== response.error) {
                $ui.toast($l10n("ERROE_BACKUP"))
                return
            }
            return response
        } catch (error) {
            throw error
        } finally {
            $ui.clearToast()
        }
    }

    async sync() {
        this.uploadToiCloud()
        await this.recoverFromiCloud()
        this.updateList()
    }

    async uploadToiCloud() {
        const handler = data => {
            let uploaded = 0
            let errorList = []
            const length = data.globalbaks.length
            data.globalbaks.forEach(backup => {
                // 文件存在则跳过
                if (this.hasiCloud(backup.id)) {
                    uploaded++
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
                            this.updateList()
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

        if ($(this.listId).data.length === 0) {
            const response = await this.createBackup()
            handler(response.data)
        } else {
            const boxdata = await this.boxdata()
            handler(boxdata)
        }
    }

    async recoverFromiCloud() {
        await $wait(0.2)
        // 从 iCloud 恢复
        const files = $file.list(this.iCloudPath())
        const length = files.length
        if (length === 0) {
            return
        }
        let recovered = 0
        let errorList = []
        const backupMap = {}
        ;(await this.boxdata())?.globalbaks?.forEach(item => {
            backupMap[item.id] = item.name
        })
        files.forEach(async id => {
            if (backupMap[id]) {
                // 跳过已存在备份
                recovered++
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
                        this.updateList()
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
                                                this.delete(id, name, async () => {
                                                    sender.delete(indexPath)
                                                    await $wait(0.3)
                                                    this.updateList()
                                                })
                                            }
                                        }
                                    ]
                                },
                                events: {
                                    pulled: async sender => {
                                        await this.sync()
                                        sender.endRefreshing()
                                    },
                                    didSelect: (sender, indexPath) => {
                                        const id = sender.object(indexPath).id.info
                                        const name = sender.object(indexPath).name.text
                                        this.recoverToBoxJs(id, name)
                                    },
                                    ready: sender => {
                                        // 加载数据
                                        this.updateList()
                                    }
                                },
                                layout: $layout.fillSafeArea
                            },
                            this.emptyList
                        ],
                        navButtons: [
                            {
                                symbol: "plus",
                                handler: async () => {
                                    await this.createBackup()
                                    await this.updateList()
                                    await this.uploadToiCloud()
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
