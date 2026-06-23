import { LANGUAGES } from './ConfigStep'

export function langLabel(key: string): string {
  return LANGUAGES.find(l => l.key === key)?.label || key
}

export function splitIntoSlogans(text: string): string[] {
  // Split by sentence boundaries for various languages
  // Chinese: split by 。！？；， then filter
  // Other languages: split by .!?;\n then filter
  if (/[一-鿿㐀-䶿]/.test(text)) {
    // CJK text — split by sentence-ending punctuation
    const raw = text.split(/[。！？；，\n]+/).map(s => s.trim()).filter(Boolean)
    // If too few, split further by comma/space for shorter phrases
    if (raw.length <= 2) {
      return text.split(/[，,，\n]+/).map(s => s.trim()).filter(s => s.length > 2)
    }
    return raw
  }
  // Latin text — split by sentence boundaries
  const raw = text.split(/[.!?;]\s+/).map(s => s.trim()).filter(Boolean)
  if (raw.length <= 2) {
    return text.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 2)
  }
  return raw
}
