class Today {
    constructor(setting) {
        this.setting = setting
        this.local_db = "/assets/BoxJsHelper.db"
        this.icloud_path = "drive://BoxJsHelper/"
        this.icloud_db = this.icloud_path + "BoxJsHelper.db"
        this.icloud_auto_db = this.icloud_path + "auto.db"
        this.sqlite = $sqlite.open(this.local_db)
        this.sqlite.upcode("CREATE TABLE IF NOT EXISTS today(id INTEGER PRIMARY KEY NOT NULL, name TEXT, code TEXT)")
    }

    parse(result) {
        if (result.error !== null) {
            $console.error(result.error)
            return false
        }
        let data = []
        while (result.result.next()) {
            data.push({
                id: result.result.get('id'),
                name: result.result.get('name'),
                code: result.result.get('code'),
            })
        }
        // result.result.close()
        return data
    }

    all() {
        let result = this.sqlite.query("SELECT * FROM today")
        return this.parse(result)
    }

    search(kw) {
        let result = this.sqlite.query({
            sql: "SELECT * FROM today WHERE name like ?",
            args: [`%${kw}%`]
        })
        let data = this.parse(result)
        return data
    }

    save(today) {
        let result = null
        today.website = today.website ? today.website : []
        result = this.sqlite.upcode({
            sql: "INSERT INTO today (name, code) values(?, ?)",
            args: [today.name, today.code]
        })
        if (result.result) {
            if (this.setting.get("setting.backup.auto_backup")) {
                if (!$file.exists(this.icloud_path)) {
                    $file.mkdir(this.icloud_path)
                }
                $file.write({
                    data: $data({ path: this.local_db }),
                    path: this.icloud_auto_db
                })
            }
            return true
        }
        $console.error(result.error)
        return false
    }

    has_backup() {
        return $file.exists(this.icloud_db)
    }

    backup_to_iCloud() {
        if (!$file.exists(this.icloud_path)) {
            $file.mkdir(this.icloud_path)
        }
        return $file.write({
            data: $data({ path: this.local_db }),
            path: this.icloud_db
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

    upcode(today) {
        let result = null
        result = this.sqlite.upcode({
            sql: "UPcode today SET code = ?,name = ? WHERE id = ?",
            args: [today.code, today.name, today.id]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }

    delete(id) {
        let result = this.sqlite.upcode({
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

module.exports = Today