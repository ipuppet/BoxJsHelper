# BoxJsHelper

> BoxJs 助手，帮助您通过 iCloud 同步数据，并提供局域网内多设备访问能力。

[通过Erots安装](https://liuguogy.github.io/JSBox-addins/?q=show&objectId=5f38086c3f19480006698974)

若您不知道如何配置 BoxJs，可以参考以下方法：

在 Loon 中添加以下插件即可：

<https://raw.githubusercontent.com/ipuppet/Profiles/master/Loon/Plugin/BoxJs.plugin>

注：本人只有 Loon，所以此方法仅限 Loon 用户，其他用户请自行添加相关脚本。

# 工具箱

右上角按钮为工具箱，工具箱内设有多项工具

- ### 远程访问
    开启后可在任意局域网设备访问当前设备的 BoxJs。

    点击该卡片除开关以外的部分将显示访问路径。

    注意：远程访问期间需要手机保持应用开启且亮屏。

- ### 备份
    备份功能可将 BoxJs 内的备份数据拷贝到 iCloud。

    进入备份页面后，会显示当前 BoxJs 内的备份数据，可通过此页面进行快速管理（删除、恢复）

    直接点击会提示是否恢复数据。（也就是 BoxJs 的还原备份）

    点击右上角加号生成新备份。

    下拉页面可进行同步。

- ### Today小组件

    可以自己写脚本在小组件里显示，内置了一个 `10010.js` 和 `demo.js`

    `demo.js`: 内有注释，完全看得懂。

    `10010.js`: Demo，自动获取 BoxJs 的数据，什么也不用填，左划点应用，在通知中心添加一个 JSBox 小组件，点选择脚本，选本应用即可。（需要 BoxJs 内有 `chavy_signheader_10010` ）

# 设置

## BoxJs

- ### 访问入口

    选择 BoxJs 的入口。更换入口的话，重启应用后才会生效

    默认情况下为 `boxjs.net`

- ### 超时时间

    向 BoxJs 发送网络请求的超时时间，单位秒
    
    QuantumultX 用户可以设置的久一点

    默认情况下为 `3`

## 远程访问

- ### 端口

    设置内置服务器的端口

# 深色模式

本应用 BoxJs 页面直接渲染 HTML，深色模式适配由 BoxJs 作者适配。

注：在切换模式时 BoxJs 可能未切换，刷新后即可自动切换（需要在 BoxJs 中设置跟随系统）
