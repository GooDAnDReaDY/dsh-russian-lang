# 📦 @goodandready/dsh-russian-lang

<div align="center">

<h3>适用于 DeepSeek Harness 的完整俄语本地化、智能排版与键盘布局修正插件</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@goodandready/dsh-russian-lang"><img src="https://img.shields.io/npm/v/@goodandready/dsh-russian-lang.svg?style=for-the-badge&color=6366f1&labelColor=1e1b4b" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-10b981.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-22%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DSH-v0.2.1--rc.4%2B-blue.svg?style=for-the-badge&labelColor=1e1b4b" alt="DSH v0.2.1-rc.4+">
  <img src="https://img.shields.io/badge/覆盖率-100%25-10b981.svg?style=for-the-badge&labelColor=064e3b" alt="100% 覆盖率">
  <img src="https://img.shields.io/badge/UI词条-11880-6366f1.svg?style=for-the-badge&labelColor=1e1b4b" alt="11880 词条">
  <img src="https://img.shields.io/badge/生态插件-85+-0ea5e9.svg?style=for-the-badge&labelColor=082f49" alt="85+ 插件">
</p>

<!-- 作者所有项目展示页面链接 -->
<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/作者所有开源项目-goodandready.app-ff4500.svg?style=for-the-badge&logo=rocket&logoColor=white&labelColor=1a1a2e" alt="所有项目"></a>
</p>

<p align="center">
  <a href="README.ru.md"><b>🇷🇺 Русский</b></a> •
  <a href="README.md"><b>🇬🇧 English / RU</b></a> •
  <a href="DESIGN.md"><b>📐 Design Contract</b></a>
</p>

</div>

---

## ⚡ 概述 (Overview)

**`dsh-russian-lang`** 是针对 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) 官方 Web 界面的全面俄语本地化扩展插件。

该插件不仅无缝翻译了 DSH 核心以及 85+ 生态系统插件（共 11,880+ 词条），还集成了原生键盘布局热键转换（<kbd>Alt+L</kbd>）、屏幕智能排版（俄语引号 «»、长破折号 —、不换行空格）、会话一键导出 Markdown 以及多风格俄语系统提示词（System Prompt）。

---

## 🚀 安装与启用 (Installation)

在 DSH 的 Web 运行环境中安装插件：

```bash
dsh plugin @goodandready/dsh-russian-lang add
```

或者使用 pnpm 在个人配置目录下添加：

```bash
pnpm add @goodandready/dsh-russian-lang
```

安装完成后，在 DSH 设置界面的「插件 (Plugins)」中启用，或点击会话标题栏的 `RU ⇄ EN` 快速切换按钮即可立即生效。

---

## 🛠️ 主要特性 (Features)

1. **100% 完整词条覆盖**：适配 DSH Core `v0.2.1-rc.4`，覆盖 118 个命名空间，全部词条经过人工校对。
2. **零闪烁快速加载 (Zero-FOUT)**：内置 Bootstrap 核心词典与两阶段 ETag 缓存策略。
3. **智能排版与输入辅助**：
   - 自动转换书名号、破折号及不换行空格。
   - 恢复常用词中的字母「ё」。
   - 按 <kbd>Alt+L</kbd> 自动修正输错键盘布局的文字（如 `ghbdtn` ⇄ `привет`）。
4. **会话辅助与导出**：
   - 会话顶部快捷语言切换开关 (`RU ⇄ EN`)。
   - 助手回复一键翻译至俄语。
   - 对话一键导出为标准 Markdown 文档。
5. **本地化检查器 (Alt+I)**：可视化审查页面上的所有 UI 词条来源及覆盖状态。

---

## 📄 许可证 (License)

本项目采用 [MIT License](LICENSE) 许可证发布。
