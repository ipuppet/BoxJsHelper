const Logger = require("./logger")

/**
 * @typedef {import("../app").AppKernel} AppKernel
 */
class Server {
    /**
     * @param {AppKernel} kernel
     */
    constructor(kernel) {
        this.kernel = kernel
        this.setting = this.kernel.setting

        this.logger = new Logger(this.kernel.fileStorage.basePath)

        if (this.domain.startsWith("http")) {
            this.domain = this.domain.slice(this.domain.indexOf("//") + 2)
        }
        this.handler = {}
        this.server = $server.new()
    }

    get domain() {
        return this.setting.get("advanced.domain", "boxjs.net")
    }

    get port() {
        return this.setting.get("advanced.serverPort")
    }

    get timeout() {
        return this.setting.get("advanced.timeout", 3)
    }

    get logRequest() {
        return this.setting.get("server.logRequest")
    }

    startServer() {
        if (this.server.running) return
        if (!this.logRequest) {
            this.logger.disable()
        }

        this.server.addHandler(this.getHandler())
        let options = {
            port: this.port
        }
        this.server.start(options)
        this.logger.info("Server started.")
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
        this.logger.info("Server stoped.")
    }

    reloadServer() {
        this.stopServer()
        this.startServer()
    }

    requestLogTemplate(request) {
        return `"${request.remoteAddress}" "${request.method}" "${request.path}"`
    }

    isLocalhost(request) {
        let reqHost = request.remoteAddress
        reqHost = reqHost.substring(0, reqHost.lastIndexOf(":"))
        const localhost = ["localhost", "::1", "127.0.0.1", $device.wlanAddress]
        return localhost.includes(reqHost)
    }

    async response(request) {
        let content = {}

        if (request.method === "POST") {
            let body = {}
            try {
                body = JSON.parse(request.data.string)
            } catch {}
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
        let response = {
            statusCode: content?.response?.statusCode ?? 500
        }
        if (content.error) {
            const error = content.error
            response.text = error.localizedDescription
            this.logger.error(this.requestLogTemplate(request) + ` ${error.code}: ${error.localizedDescription}`)
        } else if (content.data && typeof content.data === "object") {
            response.json = content.data
        } else {
            response.html = content.data + ""
        }
        return response
    }

    async handle(request) {
        $delay(0, () => this.logger.info(this.requestLogTemplate(request)))

        let response = { statusCode: 401, hasBody: false }
        if (this.isLocalhost(request) || this.setting.get("server.remoteAccess")) {
            response = await this.response(request)
        }
        return response
    }

    getHandler() {
        this.handler.filter = () => {
            // 全部使用data
            return "data"
        }
        this.handler.asyncResponse = (request, completion) => {
            this.handle(request).then(response => {
                completion({
                    type: "data",
                    props: response
                })
            })
        }
        return this.handler
    }
}

module.exports = Server
