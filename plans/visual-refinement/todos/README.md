# Visual refinement 任务队列

方案：[../plan.md](../plan.md)。用户要求：`$auto-dev 视觉上再提升一下`。

## 执行偏好

default_agent: codex

- 来源：发起 auto-dev 的宿主是 Codex，用户没有覆盖 agent、模型或推理强度。
- 各任务 `agent: inherit`，按本区块解析；没有单任务指定。
- 两项任务均为 `medium`，按共享分发规则使用 `gpt-6-astra` / `xhigh`。不保存 `default_model` 或 `default_reasoning_effort`，避免把难度映射误记为用户覆盖。
- 协调器使用 Codex / `gpt-6-astra` / `high`；其启动档不覆盖任务难度映射。
- 所有 Codex 执行任务显式使用 `--dangerously-bypass-approvals-and-sandbox`、`--model gpt-6-astra`、`-c 'model_reasoning_effort="xhigh"'`。
- 每项任务一个隔离 worktree、一个最终 commit，由 herdr-finish-plan 复核后依次集成。不 push 或发布。

## 优先级

| 文件 | 优先级 | 难度 | agent | 模型 / Codex 推理强度 | 说明 |
| --- | --- | --- | --- | --- | --- |
| [01-editorial-visual-refinement.md](done/01-editorial-visual-refinement.md) | P1 | medium | codex（inherit，继承宿主默认） | `gpt-6-astra` / `xhigh` | **已集成并清理**；提交 `8d71fbf`，统一首页与博客的构图、排版、卡片、文章布局及交互表现 |
| [02-responsive-visual-review.md](done/02-responsive-visual-review.md) | P1 | medium | codex（inherit，继承宿主默认） | `gpt-6-astra` / `xhigh` | **已集成并清理**；提交 `e0335c4`，独立浏览器复验及精选截图已交付，未发现需改源码的本轮回归 |

## 文件

1. [01-editorial-visual-refinement.md](done/01-editorial-visual-refinement.md) — **已集成并清理**，提交 `8d71fbfa35eebf10683f92067100e93351bb8d4c`；依赖：无。
2. [02-responsive-visual-review.md](done/02-responsive-visual-review.md) — **已集成并清理**，提交 `e0335c422b879614a2db71496cb39d656dc2a7e6`；依赖 01-editorial-visual-refinement；从 `8d71fbf` 完成独立复验。

验证交付：[verification.md](../verification.md)。Sangota 窄屏溢出和 Starwreck 手机标题裁切已独立复现为基线问题，报告明确记录；没有本轮集成 blocker。

## 依赖与并行

- 执行顺序：`01 → 02`。
- 首页和博客共用 `src/index.css`，多个首页区块又同处 `src/App.jsx`，因此统一视觉实现放在任务 01，避免并行编辑相同文件。
- 任务 02 必须观察最终组合效果，依赖任务 01 完成并集成。本轮没有可安全并行的任务。

## 统一验收

- 真实页面有可见的构图、文字层级和卡片改进；修正手机 11.52px 首屏说明、两篇文章占三列、桌面博客 hero 四行拥挤标题等已经观察到的问题。
- 保持现有文字事实、项目资源、路由、文章功能和数据行为；四个项目页只做共享 CSS 回归检查与必要修复。
- 每项任务运行 `npm run build`、`git diff --check`，并执行各自浏览器检查；不存在 lint、typecheck 或 test 脚本，不另设样式单元测试框架。
- 交付 `plans/visual-refinement/verification.md` 和精选、同视口的前后截图。浏览器检查需区分普通动画、减少动画和无 WebGL；不能只用构建成功代表视觉验收。
- 最终集成后确认工作区干净，向用户汇报实现提交、主要改进和真实验证结果。
