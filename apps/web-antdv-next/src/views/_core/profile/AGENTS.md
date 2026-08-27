# 个人资料页面业务上下文

修改本目录前先阅读前端 business-docs/system/access-control-ui.md 和后端 business-docs/system/access-control.md，再核对 profile API。当前基本设置页已接入真实保存：头像（1:1 裁剪上传）和邮箱通过 `PUT /auth/profile` 更新并刷新用户信息；真实姓名、登录名、手机号为只读。密码、安全和通知设置仍含演示数据或假成功提示，不得视为真实业务能力。个人资料与用户管理是不同入口，不得擅自扩大当前用户可编辑字段或权限。
