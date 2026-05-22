# 雷电战机 (Raiden Fighter)

网页版雷电风格弹幕射击游戏，基于 Canvas API 纯矢量渲染，无需任何图片资源。

## 在线游玩

https://nagato-yuki.github.io/plane-war-game

## 游戏操作

| 操作 | 按键 |
|------|------|
| 移动 | WASD / 方向键 / 鼠标拖动 / 触摸拖动 |
| 射击 | 空格键（鼠标/触摸模式自动射击） |
| 炸弹 | B 键 |
| 输入玩家ID | 点击输入框 |
| 排行榜 | Tab 键（开始界面） |

## 游戏特色

### 弹幕系统
- 4 种敌人各有独特弹幕模式：追踪弹、扇形弹、环形弹、螺旋弹
- Boss 4 阶段弹幕递进，密度随阶段倍增
- 4 种子弹形状：圆形、菱形、方形、星形

### 武器系统
- 火神炮：扇形散射，高射速
- 激光：持续穿透光束
- 导弹：自动追踪，高伤害
- 武器限时强化，通过道具升级

### 皮肤系统
- 5 种战机皮肤：雷电/烈焰/冰霜/暗影/圣光
- 分数解锁机制，每种皮肤有独特配色和发光效果
- 纯矢量 Canvas 绘制，无方形边框

### 排行榜
- 玩家 ID 输入，8 字符限制
- 本地 localStorage 持久化，最多 20 条记录
- 记录分数、难度、波次、日期
- 游戏结束自动录入，显示排名

### 难度系统
- 简单 / 普通 / 困难 / 疯狂 四档
- 影响敌人数量、弹速、密度、分数倍率

## 视觉特效

- HUD / Sci-Fi FUI 风格界面
- 霓虹发光 + 斜切角边框 + HUD 角标
- Orbitron + JetBrains Mono 字体
- 矢量战机动态效果：倾斜动画、引擎尾焰粒子、脉冲发光、受击闪烁
- 多层爆炸特效：核心 + 火花 + 烟雾
- 渐变拖尾子弹 + 子弹击中特效
- CRT 扫描线 + 暗角 + 闪烁星空
- 连击显示 + 分数弹出动画

## 项目结构

```
plane-war-game/
├── index.html
├── css/style.css
├── js/
│   ├── config.js              # 游戏配置常量
│   ├── assets.js              # 资源管理
│   ├── utils/
│   │   ├── MathUtils.js       # 数学工具
│   │   └── CollisionUtils.js  # 碰撞检测
│   ├── core/
│   │   ├── Player.js          # 玩家逻辑
│   │   ├── EnemyManager.js    # 敌人管理
│   │   ├── BulletSystem.js    # 弹幕系统
│   │   ├── ItemSystem.js      # 道具系统
│   │   ├── EffectSystem.js    # 特效系统
│   │   ├── ScoreSystem.js     # 分数系统
│   │   ├── LeaderboardSystem.js # 排行榜系统
│   │   └── GameEngine.js      # 游戏引擎
│   ├── render/
│   │   ├── Renderer.js        # 主渲染器
│   │   ├── PlayerRenderer.js  # 玩家渲染
│   │   ├── EnemyRenderer.js   # 敌人渲染
│   │   ├── BulletRenderer.js  # 子弹渲染
│   │   ├── EffectRenderer.js  # 特效渲染
│   │   ├── ItemRenderer.js    # 道具渲染
│   │   ├── UICommon.js        # UI 共享工具
│   │   ├── UIHUD.js           # 游戏 HUD
│   │   ├── UIScreen.js        # 界面屏幕
│   │   └── UIRenderer.js      # UI 渲染门面
│   └── main.js                # 入口 + 输入处理
└── docs/
    └── GDD_v4.md              # 游戏设计文档
```

## 技术栈

- 原生 HTML5 Canvas API
- 纯 JavaScript（ES6+，无框架依赖）
- Google Fonts（Orbitron + JetBrains Mono）
- localStorage 数据持久化

## 运行方式

```bash
# 本地启动
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```
