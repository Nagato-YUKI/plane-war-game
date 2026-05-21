# 研究发现

## GDD关键设计参数
- 玩家判定框：视觉40%（50x60 -> 20x24）
- 敌人判定框：视觉80%
- 子弹判定框：视觉70%
- 道具判定框：视觉120%
- 玩家3条命 + 受伤2秒无敌
- 3种主武器：火神炮(散射)/激光(光束)/导弹(追踪)
- 3种敌机：小型(1HP)/中型(3HP)/Boss(20HP+弹幕)
- 4种道具：P(升级)/B(炸弹)/S(护盾)/1UP(加命)
- 3种皮肤：雷电(0分)/隐身(500分)/黄金(2000分)
- 3种武器解锁：火神炮(0分)/激光(300分)/导弹(800分)
- 波次30秒，每5波Boss

## 图片资源需求
- 玩家战机：3种皮肤（蓝/隐身灰/金色）
- 小型敌机：红色
- 中型敌机：橙色
- Boss敌机：紫色
- 子弹：青色(玩家)/红色(敌机)/品红(激光)/橙色(导弹)
- 道具：P绿/B橙/S蓝/1UP紫

## 碰撞修正核心代码
```javascript
function getHitbox(entity, ratio) {
    const w = entity.width * ratio;
    const h = entity.height * ratio;
    return {
        x: entity.x + (entity.width - w) / 2,
        y: entity.y + (entity.height - h) / 2,
        width: w, height: h
    };
}
function checkCollisionWithHitbox(e1, r1, e2, r2) {
    const h1 = getHitbox(e1, r1);
    const h2 = getHitbox(e2, r2);
    return h1.x < h2.x + h2.width && h1.x + h1.width > h2.x
        && h1.y < h2.y + h2.height && h1.y + h1.height > h2.y;
}
```
