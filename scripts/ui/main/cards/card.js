class Card {
    constructor(kernel) {
        this.kernel = kernel
        this.iCloud = this.kernel.iCloudPath("/BoxJsHepler")
    }
}

module.exports = Card