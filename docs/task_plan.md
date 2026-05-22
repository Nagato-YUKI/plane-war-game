# 雷电战机全面重构计划

## 问题诊断

### 1. 视觉表现问题
- [x] 贴图过于静态，缺乏动态感
- [x] 弹幕特效不清晰，没有拖尾/发光效果
- [x] 玩家飞机没有引擎尾焰动画
- [x] 爆炸效果过于简单

### 2. 游戏难度问题
- [x] 敌人弹幕太少，密度不够
- [x] 难度曲线太平缓
- [x] Boss弹幕模式单一

### 3. 显示错误
- [x] 连击数显示为小数（4.19999999999999）
- [x] 生命值为0时游戏未结束
- [x] 武器持续时间条位置/显示问题

### 4. 代码结构问题
- [x] 单个文件过长（game.js 1000+行）
- [x] 没有模块化，职责混杂
- [x] 缺乏可扩展性
- [x] 不符合阿里代码规范

## 重构方案

### 阶段一：代码结构重构
1. 拆分 game.js 为多个模块：
   - core/GameState.js - 游戏状态管理
   - core/Player.js - 玩家逻辑
   - core/EnemyManager.js - 敌人管理
   - core/BulletSystem.js - 弹幕系统
   - core/CollisionSystem.js - 碰撞检测
   - core/ItemSystem.js - 道具系统
   - core/EffectSystem.js - 特效系统
   - core/ScoreSystem.js - 分数/连击系统

2. 拆分 renderer.js：
   - render/Renderer.js - 主渲染器
   - render/PlayerRenderer.js - 玩家渲染
   - render/EnemyRenderer.js - 敌人渲染
   - render/BulletRenderer.js - 弹幕渲染
   - render/EffectRenderer.js - 特效渲染
   - render/UIRenderer.js - UI渲染

### 阶段二：动态特效系统
1. 玩家飞机引擎尾焰粒子动画
2. 弹幕发光+拖尾效果
3. 爆炸粒子系统升级
4. 屏幕震动效果增强
5. 擦弹时的闪光特效

### 阶段三：弹幕密度增强
1. 增加基础弹幕数量
2. 添加弹幕阵型（环形、扇形、螺旋）
3. Boss多阶段弹幕升级
4. 难度动态调整

### 阶段四：Bug修复
1. 修复连击数小数显示
2. 修复生命值为0的判断逻辑
3. 修复武器持续时间显示
