const BaseUISetting = require("/scripts/ui/components/base-ui-setting")

class SettingUI extends BaseUISetting {
    constructor(kernel, factory) {
        super(kernel, factory)
    }

    readme() {
        const content = $file.read("/README.md").string
        this.factory.push([{
            type: "markdown",
            props: {
                content: content,
            },
            layout: (make, view) => {
                make.size.equalTo(view.super)
            }
        }])
    }

    tips_domain(){
        $ui.alert({
            title: $l10n("TIPS"),
            message: "更换入口的话，重启应用后才会生效哦~\n可在底部README中查看更多信息。",
        })
    }
}

module.exports = SettingUI