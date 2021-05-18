const Card = require("../card")

class RemoteAccessCard extends Card {
    card() {
        return {
            icon: { symbol: "paperplane" },
            title: { text: $l10n("REMOTE_ACCESS") },
            extra: {
                type: "switch",
                props: { on: this.kernel.setting.get("server.remoteAccess") },
                events: {
                    changed: sender => {
                        if (sender.on) {
                            this.kernel.setting.set("server.remoteAccess", true)
                            $ui.toast($l10n("REMOTE_ACCESS_STARTED"))
                        } else {
                            this.kernel.setting.set("server.remoteAccess", false)
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