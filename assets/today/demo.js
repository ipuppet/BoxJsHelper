/**
 * 该函数为Today小组件入口函数
 * @param {Object} boxdata BoxJs中的数据 
 * boxdata.datas 为保存的信息，如Cookie等
 * 通过/query/boxdata获取，该数据是实时数据
 * 该数据结构可查看如下链接 http://boxjs.net/query/boxdata
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