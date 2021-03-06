# BoxJsHelper

> BoxJs 助手

[通过Erots安装](https://liuguogy.github.io/JSBox-addins/?q=show&objectId=5f38086c3f19480006698974)

若您不知道如何配置BoxJs，可以参考以下方法：

在`配置-脚本-订阅脚本`中添加以下订阅即可

<https://raw.githubusercontent.com/ipuppet/Loon/master/BoxJs.conf>

注：本人只有Loon，所以仅限Loon用户

# 工具箱

右上角按钮为工具箱，工具箱内设有多项工具

- ### 备份
    备份功能可将BoxJs内的备份数据拷贝到iCloud。

    进入备份页面后，会显示当前BoxJs内的备份数据，可通过此页面进行快速管理（删除、恢复）

    直接点击会提示是否恢复数据。（也就是BoxJs的还原备份）

    右上角功能按钮点击并非立即操作，会有弹窗提示，请放心点击。

    当备份到iCloud时，若当前无备份，会自动在BoxJs中进行一次备份。需要恢复数据时，点击恢复按钮（云+下箭头图标）即可恢复备份。

    恢复：恢复会将之前备份到iCloud的信息重新写回BoxJs，同id覆盖，不同id不影响，于名字没有任何关系。恢复后点击列表内的某个备份进行BoxJs的数据恢复。

    总而言之，这项功能是将"BoxJs内的备份"进行备份。

- ### Today小组件

    可以自己写脚本在小组件里显示，内置了一个`10010.js`和`demo.js`

    `demo.js`: 内有注释，完全看得懂。

    `10010.js`: 这个也算是一个demo了，自动获取BoxJs的数据，什么也不用填，左划点应用，在Today里加上一个JSBox的小组件，点选择脚本，选本应用即可。（需要BoxJs内有`chavy_signheader_10010`）

# 设置

## 高级

- ### 访问入口

    选择BoxJs的入口。更换入口的话，重启应用后才会生效

    默认情况下为 `boxjs.net`

- ### 端口

    设置内置服务器的端口

# 深色模式

本应用BoxJs页面直接渲染HTML，深色模式适配由BoxJs原作者适配。

注：在切换模式时BoxJs可能未切换，刷新后即可自动切换（需要在BoxJs中设置跟随系统）
