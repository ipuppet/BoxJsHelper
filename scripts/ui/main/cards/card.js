class Card {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.iCloud = this.kernel.iCloud_path("/BoxJsHepler")
    }
}

module.exports = Card