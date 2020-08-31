const info = JSON.parse($file.read("/config.json"))["info"]

class BaseUISetting {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.title_size = 35
        this.title_size_max = 40
        this.title_offset = 50
        this.top_offset = -10
    }

    update_setting(key, value) {
        return this.kernel.setting.set(key, value)
    }

    create_line_label(title, icon) {
        if (!icon[1]) icon[1] = "#00CC00"
        if (typeof icon[1] !== "object") {
            icon[1] = [icon[1], icon[1]]
        }
        if (typeof icon[0] !== "object") {
            icon[0] = [icon[0], icon[0]]
        }
        return {
            type: "view",
            views: [
                {// icon
                    type: "view",
                    props: {
                        bgcolor: $color(icon[1][0], icon[1][1]),
                        cornerRadius: 5,
                        smoothCorners: true
                    },
                    views: [
                        {
                            type: "image",
                            props: {
                                tintColor: $color("white"),
                                image: $image(icon[0][0], icon[0][1])
                            },
                            layout: (make, view) => {
                                make.center.equalTo(view.super)
                                make.size.equalTo(20)
                            }
                        },
                    ],
                    layout: (make, view) => {
                        make.centerY.equalTo(view.super)
                        make.size.equalTo(30)
                        make.left.inset(10)
                    }
                },
                {// title
                    type: "label",
                    props: {
                        text: title,
                        textColor: this.factory.text_color,
                        align: $align.left
                    },
                    layout: (make, view) => {
                        make.centerY.equalTo(view.super)
                        make.height.equalTo(view.super)
                        make.left.equalTo(view.prev.right).offset(10)
                    }
                }
            ],
            layout: (make, view) => {
                make.centerY.equalTo(view.super)
                make.height.equalTo(view.super)
                make.left.inset(0)
            }
        }
    }

    create_info(icon, title, value) {
        let is_array = Array.isArray(value)
        let text = is_array ? value[0] : value
        let more_info = is_array ? value[1] : value
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
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
                        make.width.equalTo(180)
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

    create_switch(key, icon, title, on = true) {
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
                {
                    type: "switch",
                    props: {
                        on: on,
                        onColor: $color("#00CC00")
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

    create_string(key, icon, title, text = "") {
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
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

    create_number(key, icon, title, number = "") {
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
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

    create_stepper(key, icon, title, value = 1, min = 1, max = 12) {
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
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

    create_script(icon, title, script) {
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
                {
                    type: "view",
                    views: [
                        {// 仅用于显示图片
                            type: "button",
                            props: {
                                symbol: "chevron.right",
                                bgcolor: $color("clear"),
                                tintColor: $color("secondaryText")
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

    create_tab(key, icon, title, items, value) {
        for (let i = 0; i < items.length; i++) {
            items[i] = $l10n(items[i])
        }
        return {
            type: "view",
            views: [
                this.create_line_label(title, icon),
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
        return this.standard_list(header, footer, this.get_sections())
    }

    get_sections() {
        let sections = []
        for (let section of this.kernel.setting.struct) {
            let rows = []
            for (let item of section.items) {
                let value = this.kernel.setting.get(item.key)
                let row = null
                if (!item.icon) item.icon = ["square.grid.2x2.fill", "#00CC00"]
                switch (item.type) {
                    case "switch":
                        row = this.create_switch(item.key, item.icon, $l10n(item.title), value)
                        break
                    case "stepper":
                        row = this.create_stepper(item.key, item.icon, $l10n(item.title), value, 1, 12)
                        break
                    case "string":
                        row = this.create_string(item.key, item.icon, $l10n(item.title), value)
                        break
                    case "number":
                        row = this.create_number(item.key, item.icon, $l10n(item.title), value)
                        break
                    case "info":
                        row = this.create_info(item.icon, $l10n(item.title), value)
                        break
                    case "script":
                        row = this.create_script(item.icon, $l10n(item.title), value)
                        break
                    case "tab":
                        row = this.create_tab(item.key, item.icon, $l10n(item.title), item.items, value)
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

    /**
     * 标准列表视图
     * @param {Object} header 该对象中需要包含一个标题label的id和title (info: { id: id, title: title }) 供动画使用
     * @param {*} footer 视图对象
     * @param {*} data
     * @param {*} events
     */
    standard_list(header, footer, data, events = {}) {
        return [
            {
                type: "view",
                layout: $layout.fill,
                views: [{
                    type: "list",
                    props: {
                        style: 2,
                        separatorInset: $insets(0, 50, 0, 10),
                        rowHeight: 50,
                        indicatorInsets: $insets(55, 0, 50, 0),
                        header: header,
                        footer: footer,
                        data: data
                    },
                    events: Object.assign({
                        didScroll: sender => {
                            // 下拉放大字体
                            if (sender.contentOffset.y <= this.top_offset) {
                                let size = 35 - sender.contentOffset.y * 0.04
                                if (size > this.title_size_max)
                                    size = this.title_size_max
                                $(header.info.id).font = $font("bold", size)
                            }
                            // 顶部信息栏
                            if (sender.contentOffset.y >= 25) {
                                $ui.animate({
                                    duration: 0.2,
                                    animation: () => {
                                        $(header.info.id + "_header").alpha = 1
                                        $(header.info.id).alpha = 0
                                    }
                                })
                            } else if (sender.contentOffset.y < 25) {
                                $ui.animate({
                                    duration: 0.2,
                                    animation: () => {
                                        $(header.info.id + "_header").alpha = 0
                                        $(header.info.id).alpha = 1
                                    }
                                })
                            }
                        }
                    }, events),
                    layout: $layout.fill
                }]
            },
            {
                type: "view",
                props: {
                    id: header.info.id + "_header",
                    alpha: 0
                },
                layout: (make, view) => {
                    make.left.top.right.inset(0)
                    make.bottom.equalTo(view.super.safeAreaTop).offset(45)
                },
                views: [
                    {
                        type: "blur",
                        props: { style: this.factory.blur_style },
                        layout: $layout.fill
                    },
                    {
                        type: "canvas",
                        layout: (make, view) => {
                            make.top.equalTo(view.prev.bottom)
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
                    },
                    {
                        type: "view",
                        layout: $layout.fill,
                        views: [{
                            type: "label",
                            props: {
                                text: header.info.title,
                                font: $font("bold", 17),
                                align: $align.center,
                                bgcolor: $color("clear"),
                                textColor: this.text_color
                            },
                            layout: (make, view) => {
                                make.left.right.inset(0)
                                make.top.equalTo(view.super.safeAreaTop)
                                make.bottom.equalTo(view.super)
                            }
                        }]
                    }
                ]
            }
        ]
    }
}

module.exports = BaseUISetting