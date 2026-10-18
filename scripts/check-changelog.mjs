// 更新说明（changelog.json）内容契约门禁 —— prebuild 必跑
//
// 规范：中枢 `specs/CHANGELOG-CONVENTION.md`（老大 2026-10-11 定）。
// 为什么值得一条门禁：这些坏法**页面照样渲染、一行不报错**，只是让用户觉得「更新说明乱」：
//   ① current 与最新一条版本漂移；② 加了新条目却忘了顶 current；
//   ③ time 倒序被破坏；④ type 越界 / 文案写成文件名、函数名、行号；⑤ date 与 time 不是同一天。
// 判据一律取文件里的**真值**（条目数、版本号不写死），否则下次改数据这条门禁会静默过期。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(root, 'public/changelog.json')

const bad = []
const check = (label, ok) => {
  console.log(`${ok ? '✅' : '🔴'} ${label}`)
  if (!ok) bad.push(label)
}

let cl = null
try {
  cl = JSON.parse(readFileSync(SRC, 'utf8'))
} catch (e) {
  console.error(`🔴 public/changelog.json 读不出/解析失败：${e.message}`)
  process.exit(1)
}
check('A0 反假绿：public/changelog.json 可解析且 entries 是数组', !!cl && Array.isArray(cl.entries))
if (!Array.isArray(cl?.entries)) {
  console.log('\n🔴 更新说明门禁未过：数据文件结构就不对，后面的断言无从谈起')
  process.exit(1)
}

const entries = cl.entries
const TYPES = ['新增', '优化', '修复']

// A1 至少覆盖最近 5 次改动（下界写 5，不写死第 5 条的内容）
check(`A1 至少 5 条更新记录（实测 ${entries.length} 条）`, entries.length >= 5)

// A2 current 与最新一条 version 一致（两处真相源不许漂移）
check(
  `A2 current 与最新一条 version 一致（current="${cl.current}" / entries[0]="${entries[0]?.version}"）`,
  !!cl.current && cl.current === entries[0]?.version,
)

const SEMVER = /^\d+\.\d+\.\d+$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
// 用户语言的反面：文件名、函数调用、行号、源码符号
const JARGON = [/\.(ts|vue|js|mjs|json)\b/, /\w+\(\)/, /:\d+\b/, /<[a-z]+>/, /\b[a-z]+[A-Z]\w*/]

const fieldIssues = []
const itemIssues = []
const jargonHits = []
const seenVersions = new Set()
entries.forEach((e, i) => {
  const at = `entries[${i}]`
  if (!SEMVER.test(String(e?.version ?? ''))) fieldIssues.push(`${at}.version 非 x.y.z：「${e?.version}」`)
  if (seenVersions.has(e?.version)) fieldIssues.push(`${at}.version 重复：「${e?.version}」`)
  seenVersions.add(e?.version)
  if (!DATE.test(String(e?.date ?? ''))) fieldIssues.push(`${at}.date 非 YYYY-MM-DD：「${e?.date}」`)
  if (!TIME.test(String(e?.time ?? ''))) fieldIssues.push(`${at}.time 非 YYYY-MM-DD HH:mm：「${e?.time}」`)
  if (String(e?.time ?? '').slice(0, 10) !== String(e?.date ?? '')) {
    fieldIssues.push(`${at} 的 date 与 time 不是同一天：「${e?.date}」vs「${e?.time}」`)
  }
  if (!Array.isArray(e?.items) || e.items.length === 0) {
    fieldIssues.push(`${at}.items 为空`)
    return
  }
  e.items.forEach((it, k) => {
    const where = `${at}.items[${k}]`
    if (!TYPES.includes(it?.type)) itemIssues.push(`${where}.type 越界：「${it?.type}」（只允许 ${TYPES.join('/')}）`)
    const text = String(it?.text ?? '').trim()
    if (text.length < 6) itemIssues.push(`${where}.text 太短（<6 字）：「${text}」`)
    for (const re of JARGON) {
      if (re.test(text)) jargonHits.push(`${where}.text 像给开发看的：「${text}」（命中 ${re}）`)
    }
  })
})
check(`A3 每条都有 version/date/time，两处日期一致（问题：${fieldIssues.join('；') || '无'}）`, fieldIssues.length === 0)
check(`A4 每条 item 的 type ∈ {${TYPES.join('/')}} 且 text 是完整句子（问题：${itemIssues.join('；') || '无'}）`, itemIssues.length === 0)
check(`A5 文案是用户语言、无文件名/函数/行号（问题：${jargonHits.join('；') || '无'}）`, jargonHits.length === 0)

// A6 按 time 严格倒序（'YYYY-MM-DD HH:mm' 的字典序就是时间序）
const orderBad = []
for (let i = 1; i < entries.length; i++) {
  if (String(entries[i - 1].time) <= String(entries[i].time)) {
    orderBad.push(`entries[${i - 1}](${entries[i - 1].time}) 未晚于 entries[${i}](${entries[i].time})`)
  }
}
check(`A6 按 time 严格倒序（问题：${orderBad.join('；') || '无'}）`, orderBad.length === 0)

// A7 版本号与时间同向：越新的条目版本必须越高
const semverNum = (v) => String(v).split('.').map((n) => Number(n))
const semverGt = (a, b) => {
  const A = semverNum(a)
  const B = semverNum(b)
  for (let i = 0; i < 3; i++) {
    if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) > (B[i] || 0)
  }
  return false
}
const verOrderBad = []
for (let i = 1; i < entries.length; i++) {
  if (!semverGt(entries[i - 1].version, entries[i].version)) {
    verOrderBad.push(`entries[${i - 1}](${entries[i - 1].version}) 未高于 entries[${i}](${entries[i].version})`)
  }
}
check(`A7 版本号与时间同向（越新越高，问题：${verOrderBad.join('；') || '无'}）`, verOrderBad.length === 0)

// A8 最新一条的时间不得来自未来（容差 36h，只拦明显打错的年份/时间）
{
  const t = String(entries[0]?.time ?? '')
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/)
  if (!m) {
    check(`A8 最新条目时间无法解析：「${t}」`, false)
  } else {
    const when = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])).getTime()
    const future = when - Date.now()
    check(
      `A8 最新条目时间不是未来（now-Δ = ${Math.round(-future / 3600000)}h）`,
      future <= 36 * 3600 * 1000,
    )
  }
}

if (bad.length) {
  console.log(`\n🔴 更新说明门禁未过：${bad.length} 条`)
  process.exit(1)
}
console.log('\n✅ 更新说明门禁全部通过')
