class Server {
    constructor(kernel, port = 6060) {
        this.kernel = kernel
        this.port = port
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
    }

    stop_server() {
        this.server.stop()
        this.status = false
    }

    get_handler() {
        this.handler.filter = (rules) => {
            // 全部使用data
            return "data"
        }
        this.handler.asyncResponse = async (request, completion) => {
            let method = request.method
            let path = request.path
            let response = {}
            if (method === "POST") {
                // 此处需要TF版解决
                // 自动返回空数据
                /* let content = await $http.post({
                    url: `http://boxjs.com${path}`,
                    body: JSON.parse(request.data.string)
                }) 
                if (content.data === "") {
                    content.data = "{}"
                }
                response = { json: content.data } */
                $http.post({
                    url: `http://boxjs.com${path}`,
                    body: JSON.parse(request.data.string)
                })
                response = { json: {} }
            } else {
                let content = await $http.get(`http://boxjs.com${path}`)
                response = { html: content.data }
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