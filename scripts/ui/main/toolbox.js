const { UIKit } = require("../../easy-jsbox")
const { Matrix } = require("./matrix")

class ToolboxUI {
    constructor(kernel) {
        this.kernel = kernel
        this.matrix = new Matrix()
        this.matrix.columns = 2
        this.matrix.height = 90
        this.matrix.spacing = 15
        this.cards = []
    }

    loadCards() {
        const cards = $file.list("scripts/ui/main/cards")
        cards.forEach(card => {
            const Card = require(`./cards/${card}`)
            this.cards.push(new Card(this.kernel).card())
        })
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
                    tintColor: UIKit.textColor
                }, data.icon),
                layout: make => {
                    make.top.left.inset(10)
                    make.size.equalTo(35)
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

    cardTemplate() {
        // TODO 排序
        let data = []
        for (let i = 0; i < this.cards.length; i++) {
            let card = this.cards[i]
            data[i] = this.matrix.cardTemplate(this.template(card), card["events"])
        }
        return data
    }

    getView() {
        this.loadCards()
        return this.matrix.scrollTemplate(this.cardTemplate())
    }
}

module.exports = ToolboxUI