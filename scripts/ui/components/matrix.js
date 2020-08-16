class Matrix {
    constructor() {
        this.is_first = true
        this.index_flag = 1
        this.height = 90
        this.spacing = 15
        this.columns = 2
    }

    get_width() {
        if (undefined === this.width) {
            this.width = $device.info.screen.width / this.columns
            this.width = this.width - this.spacing * (this.columns + 1) / this.columns
        }
        return this.width
    }

    create_card(views, events) {
        return {
            type: "view",
            props: {
                bgcolor: $color("tertiarySurface"),
                cornerRadius: 10
            },
            layout: (make, view) => {
                if (this.index_flag === 1) {
                    make.left.inset(this.spacing)
                    if (this.is_first) {
                        make.top.inset(this.spacing)
                        this.is_first = false
                    } else {
                        make.top.equalTo(view.prev).offset(this.height + this.spacing)
                    }
                } else {
                    make.left.equalTo(view.prev).offset(this.get_width() + this.spacing)
                    make.top.equalTo(view.prev)
                }
                if (this.index_flag === this.columns) this.index_flag = 1
                else this.index_flag++
                make.size.equalTo($size(this.get_width(), this.height))
            },
            views: views,
            events: events
        }
    }
}

module.exports = Matrix