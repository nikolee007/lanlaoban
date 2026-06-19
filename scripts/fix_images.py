with open('lib/product-placeholder.ts') as f:
    c = f.read()

# Remove the PRODUCT_KEYWORD_IMAGES reference in the function
old_func = """  // 1. 关键词级精确匹配（从运行时JSON加载）
  const kwMatch = matchKeywordImage(name)
  if (kwMatch) return kwMatch"""

new_func = """  // 1. 关键词级精确匹配（最高优先级！）
  const kwMatch = matchKeywordImage(name)
  if (kwMatch) return kwMatch"""

c = c.replace(old_func, new_func)

# Also clean up any broken reference to old PRODUCT_KEYWORD_IMAGES
c = c.replace("""  // 1. 关键词级精确匹配（最高优先级！蓝牙耳机→耳机图）
  for (const [regex, imgs] of PRODUCT_KEYWORD_IMAGES) {
    if (regex.test(name) && imgs.length > 0) {
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i)
        hash |= 0
      }
      return imgs[Math.abs(hash) % imgs.length]
    }
  }""", new_func)

with open('lib/product-placeholder.ts', 'w') as f:
    f.write(c)
print('Fixed')
