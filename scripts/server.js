const Logger = require("./logger")

class Server {
    constructor(setting, port = null) {
        this.setting = setting
        this.logger = new Logger("server-access")
        if (port === null) {
            port = this.setting.get("advanced.serverPort")
        }
        this.port = port
        this.domain = this.setting.get("advanced.domain") ?? "boxjs.net"
        this.timeout = 3
        this.handler = {}
        this.server = $server.new()
    }

    startServer() {
        if (this.server.running) return
        this.server.addHandler(this.getHandler())
        let options = {
            port: this.port
        }
        this.server.start(options)
        if (this.setting.get("server.logRequest")) {
            this.logger.info("Server Start.")
        }
        // 访问地址
        this.serverURL = `http://localhost:${this.port}`
        if (this.server.serverURL) {
            this.remoteURL = this.server.serverURL.string
            if (this.remoteURL.lastIndexOf("/") === this.remoteURL.length - 1) {
                this.remoteURL = this.remoteURL.slice(0, -1)
            }
        } else {
            this.remoteURL = `http://${$device.wlanAddress}:${this.port}`
        }
    }

    stopServer() {
        this.server.stop()
        if (this.setting.get("server.logRequest"))
            this.logger.info("Server Stop.")
    }

    async logRequest(request) {
        // 判断是否记录日志
        if (this.setting.get("server.logRequest")) {
            let message = ` ${request.remoteAddress} "${request.method}" ${request.path}`
            this.logger.info(message)
        }
    }

    isLocalhost(request) {
        let reqHost = request.remoteAddress
        reqHost = reqHost.substring(0, reqHost.lastIndexOf(":"))
        const localhost = ["localhost", "::1", "127.0.0.1", $device.wlanAddress]
        return localhost.includes(reqHost)
    }

    async response(request) {
        let response = {}
        let content = {}
        if (request.method === "POST") {
            let body = {}
            try {
                body = JSON.parse(request.data.string)
            } catch (error) { }
            content = await $http.post({
                timeout: this.timeout,
                url: `http://${this.domain}${request.path}`,
                body: body
            })
            if (content.data === "") {
                content.data = {}
            }
        } else if (request.method === "GET") {
            content = await $http.get({
                timeout: this.timeout,
                url: `http://${this.domain}${request.path}`
            })
        } else if (request.method === "OPTIONS") {
            content = await $http.request({
                method: "OPTIONS",
                timeout: this.timeout,
                url: `http://${this.domain}${request.path}`
            })
        }
        // 检查结构
        if (content.data && typeof content.data === "object")
            response = { json: content.data }
        else
            response = { html: content.data + "" }
        return response
    }

    async handle(request, completion) {
        this.logRequest(request)
        let response
        if (this.isLocalhost(request)) {
            response = await this.response(request)
        } else {
            if (this.setting.get("server.remoteAccess")) {
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

    getHandler() {
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