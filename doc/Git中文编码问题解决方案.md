# Git中文编码问题解决方案

## 问题描述

在Windows PowerShell中使用Git提交包含中文的提交信息时，可能会出现乱码，例如：
```
docs: 娓呯悊鍜屾暣鐞嗛」鐩枃妗ｏ紝鏇存柊README
```

正确的应该是：
```
docs: 清理和整理项目文档，更新README
```

## 问题原因

1. **PowerShell默认编码**：Windows PowerShell默认使用GBK编码（代码页936）
2. **Git编码配置缺失**：Git未配置使用UTF-8编码
3. **编码不匹配**：提交时使用GBK，但GitHub显示时使用UTF-8，导致乱码

## 解决方案

### 方案1：配置Git使用UTF-8（推荐）

```powershell
# 设置Git提交编码为UTF-8
git config --global i18n.commitencoding utf-8

# 设置Git日志输出编码为UTF-8
git config --global i18n.logoutputencoding utf-8

# 禁用路径转义（避免非ASCII字符被转义）
git config --global core.quotepath false
```

### 方案2：使用英文提交信息（最简单）

如果团队允许，使用英文提交信息可以完全避免编码问题：
```powershell
git commit -m "docs: Clean up and organize project documentation, update README"
```

### 方案3：设置PowerShell使用UTF-8

在PowerShell中临时设置UTF-8编码：
```powershell
# 设置控制台输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 设置环境变量
$env:LANG='zh_CN.UTF-8'
$env:LC_ALL='zh_CN.UTF-8'
```

**注意**：这个设置只在当前PowerShell会话中有效，关闭后需要重新设置。

### 方案4：使用Git Bash

Git Bash默认使用UTF-8编码，可以避免编码问题：
```bash
# 在Git Bash中提交
git commit -m "docs: 清理和整理项目文档，更新README"
```

## 修复已存在的乱码提交

如果已经提交了乱码信息，可以使用以下方法修复：

```powershell
# 修改最近一次提交的信息
git commit --amend -m "docs: 清理和整理项目文档，更新README"

# 强制推送到远程（谨慎使用）
git push --force-with-lease origin main
```

**注意**：`--force-with-lease`比`--force`更安全，它会检查远程是否有其他人的提交。

## 验证配置

检查Git编码配置：
```powershell
git config --global --list | findstr encoding
```

应该看到：
```
i18n.commitencoding=utf-8
i18n.logoutputencoding=utf-8
```

## 最佳实践

1. **统一使用UTF-8**：在项目开始时就配置好Git编码
2. **提交信息规范**：使用清晰的提交信息格式（如Conventional Commits）
3. **团队协作**：如果团队有编码问题，考虑使用英文提交信息
4. **工具选择**：在Windows上，Git Bash通常比PowerShell更少出现编码问题

## 当前项目配置

本项目已配置：
- ✅ `i18n.commitencoding=utf-8`
- ✅ `i18n.logoutputencoding=utf-8`
- ✅ `core.quotepath=false`

后续提交中文信息应该不会再出现乱码问题。

---

**参考文档**：
- [Git官方文档 - 字符编码](https://git-scm.com/book/zh/v2/自定义-Git-配置-Git#字符编码)
- [PowerShell编码问题](https://docs.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_character_encoding)

