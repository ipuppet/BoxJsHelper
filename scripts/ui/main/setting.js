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
}

module.exports = SettingUI