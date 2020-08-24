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

    tips_domain() {
        const message = `点击 "功能->远程访问" 即可查看远程访问地址。
        首屏显示将确定软件在打开时显示哪个页面。
        更换入口的话，重启应用后才会生效哦~
        可在底部README中查看更多信息。`
        $ui.alert({
            title: $l10n("TIPS"),
            message: message,
        })
    }
}

module.exports = SettingUI