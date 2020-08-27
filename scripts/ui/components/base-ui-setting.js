const info = JSON.parse($file.read("/config.json"))["info"]
const List = require("./list")

class BaseUISetting {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.list = new List(factory)
    }

    update_setting(key, value) {
        return this.kernel.setting.set(key, value)
    }

    create_line_label(title) {
        return {
            type: "label",
            props: {
                text: title,
                textColor: this.factory.text_color,
                align: $align.left
            },
            layout: (make, view) => {
                make.height.equalTo(view.super)
                make.left.inset(15)
            }
        }
    }

    create_info(title, value) {
        let is_array = Array.isArray(value)
        let text = is_array ? value[0] : value
        let more_info = is_array ? value[1] : value
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "label",
                    props: {
                        text: text,
                        align: $align.right,
                        textColor: $color("darkGray")
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                        make.width.equalTo(200)
                    }
                },
                {// 监听点击动作
                    type: "view",
                    events: {
                        tapped: () => {
                            $ui.alert({
                                title: title,
                                message: more_info,
                                actions: [
                                    {
                                        title: $l10n("COPY"),
                                        handler: () => {
                                            $clipboard.text = more_info
                                            $ui.toast($l10n("COPY_SUCCESS"))
                                        }
                                    },
                                    { title: $l10n("OK") }
                                ]
                            })
                        }
                    },
                    layout: (make, view) => {
                        make.right.inset(0)
                        make.size.equalTo(view.super)
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    create_switch(key, title, on = true) {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "switch",
                    props: {
                        on: on
                    },
                    events: {
                        changed: sender => {
                            if (!this.update_setting(key, sender.on)) {
                                sender.on = !sender.on
                            }
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    create_string(key, title, text = "") {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "button",
                    props: {
                        symbol: "square.and.pencil",
                        bgcolor: $color("clear"),
                        tintColor: $color("primaryText")
                    },
                    events: {
                        tapped: sender => {
                            const popover = $ui.popover({
                                sourceView: sender,
                                sourceRect: sender.bounds,
                                directions: $popoverDirection.down,
                                size: $size(320, 150),
                                views: [
                                    {
                                        type: "text",
                                        props: {
                                            id: key,
                                            align: $align.left,
                                            text: text
                                        },
                                        layout: make => {
                                            make.left.right.inset(10)
                                            make.top.inset(20)
                                            make.height.equalTo(90)
                                        }
                                    },
                                    {
                                        type: "button",
                                        props: {
                                            symbol: "checkmark",
                                            bgcolor: $color("clear"),
                                            titleEdgeInsets: 10,
                                            contentEdgeInsets: 0
                                        },
                                        layout: make => {
                                            make.right.inset(10)
                                            make.bottom.inset(25)
                                            make.size.equalTo(30)
                                        },
                                        events: {
                                            tapped: () => {
                                                if (this.update_setting(key, $(key).text)) {
                                                    popover.dismiss()
                                                }
                                            }
                                        }
                                    }
                                ]
                            })
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                        make.size.equalTo(50)
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    create_number(key, title, number = "") {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "label",
                    props: {
                        id: key,
                        align: $align.right,
                        text: number
                    },
                    events: {
                        tapped: () => {
                            $input.text({
                                type: $kbType.number,
                                text: number,
                                placeholder: title,
                                handler: (text) => {
                                    const is_number = (str) => {
                                        let reg = /^[0-9]+.?[0-9]*$/
                                        return reg.test(str)
                                    }
                                    if (text === "" || !is_number(text)) {
                                        $ui.toast($l10n("INVALID_VALUE"))
                                        return
                                    }
                                    if (this.update_setting(key, text)) {
                                        $(key).text = text
                                    }
                                }
                            })
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                        make.height.equalTo(50)
                        make.width.equalTo(100)
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    create_stepper(key, title, value = 1, min = 1, max = 12) {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "label",
                    props: {
                        id: key,
                        text: value,
                        textColor: this.factory.text_color,
                        align: $align.left
                    },
                    layout: (make, view) => {
                        make.height.equalTo(view.super)
                        make.right.inset(120)
                    }
                },
                {
                    type: "stepper",
                    props: {
                        min: min,
                        max: max,
                        value: value
                    },
                    events: {
                        changed: (sender) => {
                            $(key).text = sender.value
                            if (!this.update_setting(key, sender.value)) {
                                $(key).text = this.kernel.setting.get(key)
                            }
                        }
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.prev)
                        make.right.inset(15)
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    create_script(title, script) {
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "view",
                    views: [
                        {// 仅用于显示图片
                            type: "button",
                            props: {
                                symbol: "chevron.right",
                                bgcolor: $color("clear"),
                                tintColor: this.factory.text_color
                            },
                            layout: (make, view) => {
                                make.centerY.equalTo(view.super)
                                make.right.inset(0)
                                make.size.equalTo(15)
                            }
                        },
                        {// 覆盖在图片上监听点击动作
                            type: "view",
                            events: {
                                tapped: () => {
                                    // 执行代码
                                    eval(script)
                                }
                            },
                            layout: (make, view) => {
                                make.right.inset(0)
                                make.size.equalTo(view.super)
                            }
                        }
                    ],
                    layout: (make, view) => {
                        make.right.inset(15)
                        make.height.equalTo(50)
                        make.width.equalTo(view.super)
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    create_tab(key, title, items, value) {
        for (let i = 0; i < items.length; i++) {
            items[i] = $l10n(items[i])
        }
        return {
            type: "view",
            views: [
                this.create_line_label(title),
                {
                    type: "tab",
                    props: {
                        items: items,
                        index: value,
                        dynamicWidth: true
                    },
                    layout: (make, view) => {
                        make.right.inset(15)
                        make.centerY.equalTo(view.prev)
                    },
                    events: {
                        changed: (sender) => {
                            this.update_setting(key, sender.index)
                        }
                    }
                }
            ],
            layout: $layout.fill
        }
    }

    get_views() {
        let header = this.factory.standard_header("setting_title", $l10n("SETTING"))
        let footer = {
            type: "view",
            props: { height: 130 },
            views: [
                {
                    type: "label",
                    props: {
                        font: $font(14),
                        text: `${$l10n("VERSION")} ${info.version} © ${info.author}`,
                        textColor: $color({
                            light: "#C0C0C0",
                            dark: "#545454"
                        }),
                        align: $align.center
                    },
                    layout: make => {
                        make.left.right.inset(0)
                        make.top.inset(10)
                    }
                }
            ]
        }
        return this.list.standard_list(header, footer, this.get_sections())
    }

    get_sections() {
        let sections = []
        for (let section of this.kernel.setting.struct) {
            let rows = []
            for (let item of section.items) {
                let value = this.kernel.setting.get(item.key)
                let row = null
                switch (item.type) {
                    case "switch":
                        row = this.create_switch(item.key, $l10n(item.title), value)
                        break
                    case "stepper":
                        row = this.create_stepper(item.key, $l10n(item.title), value, 1, 12)
                        break
                    case "string":
                        row = this.create_string(item.key, $l10n(item.title), value)
                        break
                    case "number":
                        row = this.create_number(item.key, $l10n(item.title), value)
                        break
                    case "info":
                        row = this.create_info($l10n(item.title), value)
                        break
                    case "script":
                        row = this.create_script($l10n(item.title), value)
                        break
                    case "tab":
                        row = this.create_tab(item.key, $l10n(item.title), item.items, value)
                        break
                    default:
                        continue
                }
                rows.push(row)
            }
            sections.push({
                title: $l10n(section.title),
                rows: rows
            })
        }
        return sections
    }
}

module.exports = BaseUISetting