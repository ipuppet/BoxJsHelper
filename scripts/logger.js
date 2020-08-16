class Logger {
    constructor(kernel, name = "default") {
        this.kernel = kernel
        this.name = name
        if (undefined === $cache.get(this.name)) {
            $cache.set(this.name, new Date().getTime())
        }
        this.path = `/assets/log/${this.name}/`
        if (!$file.exists(this.path)) {
            $file.mkdir(this.path)
        }
    }

    _log(message, level) {
        let path = `${this.path}${$cache.get(this.name)}.log`
        let file = $file.read(path)
        console.log(path)
        console.log(file)
        // 目前只能先读取文件后拼接字符串再写入
        let old_content = file ? file.string : ""
        let content = `${new Date().toISOString()} [${level}] ${message}\n`
        $file.write({
            data: $data({ string: old_content + content }),
            path: path
        })
    }

    info(message) {
        this._log(message, "INFO")
    }

    alert(message) {
        this._log(message, "ALERT")
    }

    error(message) {
        this._log(message, "ERROR")
    }
}

module.exports = Logger