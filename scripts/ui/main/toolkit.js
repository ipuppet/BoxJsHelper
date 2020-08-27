const Matrix = require("/scripts/ui/components/matrix")
// 引入卡片
const RefreshCard = require("./cards/refresh")
const RemoteAccessCard = require("./cards/remote-access")
const LogCard = require("./cards/log")
const BackupCard = require("./cards/backup")
const TodayCard = require("./cards/today")

class ToolkitUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.matrix = new Matrix()
        this.matrix.columns = 2
        this.matrix.height = 90
        this.matrix.spacing = 15
    }

    load_cards() {
        this.cards = [
            new RefreshCard(this.kernel, this.factory).card(),
            new RemoteAccessCard(this.kernel, this.factory).card(),
            new LogCard(this.kernel, this.factory).card(),
            new BackupCard(this.kernel, this.factory).card(),
            new TodayCard(this.kernel, this.factory).card()
        ]
    }

    /**
     * 卡片内容样式
     * @param {*} data
     */
    template(data) {
        let views = [
            {
                type: "image",
                props: Object.assign({
                    tintColor: this.factory.text_color
                }, data.icon),
                layout: make => {
                    make.top.left.inset(10)
                    make.size.equalTo(30)
                }
            },
            {
                type: "label",
                props: Object.assign({
                    font: $font(18),
                    textColor: $color("primaryText", "secondaryText")
                }, data.title),
                layout: make => {
                    make.bottom.left.inset(10)
                }
            }
        ]
        if (data.extra) {
            views.push({
                type: data.extra.type,
                props: Object.assign({}, data.extra.props),
                events: data.extra.events,
                layout: make => {
                    make.right.top.inset(10)
                    make.height.equalTo(30)
                }
            })
        }
        return views
    }

    template_card() {
        // TODO 排序
        let data = []
        for (let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i]
            data[i] = this.matrix.template_card(this.template(card), card["events"])
        }
        return data
    }

    get_views() {
        this.load_cards()
        return [
            {
                type: "label",
                props: {
                    text: $l10n("TOOLKIT"),
                    align: $align.left,
                    font: $font("bold", 34),
                    textColor: $color("primaryText", "secondaryText"),
                    line: 1
                },
                layout: (make, view) => {
                    make.left.inset(10)
                    make.width.equalTo(120)
                    make.height.equalTo(40)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            },
            // 第二个参数是为了防止被下面菜单挡住最后一行的内容
            this.matrix.template_scroll(this.template_card(), 50 + this.matrix.spacing)
        ]
    }
}

module.exports = ToolkitUI