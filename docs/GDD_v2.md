# 飞机大战 v2.0 - 深度重构设计文档

## 核心设计理念转变

从"射击为主"转变为"弹幕躲避为核心，射击为辅助"
参考雷电+东方Project的混合设计哲学

---

## 一、视觉系统全面升级

### 1.1 玩家飞机 - 使用AI生成真实图片素材

| 皮肤 | 解锁分数 | 视觉特点 | AI生成提示词 |
|------|----------|----------|-------------|
| 雷电战机 | 初始 | 蓝白配色，流线型机身，发光引擎 | futuristic blue fighter jet, top-down view, glowing cyan thrusters, sleek aerodynamic design, sci-fi aircraft, transparent background, pixel art style, 64x64 |
| 烈焰战机 | 500分 | 红黑配色，火焰尾焰，尖锐机翼 | futuristic red fighter jet with flame trails, top-down view, glowing orange thrusters, aggressive sharp wings, sci-fi combat aircraft, transparent background, pixel art style, 64x64 |
| 冰霜战机 | 1500分 | 蓝白渐变，冰晶特效，透明感 | futuristic ice-themed fighter jet, top-down view, cyan and white gradient, crystal-like wings, frozen particle effects, sci-fi aircraft, transparent background, pixel art style, 64x64 |
| 暗影战机 | 3000分 | 紫黑配色，暗影粒子，神秘 aura | futuristic dark purple stealth fighter, top-down view, shadow particle effects, mysterious dark aura, sci-fi combat aircraft, transparent background, pixel art style, 64x64 |
| 圣光战机 | 5000分 | 金白配色，圣光光环，天使翅膀 | futuristic golden angel fighter jet, top-down view, holy light halo, white angelic wings, divine particle effects, sci-fi aircraft, transparent background, pixel art style, 64x64 |

### 1.2 敌人设计 - 多样化弹幕发射器

| 敌人类型 | 外观 | HP | 弹幕特点 | AI生成提示词 |
|----------|------|-----|---------|-------------|
| 小型无人机 | 红色三角飞行器 | 1 | 单发直线弹 | small red enemy drone, top-down view, triangular shape, glowing red core, sci-fi enemy aircraft, transparent background, pixel art style, 48x48 |
| 中型战斗机 | 橙色装甲飞行器 | 3 | 3-way散射弹 | medium orange enemy fighter, top-down view, armored plating, multiple gun turrets, sci-fi combat drone, transparent background, pixel art style, 56x48 |
| 重型轰炸机 | 绿色大型飞行器 | 8 | 环形弹幕 | heavy green enemy bomber, top-down view, large bulky design, multiple cannons, sci-fi battleship, transparent background, pixel art style, 80x64 |
| 精英战机 | 紫色高速飞行器 | 5 | 追踪弹+快速射击 | elite purple enemy ace fighter, top-down view, sleek fast design, energy weapons, sci-fi advanced drone, transparent background, pixel art style, 56x56 |
| Boss-机械巨兽 | 巨型机械飞行堡垒 | 50+ | 复杂弹幕模式 | massive mechanical flying fortress boss, top-down view, giant armored body, multiple weapon systems, glowing red eye, sci-fi boss, transparent background, pixel art style, 128x96 |
| Boss-生化母舰 | 有机生物飞船 | 60+ | 弹幕+召唤小兵 | bio-mechanical alien mothership boss, top-down view, organic tentacles, glowing green biological weapons, sci-fi horror boss, transparent background, pixel art style, 128x96 |

### 1.3 子弹/弹幕设计

| 子弹类型 | 颜色 | 大小 | 速度 | 特效 |
|----------|------|------|------|------|
| 玩家火神弹 | 青色 | 6x12 | 快 | 尾焰粒子 |
| 玩家激光 | 紫色渐变 | 8x32 | 瞬间 | 光束 glow |
| 玩家导弹 | 橙色 | 10x18 | 中 | 烟雾尾迹 |
| 敌机普通弹 | 红色 | 5x8 | 中 | 无 |
| 敌机散射弹 | 橙色 | 5x8 | 中 | 无 |
| 敌机环形弹 | 粉色 | 6x6 | 慢-中 | 旋转 glow |
| 敌机激光 | 红色 | 4x200 | 瞬间 | 预警线+光束 |
| 敌机追踪弹 | 黄色 | 6x6 | 慢 | 尾迹粒子 |

### 1.4 特效系统

