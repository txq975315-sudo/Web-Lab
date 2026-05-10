/**
 * 从模型回复中提取 ```json ... ``` 块并解析
 */
export function extractJsonBlock(text) {
  if (!text || typeof text !== 'string') throw new Error('空回复')
  const m = text.match(/```json\s*([\s\S]*?)```/)
  if (!m) throw new Error('回复中未找到 JSON 代码块')
  return JSON.parse(m[1].trim())
}
