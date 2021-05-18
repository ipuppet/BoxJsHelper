class Storage {
    constructor(setting) {
        this.setting = setting
        this.localDb = "/storage/BoxJsHelper.db"
        this.iCloudPath = "drive://BoxJsHelper/"
        this.iCloudDb = this.iCloudPath + "BoxJsHelper.db"
        this.iCloudAutoDb = this.iCloudPath + "auto.db"
        this.sqlite = $sqlite.open(this.localDb)
        this.sqlite.update("CREATE TABLE IF NOT EXISTS today(id INTEGER PRIMARY KEY NOT NULL, name TEXT, url TEXT, script TEXT, date TEXT)")
    }

    parse(result) {
        if (result.error !== null) {
            $console.error(result.error)
            return false
        }
        let data = []
        while (result.result.next()) {
            data.push({
                id: result.result.get("id"),
                name: result.result.get("name"),
                url: result.result.get("url"),
                script: result.result.get("script"),
                date: result.result.get("date")
            })
        }
        // result.result.close()
        return data
    }

    all() {
        let result = this.sqlite.query("SELECT * FROM today ORDER BY date ASC")
        return this.parse(result)
    }

    search(kw) {
        let result = this.sqlite.query({
            sql: "SELECT * FROM today WHERE name like ?",
            args: [`%${kw}%`]
        })
        return this.parse(result)
    }

    save(data) {
        let result
        result = this.sqlite.update({
            sql: "INSERT INTO today (name, url, script, date) values(?, ?, ?, ?)",
            args: [data.name, data.url, data.script, data.date]
        })
        if (result.result) {
            if (this.setting.get("setting.backup.autoBackup")) {
                if (!$file.exists(this.iCloudPath)) {
                    $file.mkdir(this.iCloudPath)
                }
                $file.write({
                    data: $data({ path: this.localDb }),
                    path: this.iCloudAutoDb
                })
            }
            return true
        }
        $console.error(result.error)
        return false
    }

    hasBackup() {
        return $file.exists(this.iCloudDb)
    }

    backupToICloud() {
        if (!$file.exists(this.iCloudPath)) {
            $file.mkdir(this.iCloudPath)
        }
        return $file.write({
            data: $data({ path: this.localDb }),
            path: this.iCloudDb
        })
    }

    recoverFromICloud(data) {
        let result = $file.write({
            data: data,
            path: this.localDb
        })
        if (result) {
            this.sqlite = $sqlite.open(this.localDb)
        }
        return result
    }

    update(data) {
        let result
        result = this.sqlite.update({
            sql: "UPDATE today SET name = ?, url = ?, script = ?, date = ? WHERE id = ?",
            args: [data.name, data.url, data.script, data.date, data.id]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }

    delete(id) {
        let result = this.sqlite.update({
            sql: "DELETE FROM today WHERE id = ?",
            args: [id]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }
}

module.exports = Storage