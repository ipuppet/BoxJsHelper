const Logger = require("./logger")

class Server {
    constructor(kernel, port = null) {
        this.kernel = kernel
        this.logger = new Logger(this.kernel, "server-access")
        if (port === null) {
            port = this.kernel.setting.get("setting.about.server_port")
        }
        this.port = port
        this.domain = "boxjs.com"
        // 目前只有这两个域名
        if (this.kernel.setting.get("setting.about.domain"))
            this.domain = "boxjs.net"
        this.handler = {}
        this.server = $server.new()
        this.status = false // 服务状态
    }

    start_server() {
        if (this.status) return
        this.server.addHandler(this.get_handler())
        let options = {
            port: this.port
        }
        this.server.start(options)
        this.status = true
        if (this.kernel.setting.get("setting.about.log_request"))
            this.logger.info("Server Start.")
    }

    stop_server() {
        this.server.stop()
        this.status = false
        if (this.kernel.setting.get("setting.about.log_request"))
            this.logger.info("Server Stop.")
    }

    get_handler() {
        this.handler.filter = (rules) => {
            // 全部使用data
            return "data"
        }
        this.handler.asyncResponse = async (request, completion) => {
            let method = request.method
            let path = request.path
            let remote_address = request.remoteAddress
            // 判断是否记录日志
            if (this.kernel.setting.get("setting.about.log_request")) {
                this.logger.info(` ${remote_address} "${method}" ${path}`)
            }
            let response = {}
            if (method === "POST") {
                let content = await $http.post({
                    url: `http://${this.domain}${path}`,
                    body: JSON.parse(request.data.string)
                })
                if (content.data === "") {
                    content.data = "{}"
                }
                response = { json: content.data }
            } else {
                let content = await $http.get(`http://${this.domain}${path}`)
                response = { html: content.data + "" }
            }
            completion({
                type: "data",
                props: response
            })
        }
        return this.handler
    }
}

module.exports = Server