// 查询有效期，单位小时。1就是数据缓存1个小时，超过后重新获取。
// 注意，并非超过一小时后立即重新获取，而是你查看小部件时重新获取数据，会有一段时间的空白
const validity = 1

async function get_data(boxdata) {
    if (!$cache.get("today_10010_date")) {
        // 首次写入时间信息
        $cache.set("today_10010_date", new Date().getTime() - 1000 * 60 * 60 * validity + 1)
    }
    // 每小时只查询一次
    if (new Date().getTime() - $cache.get("today_10010_date") < 1000 * 60 * 60 * validity) {
        return $cache.get("today_10010_data")
    }
    // 从boxjs获取信息
    let cookie = JSON.parse(boxdata.datas["chavy_signheader_10010"])["Cookie"]
    let start_index = cookie.indexOf("req_mobile=")
    let end_index = cookie.indexOf(";", start_index)
    let phone = cookie.slice(start_index, end_index).split("=")[1]
    // 从10010获取信息
    let response = await $http.get({
        url: `https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?version=iphone_c@7.0403&desmobiel=${phone}&showType=3`,
        header: {
            "Cookie": cookie,
            "Accept": "*/*",
            "Content-Type": "application/json"
        }
    })
    if (response.error !== null) {
        $ui.toast("查询失败")
        return
    }
    // 更新
    $cache.set("today_10010_date", new Date().getTime())
    $cache.set("today_10010_data", response.data)
    return $cache.get("today_10010_data")
}

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

async function main(boxdata) {
    let responst = await get_data(boxdata)
    let needed = ["flow", "voice"] // 需要显示的内容
    let data = []
    for (let item of responst.data.dataList) {
        if (item.type === "fee") {
            data.unshift(template_fee({
                title: item.remainTitle, // 标题
                number: item.number, // 以用数值
                unit: item.unit, // 单位
                flush_date_time: responst.flush_date_time
            }))
        } else if (needed.includes(item.type))
            data.push(template({
                title: item.remainTitle, // 标题
                number: item.number, // 以用数值
                persent: item.persent, // 以用百分比
                unit: item.unit // 单位
            }))
    }
    $ui.render({
        type: "view",
        layout: $layout.fill,
        views: data
    })
}

module.exports = {
    main: main
}