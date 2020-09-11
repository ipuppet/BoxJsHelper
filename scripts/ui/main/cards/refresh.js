const Card = require("./card")

class RefreshCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
    }

    card() {
        return {
            icon: { symbol: "arrow.clockwise" },
            title: {
                text: $l10n("REFRESH") + $l10n("BOXJS")
            },
            events: {
                tapped: () => {
                    require("/scripts/ui/main/home").refresh(this.kernel.setting.get("general.refreshConfirm"))
                }
            }
        }
    }
}

module.exports = RefreshCard