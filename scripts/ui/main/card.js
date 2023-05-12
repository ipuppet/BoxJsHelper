class CardBase {
    constructor(kernel) {
        this.kernel = kernel
        this.iCloud = this.kernel.iCloudPath("/BoxJsHepler")
        this.emptyList = {
            type: "label",
            layout: (make, view) => {
                make.centerX.equalTo(view.super)
                make.top.inset(20)
            },
            props: {
                id: "cardEmptyListTemplate",
                text: $l10n("EMPTY_LIST"),
                align: $align.center,
                color: $color("darkGray")
            }
        }
    }
}

module.exports = CardBase
