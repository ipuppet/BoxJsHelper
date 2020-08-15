const Server = require("/scripts/server")

class TodayUI extends Server {
    constructor(kernel) {
        super(kernel)
    }

    render() {
        $ui.render({
            props: {
                title: ""
            },
            views: [
                {
                    type: "switch",
                    events: {
                        changed: (sender) => {
                            if (sender.on) {
                                this.start_server()
                            } else {
                                this.stop_server()
                            }
                        }
                    },
                    layout: (make, view) => {
                        make.top.inset(0)
                        make.centerX.equalTo(view.super)
                    }
                },
                {
                    type: "label",
                    props: {
                        id: "server_path_label",
                        align: $align.center,
                        text: `${$l10n("VISIT_ON_CONPUTER")}:\n${$device.wlanAddress}:${this.port}`,
                        textColor: $color("primaryText"),
                        lines: 0
                    },
                    layout: (make, view) => {
                        make.top.inset(50)
                        make.centerX.equalTo(view.super)
                    }
                }
            ],
            layout: $layout.fill
        })
    }
}

module.exports = TodayUI