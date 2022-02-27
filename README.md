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

    右上角功能按钮点击并非立即操作，会有弹窗提示，请放心点击。

    当备份到 iCloud 时，若当前无备份，会自动在 BoxJs 中进行一次备份。需要恢复数据时，点击恢复按钮（云+下箭头图标）即可恢复备份。

    恢复：恢复会将之前备份到 iCloud 的信息重新写回 BoxJs，同 id 覆盖，不同 id 不影响，于名字没有任何关系。恢复后点击列表内的某个备份进行 BoxJs 的数据恢复。

    总而言之，这项功能是将 "BoxJs 内的备份" 进行备份。

- ### Today小组件

    可以自己写脚本在小组件里显示，内置了一个 `10010.js` 和 `demo.js`

    `demo.js`: 内有注释，完全看得懂。

    `10010.js`: Demo，自动获取 BoxJs 的数据，什么也不用填，左划点应用，在通知中心添加一个 JSBox 小组件，点选择脚本，选本应用即可。（需要 BoxJs 内有 `chavy_signheader_10010` ）

# 设置

## BoxJs

- ### 访问入口

    选择 BoxJs 的入口。更换入口的话，重启应用后才会生效

    默认情况下为 `boxjs.net`

## 远程访问

- ### 端口

    设置内置服务器的端口

# 深色模式

本应用 BoxJs 页面直接渲染 HTML，深色模式适配由 BoxJs 作者适配。

注：在切换模式时 BoxJs 可能未切换，刷新后即可自动切换（需要在 BoxJs 中设置跟随系统）
