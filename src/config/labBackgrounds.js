/**
 * 实时演练 / Lab 区背景图（静态资源放在 public/backgrounds/，此处登记 URL）
 * 将新图片放入 public/backgrounds/ 后，把路径追加到本数组即可参与轮换。
 */
export const LAB_BACKGROUND_IMAGES = [
  '/backgrounds/bg-figma-sky.jpg',
  '/backgrounds/bg-1.jpg',
  '/backgrounds/bg-2.jpg',
  '/backgrounds/bg-3.jpg',
  '/backgrounds/bg-4.png'
]

/**
 * 按时间槽轮换：默认每小时换一张；若需「每天」轮换，可改为按天取模（见下注释）
 */
export function getLabBackgroundIndex() {
  const n = LAB_BACKGROUND_IMAGES.length
  if (n <= 0) return 0
  if (n === 1) return 0
  // 每小时一档
  const hourSlot = Math.floor(Date.now() / (1000 * 60 * 60))
  return hourSlot % n

  // 每天一档（0 点切换）：解开下行并注释上一段 hourSlot
  // const daySlot = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  // return daySlot % n
}
