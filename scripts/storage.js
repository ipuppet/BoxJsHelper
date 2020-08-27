class Storage {
    constructor(setting) {
        this.setting = setting
        this.local_db = "/assets/BoxJsHelper.db"
        this.iCloud_path = "drive://BoxJsHelper/"
        this.iCloud_db = this.iCloud_path + "BoxJsHelper.db"
        this.iCloud_auto_db = this.iCloud_path + "auto.db"
        this.sqlite = $sqlite.open(this.local_db)
        this.sqlite.update("CREATE TABLE IF NOT EXISTS today(id INTEGER PRIMARY KEY NOT NULL, name TEXT, url TEXT, date TEXT)")
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
            sql: "INSERT INTO today (name, url, date) values(?, ?, ?)",
            args: [data.name, data.url, data.date]
        })
        if (result.result) {
            if (this.setting.get("setting.backup.auto_backup")) {
                if (!$file.exists(this.iCloud_path)) {
                    $file.mkdir(this.iCloud_path)
                }
                $file.write({
                    data: $data({ path: this.local_db }),
                    path: this.iCloud_auto_db
                })
            }
            return true
        }
        $console.error(result.error)
        return false
    }

    has_backup() {
        return $file.exists(this.iCloud_db)
    }

    backup_to_iCloud() {
        if (!$file.exists(this.iCloud_path)) {
            $file.mkdir(this.iCloud_path)
        }
        return $file.write({
            data: $data({ path: this.local_db }),
            path: this.iCloud_db
        })
    }

    recover_from_iCloud(data) {
        let result = $file.write({
            data: data,
            path: this.local_db
        })
        if (result) {
            this.sqlite = $sqlite.open(this.local_db)
        }
        return result
    }

    update(data) {
        let result
        result = this.sqlite.update({
            sql: "UPDATE today SET name = ?, url = ?, date = ? WHERE id = ?",
            args: [data.name, data.url, data.date, data.id]
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