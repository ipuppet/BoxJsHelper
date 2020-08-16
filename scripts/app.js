const MainUI = require("./ui/main")
const Setting = require("./setting")

class Kernel {
    constructor() {
        this.setting = new Setting()
    }

    ui_push(views, parent_title = $l10n("BACK"), nav_buttons = []) {
        nav_buttons = [
            {
                type: "button",
                props: {
                    image: $image("assets/icon/back.png", "assets/icon/back-dark.png"),
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.left.inset(10)
                    make.size.equalTo(20)
                }
            },
            {
                type: "label",
                props: {
                    text: parent_title,
                    textColor: $color("primaryText"),
                    font: $font(18)
                },
                layout: (make, view) => {
                    make.height.equalTo(view.prev)
                    make.left.equalTo(view.prev.right).inset(3)
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
}

module.exports = {
    run: () => {
        // 实例化应用核心
        let kernel = new Kernel()
        // 渲染UI
        new MainUI(kernel).render()
    }
}