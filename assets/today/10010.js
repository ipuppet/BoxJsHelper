// 查询有效期，单位小时。1就是数据缓存1个小时，超过后重新获取。
// 注意，并非超过一小时后立即重新获取，而是你查看小部件时重新获取数据，会有一段时间的空白
const validity = 1

// 需要显示的内容 fee(话费) 默认显示
// flow: 流量
// voice: 语音
// credit: 信用积分
const needed = ["flow", "voice"]

const version = "1.0.0"

function template_fee(data) {
    return {
        type: "view",
        layout: (make, view) => {
            make.width.equalTo(view.super)
            make.height.equalTo(30)
            make.top.equalTo(view.prev.bottom)
        },
        views: [
            {
                type: "label",
                props: {
                    text: `${data.title}: ${data.number}${data.unit}`,
                    font: $font(14)
                },
                layout: make => {
                    make.left.right.inset(10)
                    make.height.equalTo(20)
                }
            },
            {
                type: "label",
                props: {
                    text: data.flush_date_time,
                    font: $font(12),
                    align: $align.right
                },
                layout: make => {
                    make.left.right.inset(10)
                    make.height.equalTo(20)
                }
            }
        ]
    }
}

function template(data) {
    let text_left = `${data.title}: ${data.number}${data.unit}`
    let text_right = `${data.persent}%`
    let persent_hidden = false
    if (data.persent === 0 || data.persent === "0" || data.persent === "") {
        text_right = ""
        persent_hidden = true
    }
    return {
        type: "view",
        layout: (make, view) => {
            make.width.equalTo(view.super)
            make.height.equalTo(35)
            make.top.equalTo(view.prev.bottom).offset(5)
        },
        views: [
            {
                type: "label",
                props: {
                    text: text_left,
                    font: $font(14)
                },
                layout: make => {
                    make.left.right.inset(10)
                    make.height.equalTo(20)
                }
            },
            {
                type: "label",
                props: {
                    text: text_right,
                    font: $font(12),
                    align: $align.right
                },
                layout: make => {
                    make.left.right.inset(10)
                    make.height.equalTo(20)
                }
            },
            {
                type: "progress",
                props: {
                    value: data.persent / 100,
                    cornerRadius: 3,
                    hidden: persent_hidden,
                    progressColor: get_color(data.persent / 100),
                    trackColor: $color("clear")

                },
                layout: (make, view) => {
                    make.top.equalTo(view.prev.bottom).offset(3)
                    make.right.left.inset(10)
                    make.height.equalTo(3)
                }
            }
        ]
    }
}

function get_color(persent) {
    if (persent > 0 && persent < 0.6) {
        return $color("green")
    } else if (persent > 0.6 && persent < 0.85) {
        return $color("orange")
    } else if (persent > 0.85) {
        return $color("red")
    }
}

function render(data) {
    let views = []
    for (let item of data.data.dataList) {
        if (item.type === "fee") {
            views.unshift(template_fee({
                title: item.remainTitle, // 标题
                number: item.number, // 以用数值
                unit: item.unit, // 单位
                flush_date_time: data.flush_date_time
            }))
        } else if (needed.includes(item.type))
            views.push(template({
                title: item.remainTitle, // 标题
                number: item.number, // 以用数值
                persent: item.persent, // 以用百分比
                unit: item.unit // 单位
            }))
    }
    $ui.render({
        type: "view",
        layout: $layout.fill,
        views: views
    })
}

function get_data(boxdata) {
    // 从boxjs获取信息
    let cookie = JSON.parse(boxdata.datas["chavy_signheader_10010"])["Cookie"]
    let start_index = cookie.indexOf("req_mobile=")
    let end_index = cookie.indexOf(";", start_index)
    let phone = cookie.slice(start_index, end_index).split("=")[1]
    // 从10010获取信息
    $http.get({
        url: `https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?version=iphone_c@7.0403&desmobiel=${phone}&showType=3`,
        header: {
            "Cookie": cookie,
            "Accept": "*/*",
            "Content-Type": "application/json"
        },
        handler: response => {
            if (response.error !== null) {
                $ui.toast("查询失败")
                return
            }
            // 更新
            $cache.set("today_10010_date", new Date().getTime())
            $cache.set("today_10010_data", response.data)
            render(response.data)
        }
    })
}

function get_cache() {
    if (!$cache.get("today_10010_date")) {
        // 首次写入时间信息
        $cache.set("today_10010_date", new Date().getTime() - 1000 * 60 * 60 * validity + 1)
    }
    // 每小时只查询一次
    if (new Date().getTime() - $cache.get("today_10010_date") < 1000 * 60 * 60 * validity) {
        let data = $cache.get("today_10010_data")
        if (data) {
            render(data)
            return true
        }
    }
    return false
}

/**
 * 该函数用来检查是否有更新
 */
async function update() {
    // TODO 展开小组件后显示更新按钮~
    let name = "10010"
    let url = "https://raw.githubusercontent.com/ipuppet/BoxJsHelper/master/assets/today/10010.js"
    const update_alert = () => {
        $ui.alert({
            title: "你该升级啦！",
            actions: [
                {
                    title: "更新",
                    handler: () => {
                        $file.write({
                            data: $data({ string: $cache.get(`today_update_${name}_script`) }),
                            path: `/assets/today/${name}.js`
                        })
                        $ui.alert("操作成功，重新进入Today即可完成更新")
                    }
                },
                { title: $l10n("CANCEL") }
            ]
        })
    }
    if ($cache.get(`today_update_${name}`)) {
        update_alert()
        return
    }
    $http.get({
        url: url,
        handler: response => {
            let remote_version = eval(response.data).version
            if (remote_version !== version) {
                $cache.set(`today_update_${name}`, true)
                $cache.set(`today_update_${name}_script`, response.data)
                update_alert()
            }
        }
    })
}

async function main(boxdata) {
    update()
    if (!get_cache()) {
        let data = await boxdata()
        get_data(data)
    }
}

module.exports = {
    main: main,
    version: version // 用于检查更新
}