const LoggerLevel = Object.freeze({
    INFO: "info",
    ALERT: "alert",
    ERROR: "error",
})

class Logger {
    constructor(kernel, name = "default") {
        this.kernel = kernel
        this.path = `/assets/${name}.log`
    }

    _log(message, level) {
        let content = `${new Date().toLocaleString()} [${level}] ${message}\n`
        // 目前只能先读取文件后拼接字符串再写入
        let old_content = $file.read(this.path).string
        $file.write({
            data: $data({ string: old_content + content }),
            path: this.path
        })
    }

    info(message) {
        this._log(message, LoggerLevel.INFO)
    }

    alert(message) {
        this._log(message, LoggerLevel.ALERT)
    }

    error(message) {
        this._log(message, LoggerLevel.ERROR)
    }
}

module.exports = Logger