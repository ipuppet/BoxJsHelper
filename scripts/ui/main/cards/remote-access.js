const Card = require("./card")

class RemoteAccessCard extends Card {
    constructor(kernel, factory) {
        super(kernel, factory)
    }

    card() {
        return {
            icon: { symbol: "paperplane" },
            title: { text: $l10n("REMOTE_ACCESS") },
            extra: {
                type: "switch",
                props: { on: this.kernel.setting.get("server.remote_access") },
                events: {
                    changed: sender => {
                        if (sender.on) {
                            this.kernel.setting.set("server.remote_access", true)
                            $ui.toast($l10n("REMOTE_ACCESS_STARTED"))
                        } else {
                            this.kernel.setting.set("server.remote_access", false)
                            $ui.toast($l10n("REMOTE_ACCESS_CLOSED"))
                        }
                    }
                }
            },
            events: {
                tapped: () => {
                    $ui.alert(this.kernel.server.remoteURL)
                }
            }
        }
    }
}

module.exports = RemoteAccessCard