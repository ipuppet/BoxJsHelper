class Matrix {
    constructor() {
        this.isFirst = true
        this.indexFlag = 1
        this.height = 90
        this.spacing = 15
        this.columns = 2
    }

    getWidth() {
        if (undefined === this.width) {
            this.width = $device.info.screen.width / this.columns
            this.width = this.width - this.spacing * (this.columns + 1) / this.columns
        }
        return this.width
    }

    cardTemplate(views, events) {
        return {
            type: "view",
            props: {
                bgcolor: $color("tertiarySurface"),
                cornerRadius: 10
            },
            layout: (make, view) => {
                if (this.indexFlag === 1) {
                    make.left.inset(this.spacing)
                    if (this.isFirst) {
                        make.top.inset(this.spacing)
                        this.isFirst = false
                    } else {
                        make.top.equalTo(view.prev).offset(this.height + this.spacing)
                    }
                } else {
                    make.left.equalTo(view.prev).offset(this.getWidth() + this.spacing)
                    make.top.equalTo(view.prev)
                }
                if (this.indexFlag === this.columns) this.indexFlag = 1
                else this.indexFlag++
                make.size.equalTo($size(this.getWidth(), this.height))
            },
            views: views,
            events: events
        }
    }

    scrollTemplate(data, bottomOffset = 0) {
        // 计算尺寸
        let line = Math.ceil(data.length / this.columns)
        let height = line * (this.height + this.spacing) + bottomOffset
        return {
            type: "scroll",
            props: {
                bgcolor: $color("insetGroupedBackground"),
                scrollEnabled: true,
                indicatorInsets: $insets(this.spacing, 0, 50, 0),
                contentSize: $size(0, height)
            },
            views: data,
            layout: (make, view) => {
                make.left.right.inset(0)
                make.bottom.inset(0)
                make.top.equalTo(view.prev).offset(50)
            }
        }
    }
}

module.exports = Matrix