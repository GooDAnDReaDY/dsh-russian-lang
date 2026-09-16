# 📦 @goodandready/dsh-russian-lang

<div align="center">

<h3>DeepSeek Harness 完整俄语本地化、智能排版与键盘布局自动修复插件</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@goodandready/dsh-russian-lang"><img src="https://img.shields.io/badge/npm-v0.2.19-6366f1.svg?style=for-the-badge&labelColor=1e1b4b" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-10b981.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DSH-v0.1.5--rc.2%2B-blue.svg?style=for-the-badge&labelColor=1e1b4b" alt="DSH v0.1.6-alpha.1+">
  <img src="https://img.shields.io/badge/覆盖率-100%25-10b981.svg?style=for-the-badge&labelColor=064e3b" alt="覆盖率 100%">
  <img src="https://img.shields.io/badge/UI词条-11295-6366f1.svg?style=for-the-badge&labelColor=1e1b4b" alt="11295 词条">
  <img src="https://img.shields.io/badge/人工校验-100%25-0ea5e9.svg?style=for-the-badge&labelColor=082f49" alt="100% 人工校验">
</p>

<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/作者所有项目-goodandready.app-ff4500.svg?style=for-the-badge&logo=rocket&logoColor=white&labelColor=1a1a2e" alt="作者所有项目"></a>
</p>

<table align="center">
  <tr>
    <td align="center">
      ⭐ <strong>如果您喜欢这个插件，请在 GitHub 上点个 Star</strong> —— 这能让我知道该插件对您有所帮助，并激励我持续维护和演进。
      <br><br>
      🐛 <strong>如果您发现了 Bug 或有任何建议</strong>，欢迎随时在 GitHub 提交 Issue（支持中文、俄文或英文）。
    </td>
  </tr>
</table>

</div>

---

## ⚡ 概述

**`dsh-russian-lang`** 是面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (dsh) Web 界面的全功能俄语本地化增强插件。

本插件不仅覆盖 DSH 核心及社区 70+ 个主流扩展插件的俄语翻译，更针对俄语用户深度定制了智能化人机交互特性：**100% 专家人工审校的技术术语**、**俄语复数语法形式（Plural）**、**屏幕排版自动规范化**（书名号《》、长破折号、不换行空格），以及通过快捷键 <kbd>Alt+L</kbd> 实现的**错误键盘布局文本一键纠正**。

---

## ✨ 核心特性

### 1. 🌐 100% 覆盖 DSH 核心 (45+ 命名空间，1780+ 词条)
完全覆盖终端、会话归档、命令面板、工作区、右侧边栏、模型设置等所有 DSH 原生功能模块。

### 2. 🧩 内置 70+ 社区插件模块化翻译 (9500+ 词条)
采用按需模块化分发架构（单文件 < 50 KiB），包含市场、看板、定时任务、语音 TTS、模型限额、会话控制等全部热门扩展插件。

### 3. 🔢 俄语复数语法精确匹配 (Plural)
自动计算俄语特有的数词变格规则（`one`、`few`、`many`），彻底避免机械英汉翻译中的语法违和感。

### 4. ✍️ 智能输入排版增强 (`russian-lang.typography`)
在输入和渲染时规范排版格式，智能识别单字母连词并在其后插入不换行空格，且绝对保留 Markdown 代码块和行内代码语法不变。

### 5. ⌨️ 误打布局实时纠正 (<kbd>Alt+L</kbd>)
实时检测英俄误打输入（例如错输入 `ghbdtn` 自动识别为 `привет`），按快捷键即可就地无缝纠正。

### 6. ⚙️ 自定义键值覆写 (`russian-lang.overrides`)
支持在 **设置 → 插件 → 俄语本地化** 中自定义特定术语翻译，无需修改任何源代码。

### 7. 🔤 DSH 原生架构集成
原生注册至 **设置 → 通用 → 语言** 菜单，无缝切换 `<html lang="ru-RU">` 并自动激活浏览器拼写检查。

---

## 📦 安装方法

在终端运行以下命令：

```bash
dsh plugin --profile web add @goodandready/dsh-russian-lang
```

安装完成后，打开 DSH 网页端，前往 **设置 (Settings) → 通用 (General) → 语言 (Language)**，选择 **«Русский»** 即可。

---

## ⚙️ 配置说明 (`settings.yaml`)

配置命名空间为 `russian-lang`，所有选项均为可选字段：

```yaml
russian-lang:
  enabled: true          # 启用俄语界面
  typography:
    enabled: true        # 启用智能排版（引号、破折号、不换行空格）
    yo: false            # 自动还原字母 «ё»（默认关闭）
  agentPrompt: false     # 提示智能体优先使用俄语回复
  overrides: {}          # 针对任意词条的自定义翻译映射
```

---

## 📄 开源许可

MIT License © [GooDAnDReaDY](https://github.com/GooDAnDReaDY)
