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
        this.handler.asyncResponse = async (request, completion) => {
            /* let method = request.method
            let url = request.url
            console.log(url) */
            let content = await $http.get("http://boxjs.com")
            completion({
                type: "data",
                props: {
                    //html: $file.read("assets/www/chavy.boxjs.html").string
                    html: content.data
                }
            })
        }
        return this.handler
    }
}

module.exports = Server