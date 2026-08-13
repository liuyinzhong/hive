# 登录页面业务上下文

本目录包含框架承载的 Hive 登录入口。修改前先阅读前端 business-docs/system/access-control-ui.md 和后端 business-docs/system/access-control.md，再核对 src/api/auth 与认证 Store。当前只有账号密码登录接入后端；注册、验证码/二维码登录和找回密码仍是占位页面，不得当作已实现功能。不得记录密码或 Token，也不得根据角色名称绕过权限码。
