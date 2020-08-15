const Server = require("/scripts/server")

class ServerUI extends Server {
    constructor(kernel) {
        super(kernel)
    }

    get_views() {
        return [
            {
                type: "label",
                props: {
                    id: "server_status_label",
                    text: $l10n("SERVER_CLOSED"),
                    textColor: $color("primaryText")
                },
                layout: (make, view) => {
                    make.centerY.equalTo(view.super).offset(-150)
                    make.centerX.equalTo(view.super)
                }
            },
            {
                type: "switch",
                events: {
                    changed: (sender) => {
                        if (sender.on) {
                            this.start_server()
                            $("server_status_label").text = $l10n("SERVER_STARTED")
                        } else {
                            this.stop_server()
                            $("server_status_label").text = $l10n("SERVER_CLOSED")
                        }
                    }
                },
                layout: (make, view) => {
                    make.centerY.equalTo(view.super).offset(-50)
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
                    make.centerY.equalTo(view.super).offset(50)
                    make.centerX.equalTo(view.super)
                }
            }
        ]
    }
}

module.exports = ServerUI