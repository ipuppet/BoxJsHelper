class BaseUI {
    constructor(kernel) {
        this.kernel = kernel
        this.selected_page = 0 // 当前显示的页面
        // all
        this.blur_style = $blurStyle.thinMaterial
        this.text_color = $color("primaryText", "secondaryText")
    }

    /**
     * 重新设计$ui.push()
     * @param {*} views 视图
     * @param {*} parent_title 上级目录名称，显示在返回按钮旁边
     * @param {*} nav_buttons 右侧按钮，需要自己调整位置
     */
    push(views, parent_title = $l10n("BACK"), nav_buttons = []) {
        nav_buttons = [
            {
                type: "button",
                props: {
                    symbol: "chevron.left",
                    tintColor: this.text_color,
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.left.inset(10)
                    make.size.equalTo(30)
                }
            },
            {
                type: "label",
                props: {
                    text: parent_title,
                    textColor: this.text_color,
                    font: $font(18)
                },
                layout: (make, view) => {
                    make.height.equalTo(view.prev)
                    make.left.equalTo(view.prev.right)
                }
            },
            {
                type: "view",
                props: {
                    bgolor: $color("blue")
                },
                layout: (make, view) => {
                    make.height.equalTo(view.prev)
                    make.width.equalTo(view.prev).offset(20)
                    make.left.inset(10)
                },
                events: {
                    tapped: () => {
                        $ui.pop()
                    }
                }
            }
        ].concat(nav_buttons)
        $ui.push({
            props: {
                navBarHidden: true,
                statusBarStyle: 0
            },
            views: [
                {
                    type: "view",
                    props: {
                        clipsToBounds: true,
                    },
                    layout: $layout.fillSafeArea,
                    views: [
                        {
                            type: "view",
                            views: nav_buttons,
                            layout: (make, view) => {
                                make.top.inset(20)
                                make.width.equalTo(view.super)
                                make.height.equalTo(20)
                            }
                        },
                        {
                            type: "view",
                            views: views,
                            layout: (make, view) => {
                                make.top.equalTo(view.prev).offset(30)
                                make.width.equalTo(view.super)
                                make.bottom.equalTo(view.super.safeAreaBottom)
                            }
                        }
                    ]
                }
            ]
        })
    }

    /**
     * 标准页面头
     * @param {*} id 标题id
     * @param {*} title 标题文本
     */
    standard_header(id, title) {
        return {
            type: "view",
            info: {id: id, title: title}, // 供动画使用
            props: {
                height: 90
            },
            views: [{
                type: "label",
                props: {
                    id: id,
                    text: title,
                    textColor: this.text_color,
                    align: $align.left,
                    font: $font("bold", 35),
                    line: 1
                },
                layout: (make, view) => {
                    make.left.inset(10)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            }]
        }
    }

    /**
     * 菜单内容转换成模板（通常在点击后触发）
     */
    template_menu() {
        for (let i = 0; i < this.menu_data.length; i++) {
            if (this.selected_page === i) {
                this.menu_data[i].icon["alpha"] = 1
                this.menu_data[i].title["alpha"] = 1
                this.menu_data[i].icon["tintColor"] = $color("systemLink")
                this.menu_data[i].title["textColor"] = $color("systemLink")
            } else {
                this.menu_data[i].icon["alpha"] = 0.5
                this.menu_data[i].title["alpha"] = 0.5
                this.menu_data[i].icon["tintColor"] = $color("primaryText")
                this.menu_data[i].title["textColor"] = $color("primaryText")
            }
        }
        return this.menu_data
    }

    /**
     * 菜单
     */
    menu() {
        return {
            type: "matrix",
            props: {
                id: "menu",
                columns: this.menu_data.length,
                itemHeight: 50,
                spacing: 0,
                scrollEnabled: false,
                bgcolor: $color("clear"),
                template: [
                    {
                        type: "image",
                        props: {
                            id: "icon",
                            bgcolor: $color("clear")
                        },
                        layout: (make, view) => {
                            make.centerX.equalTo(view.super)
                            make.size.equalTo(25)
                            make.top.inset(7)
                        },
                    },
                    {
                        type: "label",
                        props: {
                            id: "title",
                            font: $font(10)
                        },
                        layout: (make, view) => {
                            make.centerX.equalTo(view.prev)
                            make.bottom.inset(5)
                        }
                    }
                ],
                data: this.template_menu(),
            },
            layout: (make, view) => {
                make.top.inset(0)
                if ($device.info.screen.width > 500) {
                    make.width.equalTo(500)
                } else {
                    make.left.right.inset(0)
                }
                make.centerX.equalTo(view.super)
                make.height.equalTo(50)
            },
            events: {
                didSelect: (sender, indexPath) => {
                    this.selected_page = indexPath.item
                    for (let i = 0; i < this.page_index.length; i++) {
                        $(this.page_index[i]).hidden = i !== this.selected_page
                    }
                    setTimeout(() => {
                        sender.data = this.template_menu()
                    }, 100)
                }
            }
        }
    }

    /**
     * 创建一个页面
     * @param {*} views 页面内容
     * @param {*} index 页面索引，需要和菜单对应
     */
    creator(views, index) {
        return {
            type: "view",
            props: {
                id: this.page_index[index],
                hidden: this.selected_page !== index,
                clipsToBounds: true,
            },
            layout: (make, view) => {
                make.size.equalTo(view.super)
            },
            views: views
        }
    }

    /**
     * 渲染页面
     */
    render() {
        $ui.render({
            type: "view",
            props: {
                navBarHidden: true,
                statusBarStyle: 0,
            },
            layout: $layout.fill,
            views: [
                {
                    type: "view",
                    props: {
                        clipsToBounds: true,
                    },
                    layout: $layout.fill,
                    views: this.views
                },
                {
                    type: "view",
                    layout: (make, view) => {
                        make.top.equalTo(view.super.safeAreaBottom).offset(-50)
                        make.bottom.left.right.inset(0)
                    },
                    views: [
                        {
                            type: "blur",
                            props: {
                                style: this.blur_style,
                            },
                            layout: $layout.fill,
                        },
                        this.menu()
                    ],
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
            ]
        })
    }
}

module.exports = BaseUI