- **引擎尾焰**: 动态粒子，根据移动速度变化长度
- **爆炸特效**: 多层粒子+闪光+屏幕震动
- **弹幕 glow**: 所有子弹带发光效果
- **受击特效**: 红色闪烁+火花
- **拾取特效**: 道具发光+向上漂浮文字
- **连击特效**: 数字放大+颜色渐变

---

## 二、弹幕系统重构（核心）

### 2.1 弹幕设计原则（参考东方Project）

1. **子弹数量多但速度适中** - 给玩家反应时间
2. **弹幕模式有规律** - 玩家可以学习和记忆
3. **视觉清晰** - 子弹颜色鲜明，不与背景混淆
4. **判定框小** - 玩家飞机判定框40%，子弹判定框60%
5. **安全区域** - 每个弹幕模式都有可躲避的安全点

### 2.2 敌机弹幕模式

#### 小型无人机
- **模式A**: 单发直线弹，射速快
- **模式B**: 2-way对称弹，夹角30度

#### 中型战斗机
- **模式A**: 3-way散射，扇形120度
- **模式B**: 5-way散射，扇形180度
- **模式C**: 追踪单发，瞄准玩家位置

#### 重型轰炸机
- **模式A**: 环形弹幕，12发均匀分布
- **模式B**: 双环形弹幕，内外两层
- **模式C**: 随机散射，20发向随机方向

#### 精英战机
- **模式A**: 快速3连发追踪弹
- **模式B**: 交叉弹幕，X形4-way
- **模式C**: 环形+追踪混合

### 2.3 Boss弹幕模式（参考东方符卡系统）

#### Boss-机械巨兽

**阶段1 (HP 100%-70%)**
- 符卡A「机械风暴」: 8-way环形弹幕，每2秒一波
- 符卡B「追踪导弹」: 每3秒发射4枚追踪弹

**阶段2 (HP 70%-40%)**
- 符卡C「激光阵列」: 随机角度激光扫射，预警1秒
- 符卡D「弹幕雨」: 从上方随机位置掉落子弹

**阶段3 (HP 40%-10%)**
- 符卡E「全屏散射」: 同时发射环形+散射+追踪
- 符卡F「极限模式」: 弹幕速度提升50%

**阶段4 (HP 10%-0%)**
- 符卡G「最终审判」: 所有弹幕模式同时发动

#### Boss-生化母舰

**阶段1**: 召唤小型无人机+散射弹
**阶段2**: 发射生化球（接触后分裂成6发小弹）
**阶段3**: 触手鞭打（近身攻击）+远程弹幕
**阶段4**: 全屏毒雾（持续伤害区域）+弹幕

---

## 三、武器道具持续时间机制

### 3.1 道具类型重新设计

| 道具 | 效果 | 持续时间 | 说明 |
|------|------|----------|------|
| P-火力提升 | 当前武器等级+1 | 永久 | 死亡后降级 |
| W-武器切换 | 切换主武器类型 | 永久 | 在火神/激光/导弹间切换 |
| S-速度提升 | 移动速度+20% | 15秒 | 可叠加2层 |
| B-炸弹 | 炸弹数量+1 | 永久 | 最多7个 |
| 1UP | 生命+1 | 永久 | 最多8条 |

### 3.2 武器等级系统（参考雷电）

**火神炮 (Vulcan)**
- Lv1: 单发直线
- Lv2: 3-way散射
- Lv3: 5-way散射
- Lv4: 7-way散射+尾焰伤害
- Lv5: 9-way超广散射

**激光 (Laser)**
- Lv1: 细光束
- Lv2: 中等光束
- Lv3: 粗光束+穿透
- Lv4: 超粗光束+穿透+持续伤害
- Lv5: 全屏扫射光束

**导弹 (Missile)**
- Lv1: 单发追踪
- Lv2: 2发追踪
- Lv3: 3发追踪+爆炸范围
- Lv4: 4发追踪+连锁爆炸
- Lv5: 6发全屏追踪

**死亡惩罚**: 死亡后武器等级-2（最低Lv1）

---

## 四、连击与评级系统（参考东方Project）

### 4.1 连击系统

- **连击条**: 屏幕底部显示连击槽
- **增加方式**: 击杀敌人+20f，拾取道具+60f，擦弹+3f
- **减少方式**: 无操作时每秒减少
- **连击奖励**: 
  - 10连击: 分数x1.5
  - 30连击: 分数x2.0
  - 50连击: 分数x3.0
  - 100连击: 分数x5.0

### 4.2 擦弹系统（Graze）

