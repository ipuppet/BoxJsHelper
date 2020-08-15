class HomeUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    get_views() {
        return [
            {
                type: "web",
                props: {
                    url: "http://boxjs.com/",
                    opaque: false,
                },
                layout: (make, view) => {
                    make.top.equalTo(view.super.safeAreaTop)
                    make.width.equalTo(view.super)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-50)
                }
            }
        ]
    }
}

module.exports = HomeUI