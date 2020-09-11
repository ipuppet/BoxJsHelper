class Card {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.iCloud = this.kernel.iCloudPath("/BoxJsHepler")
    }
}

module.exports = Card