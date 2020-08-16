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
        let content = `${new Date().toLocaleString()} [${level}] ${message}`
        $file.write({
            data: $data({ string: content }),
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