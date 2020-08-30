const Logger = require("./logger")

class Server {
    constructor(setting, port = null) {
        this.setting = setting
        this.logger = new Logger("server-access")
        if (port === null) {
            port = this.setting.get("advanced.server_port")
        }
        this.port = port
        this.domain = "boxjs.com"
        // 目前只有这两个域名
        if (this.setting.get("advanced.domain"))
            this.domain = "boxjs.net"
        this.handler = {}
        this.server = $server.new()
    }

    start_server() {
        if (this.server.running) return
        this.server.addHandler(this.get_handler())
        let options = {
            port: this.port
        }
        this.server.start(options)
        if (this.setting.get("server.log_request"))
            this.logger.info("Server Start.")
    }

    stop_server() {
        this.server.stop()
        if (this.setting.get("server.log_request"))
            this.logger.info("Server Stop.")
    }

    async log_request(request) {
        // 判断是否记录日志
        if (this.setting.get("server.log_request")) {
            let message = ` ${request.remoteAddress} "${request.method}" ${request.path}`
            this.logger.info(message)
        }
    }

    is_localhost(request) {
        let req_host = request.remoteAddress
        req_host = req_host.substring(0, req_host.indexOf(":"))
        return this.server.serverURL.host === req_host
    }

    async response(request) {
        let response
        let content
        if (request.method === "POST") {
            content = await $http.post({
                url: `http://${this.domain}${request.path}`,
                body: JSON.parse(request.data.string)
            })
            if (content.data === "") {
                content.data = {}
            }
        } else {
            content = await $http.get(`http://${this.domain}${request.path}`)
        }
        // 检查结构
        if (content.data !== null && typeof content.data === "object")
            response = { json: content.data }
        else
            response = { html: content.data + "" }
        return response
    }

    async handle(request, completion) {
        this.log_request(request)
        let response
        if (this.is_localhost(request)) {
            response = await this.response(request)
        } else {
            if (this.setting.get("server.remote_access")) {
                response = await this.response(request)
            } else {
                response = { statusCode: 400, hasBody: false }
            }
        }
        completion({
            type: "data",
            props: response
        })
    }

    get_handler() {
        this.handler.filter = () => {
            // 全部使用data
            return "data"
        }
        this.handler.asyncResponse = async (request, completion) => {
            await this.handle(request, completion)
        }
        return this.handler
    }
}

module.exports = Server