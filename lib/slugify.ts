export function slugify(title: string): string {
  return title
    .replace(/[：:「」『』【】《》〈〉()\[\]\/\\!！?？,，\.。·•~～\-–—]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
