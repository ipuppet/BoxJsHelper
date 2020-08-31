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
        nav_buttons = nav_buttons.concat([
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
        ])
        $ui.push({
            props: {
                navBarHidden: true,
                statusBarStyle: 0
            },
            views: [
                {
                    type: "view",
                    props: { clipsToBounds: true },
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
     * 用于创建一个靠右侧按钮（自动布局）
     * @param {String} id 不可重复
     * @param {String} symbol symbol图标（目前只用symbol）
     * @param {CallableFunction} tapped 按钮点击事件，会传入两个函数，start()和done(status, message)
     *     调用 start() 表明按钮被点击，准备开始动画
     *     调用 done() 表明您的操作已经全部完成，默认操作成功完成，播放一个按钮变成对号的动画
     *                 若第一个参数传出false则表示运行出错
     *                 第二个参数为错误原因($ui.toast(message))
     *     示例：
     *      (start, done) => {
     *          start()
     *          const upload = (data) => { return false }
     *          if(upload(data)) { done() }
     *          else { done(false, "Upload Error!") }
     *      }
     */
    nav_button(id, symbol, tapped) {
        let action_start = () => {
            // 隐藏button，显示spinner
            $(id).alpha = 0
            $("spinner_" + id).alpha = 1
        }

        let action_done = (status = true, message = $l10n("ERROR")) => {
            $("spinner_" + id).alpha = 0
            let button = $(id)
            if (!status) { // 失败
                $ui.toast(message)
                button.alpha = 1
                return
            }
            // 成功动画
            button.symbol = "checkmark"
            $ui.animate({
                duration: 0.6,
                animation: () => {
                    button.alpha = 1
                },
                completion: () => {
                    setTimeout(() => {
                        $ui.animate({
                            duration: 0.4,
                            animation: () => {
                                button.alpha = 0
                            },
                            completion: () => {
                                button.symbol = symbol
                                $ui.animate({
                                    duration: 0.4,
                                    animation: () => {
                                        button.alpha = 1
                                    },
                                    completion: () => {
                                        button.alpha = 1
                                    }
                                })
                            }
                        })
                    }, 600)
                }
            })
        }
        return {
            type: "view",
            props: { id: id },
            views: [
                {
                    type: "button",
                    props: {
                        id: id,
                        tintColor: this.text_color,
                        symbol: symbol,
                        bgcolor: $color("clear")
                    },
                    events: {
                        tapped: () => {
                            tapped(action_start, action_done)
                        }
                    },
                    layout: (make, view) => {
                        make.size.equalTo(view.super)
                    }
                },
                {
                    type: "spinner",
                    props: {
                        id: "spinner_" + id,
                        loading: true,
                        alpha: 0
                    },
                    layout: (make, view) => {
                        make.size.equalTo(view.prev)
                    }
                }
            ],
            layout: (make, view) => {
                make.size.equalTo(20)
                if (view.prev) {
                    make.right.equalTo(view.prev.left).offset(-20)
                } else {
                    make.right.inset(20)
                }
            }
        }
    }

    /**
     * 标准页面头
     * @param {*} id 标题id
     * @param {*} title 标题文本
     */
    standard_header(id, title) {
        return {
            type: "view",
            info: { id: id, title: title }, // 供动画使用
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
                    make.left.inset(20)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            }]
        }
    }

    /**
     * 菜单内容转换成模板（通常在点击后触发）
     */
    template_menu() {
        let views = []
        for (let i = 0; i < this.menus.length; i++) {
            if (typeof this.menus[i].icon !== "object") {
                this.menus[i].icon = [this.menus[i].icon, this.menus[i].icon]
            } else if (this.menus[i].icon.length === 1) {
                this.menus[i].icon = [this.menus[i].icon[0], this.menus[i].icon[0]]
            }
            let menu = {
                info: {
                    index: i,
                    icon: {
                        id: `menu-item-icon-${i}`,
                        icon: this.menus[i].icon,
                        tintColor: ["lightGray", "systemLink"]
                    },
                    title: {
                        id: `menu-item-title-${i}`,
                        textColor: ["lightGray", "systemLink"]
                    }
                },
                icon: {
                    id: `menu-item-icon-${i}`,
                    image: $image(this.menus[i].icon[0]),
                    tintColor: $color("lightGray")
                },
                title: {
                    id: `menu-item-title-${i}`,
                    text: this.menus[i].title,
                    textColor: $color("lightGray")
                }
            }
            // 当前页面
            if (this.selected_page === i) {
                menu.icon.image = $image(this.menus[i].icon[1])
                menu.icon.tintColor = $color("systemLink")
                menu.title.textColor = $color("systemLink")
            }
            views.push({
                type: "view",
                props: {
                    info: menu.info,
                    id: `menu-item-${i}`
                },
                views: [
                    {
                        type: "image",
                        props: Object.assign({
                            bgcolor: $color("clear")
                        }, menu.icon),
                        layout: (make, view) => {
                            make.centerX.equalTo(view.super)
                            make.size.equalTo(25)
                            make.top.inset(7)
                        }
                    },
                    {
                        type: "label",
                        props: Object.assign({
                            font: $font(10)
                        }, menu.title),
                        layout: (make, view) => {
                            make.centerX.equalTo(view.prev)
                            make.bottom.inset(5)
                        }
                    }
                ],
                layout: (make, view) => {
                    make.size.equalTo(50)
                    let width = $device.info.screen.width
                    let length = this.menus.length
                    let spacing = (width - length * 50) / (length + 1)
                    if (view.prev) {
                        make.left.equalTo(view.prev.right).offset(spacing)
                    } else {
                        make.left.inset(spacing)
                    }
                },
                events: {
                    tapped: sender => {
                        if (this.selected_page === sender.info.index) return
                        // menu动画
                        $ui.animate({
                            duration: 0.4,
                            animation: () => {
                                // 点击的图标
                                let data = sender.info
                                let icon = $(data.icon.id)
                                icon.image = $image(data.icon.icon[1])
                                icon.tintColor = $color(data.icon.tintColor[1])
                                $(data.title.id).textColor = $color(data.title.textColor[1])

                            }
                        })
                        // 之前的图标
                        let data = $(`menu-item-${this.selected_page}`).info
                        let icon = $(data.icon.id)
                        icon.image = $image(data.icon.icon[0])
                        icon.tintColor = $color(data.icon.tintColor[0])
                        $(data.title.id).textColor = $color(data.title.textColor[0])
                        // 切换页面
                        for (let i = 0; i < this.page_index.length; i++) {
                            $(this.page_index[i]).hidden = i !== sender.info.index
                        }
                        this.selected_page = sender.info.index
                    }
                }
            })
        }
        return views
    }

    /**
     * 菜单
     */
    menu() {
        return {
            type: "view",
            props: {
                id: "menu",
                bgcolor: $color("clear"),

            },
            views: this.template_menu(),
            layout: (make, view) => {
                make.top.inset(0)
                if ($device.info.screen.width > 500) {
                    make.width.equalTo(500)
                } else {
                    make.left.right.inset(0)
                }
                make.centerX.equalTo(view.super)
                make.height.equalTo(50)
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
                clipsToBounds: true
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
                statusBarStyle: 0
            },
            layout: $layout.fill,
            views: [
                {
                    type: "view",
                    props: { clipsToBounds: true },
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
                            props: { style: this.blur_style },
                            layout: $layout.fill
                        },
                        this.menu()
                    ]
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