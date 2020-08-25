/**
 * 该函数为Today小组件入口函数
 * @param {Object} boxdata BoxJs中的数据
 * 通过/query/boxdata获取，该数据不是实时数据，用户可在主程序中手动刷新
 * 该数据结构可查看如下链接 https://boxjs.net/query/boxdata
 */
function main(boxdata) {
    $ui.alert({
        title: "Hi",
        message: boxdata.sysapps[0].author,
    })
}

module.exports = {
    main: main
}