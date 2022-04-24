class Logger {
    status = true

    constructor(name = "default") {
        this.name = name
        this.maxSize = 1024 * 1024 * 1024
        if (undefined === $cache.get(this.name)) {
            $cache.set(this.name, new Date().getTime())
        }
        this.path = `storage/log/${this.name}/`
    }

    disable() {
        this.status = false
    }

    enable() {
        this.status = true
    }

    write(message, level) {
        if (!this.status) {
            return
        }

        let path = `${this.path}${$cache.get(this.name)}.log`
        let file = $file.read(path)
        // 目前只能先读取文件后拼接字符串再写入
        // 用nosejs会太麻烦
        if (file && file.info.size >= this.maxSize) {
            $cache.set(this.name, new Date().getTime())
            path = `${this.path}${$cache.get(this.name)}.log`
            file = undefined
        }
        let oldContent = file ? file.string : ""
        let content = `${new Date().toISOString()} [${level}] ${message}\n`
        $file.write({
            data: $data({ string: oldContent + content }),
            path: path
        })
    }

    info(message) {
        this.write(message, "INFO")
    }

    alert(message) {
        this.write(message, "ALERT")
    }

    error(message) {
        this.write(message, "ERROR")
    }
}

module.exports = Logger