- **擦弹判定**: 子弹靠近玩家判定框（但不接触）
- **擦弹奖励**: 每擦1发子弹+100分，+3f连击时间
- **擦弹显示**: 子弹经过时显示白色火花特效
- **擦弹计数**: 屏幕显示当前擦弹数

### 4.3 评级系统

| 评级 | 条件 | 奖励 |
|------|------|------|
| C | 通关即可 | 无 |
| B | 无续关通关 | 分数x1.2 |
| A | 无续关+无炸弹通关Boss | 分数x1.5 |
| S | 无续关+无炸弹+无伤Boss | 分数x2.0 |
| SS | 无续关+无炸弹+无伤全关 | 分数x3.0+解锁隐藏皮肤 |

---

## 五、敌人数量与密度提升

### 5.1 波次系统重新设计

| 波次 | 小型机 | 中型机 | 重型机 | 精英机 | Boss |
|------|--------|--------|--------|--------|------|
| 1-2 | 5-8 | 0-1 | 0 | 0 | 无 |
| 3-4 | 8-12 | 2-3 | 0 | 0 | 无 |
| 5 | 10-15 | 3-5 | 1 | 0 | 机械巨兽 |
| 6-7 | 12-18 | 4-6 | 1-2 | 1 | 无 |
| 8-9 | 15-20 | 5-8 | 2-3 | 2 | 无 |
| 10 | 18-25 | 6-10 | 3-4 | 2-3 | 生化母舰 |

### 5.2 编队系统

- **V字编队**: 5架小型机呈V字形
- **菱形编队**: 4架中型机呈菱形
- **护航编队**: 1架重型机+4架小型机
- **精英小队**: 2架精英机+6架小型机

---

## 六、新增游戏机制

### 6.1 难度选择

| 难度 | 敌人HP | 弹幕速度 | 弹幕密度 | 得分倍率 |
|------|--------|----------|----------|----------|
| Easy | 70% | 80% | 60% | x0.8 |
| Normal | 100% | 100% | 100% | x1.0 |
| Hard | 130% | 120% | 150% | x1.5 |
| Lunatic | 160% | 140% | 200% | x2.0 |

### 6.2 续关系统

- 死亡后可选择续关（从当前波次开始）
- 续关次数限制: Easy无限, Normal 3次, Hard 1次, Lunatic 0次
- 续关后分数清零但保留解锁进度

### 6.3 成就系统

| 成就 | 条件 | 奖励 |
|------|------|------|
| 初次出击 | 首次通关 | 1000分 |
| 弹幕大师 | 擦弹1000发 | 5000分 |
| 连击之王 | 达成100连击 | 10000分 |
| 无伤通关 | 无伤击败Boss | 20000分 |
| 弹幕地狱 | 通关Lunatic难度 | 50000分+隐藏皮肤 |

---

## 七、技术实现要点

### 7.1 素材加载

```javascript
// 使用AI图片生成API获取素材
const ASSET_URLS = {
    player_default: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic+blue+fighter+jet+top-down+view+glowing+cyan+thrusters+sci-fi+aircraft+pixel+art+transparent+background&image_size=square',
    // ... 其他素材
};
```

### 7.2 弹幕对象池

```javascript
// 使用对象池管理大量弹幕，避免GC卡顿
class BulletPool {
    constructor(size) { /* ... */ }
    get() { /* 从池中获取 */ }
    release(bullet) { /* 回收到池 */ }
}
```

### 7.3 碰撞优化

```javascript
// 空间分割，只检测相邻区域的碰撞
class SpatialGrid {
    constructor(cellSize) { /* ... */ }
    insert(entity) { /* ... */ }
    query(x, y, width, height) { /* ... */ }
}
```

---

## 八、文件结构

```
plane-war-game/
├── index.html
├── css/style.css
├── js/
│   ├── config.js          # 游戏配置
│   ├── assets.js          # 素材加载与管理
│   ├── renderer.js        # 渲染器
│   ├── game.js            # 游戏主逻辑
│   ├── bulletSystem.js    # 弹幕系统（新增）
│   ├── enemyAI.js         # 敌人AI与弹幕模式（新增）
│   ├── comboSystem.js     # 连击系统（新增）
│   ├── grazeSystem.js     # 擦弹系统（新增）
│   ├── particleSystem.js  # 粒子系统（新增）
│   └── main.js            # 入口
├── images/                # AI生成素材缓存
│   ├── player/
│   ├── enemy/
│   ├── bullet/
│   └── effect/
└── docs/
    ├── GDD.md
    └── GDD_v2.md
```
