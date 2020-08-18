class List {
    constructor(factory) {
        this.factory = factory
        this.title_size = 35
        this.title_size_max = 40
        this.title_offset = 50
        this.top_offset = -10
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
                        style: 1,
                        bgcolor: $color("clear"),
                        rowHeight: 50,
                        indicatorInsets: $insets(40, 0, 50, 0),
                        header: header,
                        footer: footer,
                        data: data,
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
                            if (sender.contentOffset.y >= 5) {
                                $ui.animate({
                                    duration: 0.2,
                                    animation: () => {
                                        $(header.info.id + "_header").alpha = 1
                                    },
                                })
                            } else if (sender.contentOffset.y < 5) {
                                $ui.animate({
                                    duration: 0.2,
                                    animation: () => {
                                        $(header.info.id + "_header").alpha = 0
                                    },
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
                    hidden: false,
                    alpha: 0,
                },
                layout: (make, view) => {
                    make.left.top.right.inset(0)
                    make.bottom.equalTo(view.super.safeAreaTop).offset(45)
                },
                views: [
                    {
                        type: "blur",
                        props: {
                            style: this.factory.blur_style,
                        },
                        layout: $layout.fill,
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
                                textColor: this.text_color,
                            },
                            layout: (make, view) => {
                                make.left.right.inset(0)
                                make.top.equalTo(view.super.safeAreaTop)
                                make.bottom.equalTo(view.super)
                            },
                        }]
                    }
                ]
            }
        ]
    }
}

module.exports = List