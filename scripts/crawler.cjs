/**
 * 懒老板全球供应链 — 数据采集框架脚本 (crawler)
 *
 * ⚠️ 重要声明:
 *   本脚本为**演示/框架性质**，仅展示数据采集的技术架构。
 *   实际使用时请确保：
 *   1. 遵守目标网站的 robots.txt 和 ToS
 *   2. 仅采集公开可访问的信息
 *   3. 数据仅用于展示，不做商业爬取
 *   4. 控制请求频率，避免对目标服务器造成压力
 *
 * 架构说明:
 *   fetch    → 获取原始 HTML / JSON
 *   parse    → 提取结构化字段
 *   validate → 检查数据完整性
 *   format   → 转换为 Prisma 插入格式
 *
 * 用法:
 *   node scripts/crawler.cjs                     # 从默认源列表采集
 *   node scripts/crawler.cjs --urls urls.txt     # 从文件读取 URL 列表
 *   node scripts/crawler.cjs --limit 10          # 限制采集数量
 *   node scripts/crawler.cjs --dry-run           # 仅解析、不写入数据库
 *
 * 扩展方式:
 *   实现新的 Parser：在 parsers 对象中注册，key 为域名匹配模式
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// ─── 配置 ──────────────────────────────────────────────────────────────────────

const CONFIG = {
  // 默认采集源（仅示例URL，实际需要替换为真实目标）
  urls: [
    // 以下为演示 URL，实际使用时替换为真实采集目标
    // 'https://www.example.com/suppliers',
    // 'https://www.example.com/products',
  ],
  // 请求间隔（毫秒），避免封 IP
  requestDelay: 1500,
  // 请求超时（毫秒）
  timeout: 10000,
  // User-Agent 池，轮换使用
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  ],
  outputDir: path.join(__dirname, '..', 'data', 'crawled'),
};

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

/** 延迟（sleep） */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** 获取随机 User-Agent */
function getRandomUA() {
  return CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)];
}

/** 解析命令行参数 */
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { urls: [], limit: Infinity, dryRun: false, urlFile: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--urls' && args[i + 1]) {
      opts.urlFile = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      opts.limit = parseInt(args[++i], 10) || Infinity;
    } else if (args[i] === '--dry-run') {
      opts.dryRun = true;
    } else if (args[i] === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  if (opts.urlFile) {
    const content = fs.readFileSync(opts.urlFile, 'utf-8');
    opts.urls = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  }

  return opts;
}

function printHelp() {
  console.log(`
懒老板全球供应链 — 数据采集框架

用法:
  node scripts/crawler.cjs [选项]

选项:
  --urls <file>     从文件读取URL列表（每行一个）
  --limit <num>     限制采集数量
  --dry-run         仅解析显示，不写入数据库
  --help            显示帮助

配置:
  请求间隔: ${CONFIG.requestDelay}ms
  超时:     ${CONFIG.timeout}ms

扩展:
  在 parsers 对象中注册新的解析器，key 为域名匹配模式
`);
}

// ─── HTTP 请求封装 ─────────────────────────────────────────────────────────────

/**
 * 发送 HTTP GET 请求，返回响应文本
 * 支持重定向跟随、超时、SSL 校验
 */
function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlString);
    const isHttps = parsedUrl.protocol === 'https:';
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
      },
      timeout: CONFIG.timeout,
    };

    const req = transport.request(options, (res) => {
      // 跟随重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, urlString).href;
        console.log(`  ↪ 重定向到: ${redirectUrl}`);
        return fetchUrl(redirectUrl).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${urlString}`));
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        resolve(body);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`请求超时: ${urlString}`));
    });

    req.end();
  });
}

// ─── 解析器 ────────────────────────────────────────────────────────────────────

/**
 * 解析器注册表
 * key: 域名匹配模式（正则字符串或函数）
 * value: 解析函数 (html, url) => parsedData[]
 *
 * 每个 parsedData 对象应包含：
 *   type: 'supplier' | 'product' | 'channel' | 'logistics'
 *   fields: { ... }  // 对应 Prisma 模型字段
 */
const parsers = {
  /**
   * 通用 HTML 页面解析器（兜底）
   * 从 <table>, <ul>, <div class="list"> 等常见结构中提取信息
   * 实际使用时请替换为针对目标网站的精准选择器
   */
  default: function parseGeneric(html, url) {
    const results = [];

    // ── 示例: 提取所有表格行 ──
    // 匹配 <tr><td>...</td><td>...</td></tr> 结构
    const tableRowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
    let rowMatch;

    while ((rowMatch = tableRowRegex.exec(html)) !== null) {
      const cells = [];
      const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        // 去除 HTML 标签，保留纯文本
        const text = cellMatch[1].replace(/<[^>]+>/g, '').trim();
        if (text) cells.push(text);
      }

      if (cells.length >= 2) {
        // 启发式判断：如果第一列是公司名/工厂名，视为供应商
        if (cells[0].includes('公司') || cells[0].includes('厂') || cells[0].includes('工厂')) {
          results.push({
            type: 'supplier',
            fields: { nameZh: cells[0], location: cells[1] || '' },
          });
        }
      }
    }

    return results;
  },

  // ── 演示：JSON API 解析器 ──
  // 如果目标返回 JSON 数据，可用此解析器
  jsonApi: function parseJsonApi(html, url) {
    try {
      const data = JSON.parse(html);
      // 假设返回格式：{ suppliers: [...], products: [...] }
      const results = [];

      if (Array.isArray(data.suppliers)) {
        for (const s of data.suppliers) {
          results.push({
            type: 'supplier',
            fields: {
              nameZh: s.name || s.companyName || '',
              nameEn: s.nameEn || s.englishName || '',
              location: s.location || s.address || '',
              yearEstablished: s.year || s.founded || null,
              employeeCount: s.employees || null,
              rating: s.rating || null,
            },
          });
        }
      }

      if (Array.isArray(data.products)) {
        for (const p of data.products) {
          results.push({
            type: 'product',
            fields: {
              name: p.name || p.title || '',
              description: p.description || p.desc || '',
              priceMin: p.priceMin || p.priceLow || null,
              priceMax: p.priceMax || p.priceHigh || null,
            },
          });
        }
      }

      return results;
    } catch {
      return [];
    }
  },

  // ── 演示：列表页解析器 ──
  listPage: function parseListPage(html, url) {
    const results = [];

    // 提取所有链接 + 标题
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gis;
    let linkMatch;
    const seen = new Set();

    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1];
      const text = linkMatch[2].replace(/<[^>]+>/g, '').trim();

      if (text && text.length > 4 && !seen.has(text)) {
        seen.add(text);
        // 判断可能的数据类型
        if (text.includes('公司') || text.includes('工厂') || text.includes('厂')) {
          results.push({
            type: 'supplier',
            fields: { nameZh: text, sourceUrl: new URL(href, url).href },
          });
        } else if (text.includes('¥') || text.includes('元') || text.includes('价')) {
          results.push({
            type: 'product',
            fields: { name: text, sourceUrl: new URL(href, url).href },
          });
        }
      }
    }

    return results;
  },

  // 扩展点：为特定域名注册解析器
  // 'example.com': function parseExampleDotCom(html, url) { ... },
  // '1688.com': function parse1688(html, url) { ... },
  // 'amazon.com': function parseAmazon(html, url) { ... },
};

// ─── 数据验证 ──────────────────────────────────────────────────────────────────

/**
 * 验证采集到的数据完整性
 * 返回 { valid: boolean, errors: string[] }
 */
function validateItem(item) {
  const errors = [];

  if (!item.type || !['supplier', 'product', 'channel', 'logistics'].includes(item.type)) {
    errors.push(`无效类型: ${item.type}`);
  }

  if (!item.fields || typeof item.fields !== 'object') {
    errors.push('缺少 fields 字段');
    return { valid: false, errors };
  }

  const { fields } = item;

  if (item.type === 'supplier') {
    if (!fields.nameZh && !fields.nameEn) errors.push('供应商缺少名称');
  }

  if (item.type === 'product') {
    if (!fields.name) errors.push('商品缺少名称');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ─── 数据格式化 → 数据库插入格式 ────────────────────────────────────────────────

/**
 * 将解析后的 item 格式化为 Prisma create 输入
 * 可根据实际数据库结构扩展字段映射
 */
function formatForDatabase(item) {
  const { type, fields } = item;

  switch (type) {
    case 'supplier':
      return {
        model: 'supplier',
        data: {
          nameZh: fields.nameZh || '',
          nameEn: fields.nameEn || '',
          location: fields.location || '',
          yearEstablished: fields.yearEstablished || new Date().getFullYear(),
          employeeCount: fields.employeeCount || 10,
          annualExportRevenue: fields.annualExportRevenue || null,
          certifications: JSON.stringify(fields.certifications || []),
          businessTags: JSON.stringify(fields.businessTags || ['未分类']),
          exportDestinations: JSON.stringify(fields.exportDestinations || []),
          rating: fields.rating || 4.0,
          reviewCount: fields.reviewCount || 0,
          isVerified: false,
          type: 'factory',
        },
      };

    case 'product':
      return {
        model: 'product',
        data: {
          name: fields.name || '',
          description: fields.description || null,
          priceMin: fields.priceMin || null,
          priceMax: fields.priceMax || null,
          currency: 'CNY',
          moq: fields.moq || null,
          supportsDropShipping: fields.supportsDropShipping || false,
          supportsOEM: fields.supportsOEM || false,
          certifications: JSON.stringify(fields.certifications || []),
          rating: fields.rating || null,
          reviewCount: fields.reviewCount || 0,
          // 注意：supplierId 需要在插入时关联已有供应商
          // 可通过字段中的 supplierName 或 unique 键查找
        },
      };

    case 'channel':
      return {
        model: 'channel',
        data: {
          name: fields.name || '',
          type: fields.channelType || 'platform',
          coverRegions: JSON.stringify(fields.coverRegions || []),
          entryRequirements: fields.entryRequirements || null,
        },
      };

    case 'logistics':
      return {
        model: 'logisticsProvider',
        data: {
          name: fields.name || '',
          priceMin: fields.priceMin || null,
          priceMax: fields.priceMax || null,
          avgTransitDays: fields.avgTransitDays || null,
          coverCountries: JSON.stringify(fields.coverCountries || []),
          rating: fields.rating || null,
        },
      };

    default:
      return null;
  }
}

// ─── 数据写入 ──────────────────────────────────────────────────────────────────

/**
 * 将采集结果写入 JSON 文件（代替直接写入数据库）
 * 方便人工审核后再导入
 */
function writeResults(results, url) {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const domain = new URL(url).hostname.replace(/\./g, '_');
  const filename = `${domain}_${timestamp}.json`;
  const filepath = path.join(CONFIG.outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(results, null, 2), 'utf-8');
  return filepath;
}

// ─── 评分/统计 ─────────────────────────────────────────────────────────────────

/**
 * 对采集结果进行简单统计
 */
function summarizeResults(results, elapsedMs) {
  const counts = {};
  for (const r of results) {
    counts[r.type] = (counts[r.type] || 0) + 1;
  }

  console.log(`\n📊 采集统计 (${elapsedMs}ms):`);
  console.log(`   总计: ${results.length} 条`);
  for (const [type, count] of Object.entries(counts)) {
    console.log(`   ${type}: ${count} 条`);
  }
}

// ─── 主流程 ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  console.log('='.repeat(55));
  console.log('  懒老板全球供应链 · 数据采集框架');
  console.log('='.repeat(55));
  console.log();
  console.log(`模式: ${opts.dryRun ? '🟡 DRY RUN（不写入）' : '🟢 正常'}`);
  console.log(`URL数: ${opts.urls.length}`);
  console.log(`上限: ${opts.limit === Infinity ? '无限制' : opts.limit}`);
  console.log();

  if (opts.urls.length === 0) {
    console.log('⚠️  未指定 URL。使用 --urls <file> 指定要采集的 URL 列表。');
    console.log('   示例 URL 文件格式（每行一个）:');
    console.log('     https://www.1688.com/...');
    console.log('     https://www.amazon.com/...');
    console.log('     # 以 # 开头的行将被忽略\n');
    return;
  }

  const startTime = Date.now();
  const allResults = [];
  let successCount = 0;
  let failCount = 0;

  const targetUrls = opts.urls.slice(0, opts.limit);

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    console.log(`[${i + 1}/${targetUrls.length}] 采集: ${url}`);

    try {
      // 1. FETCH — 获取页面内容
      const html = await fetchUrl(url);
      console.log(`   ✓ 获取成功 (${html.length} bytes)`);

      // 2. PARSE — 选择合适的解析器
      const domain = new URL(url).hostname;
      let parser = parsers.default;

      // 按域名选择解析器
      for (const [pattern, parserFn] of Object.entries(parsers)) {
        if (pattern === 'default' || pattern === 'jsonApi' || pattern === 'listPage') continue;
        if (domain.includes(pattern)) {
          parser = parserFn;
          console.log(`   ↪ 使用解析器: ${pattern}`);
          break;
        }
      }

      // 如果 URL 以 .json 结尾或返回 JSON，使用 jsonApi 解析器
      const isLikelyJson = html.trim().startsWith('{') || html.trim().startsWith('[');
      if (isLikelyJson) {
        parser = parsers.jsonApi;
        console.log(`   ↪ 检测到 JSON，使用 jsonApi 解析器`);
      }

      const parsed = parser(html, url);
      console.log(`   → 解析出 ${parsed.length} 条数据`);

      // 3. VALIDATE — 验证数据完整性
      const validItems = [];
      for (const item of parsed) {
        const validation = validateItem(item);
        if (validation.valid) {
          validItems.push(item);
        } else {
          console.log(`   ✗ 验证失败: ${validation.errors.join('; ')}`);
        }
      }
      console.log(`   → 验证通过 ${validItems.length}/${parsed.length} 条`);

      // 4. FORMAT — 转换为数据库格式
      const formatted = validItems.map(formatForDatabase).filter(Boolean);
      console.log(`   → 格式化 ${formatted.length} 条`);

      // 5. OUTPUT — 写入文件或数据库
      if (!opts.dryRun) {
        const filepath = writeResults(validItems, url);
        console.log(`   ✓ 已保存: ${filepath}`);
      } else {
        // Dry run: 打印前3条预览
        if (validItems.length > 0) {
          console.log(`  预览 (前3条):`);
          validItems.slice(0, 3).forEach((item, idx) => {
            const fields = Object.entries(item.fields)
              .filter(([, v]) => v)
              .map(([k, v]) => `${k}=${String(v).slice(0, 40)}`)
              .join(', ');
            console.log(`     [${idx + 1}] ${item.type}: ${fields}`);
          });
        }
      }

      allResults.push(...validItems);
      successCount++;

    } catch (err) {
      console.error(`   ✗ 采集失败: ${err.message}`);
      failCount++;
    }

    // 请求间隔
    if (i < targetUrls.length - 1) {
      const delay = CONFIG.requestDelay + Math.floor(Math.random() * 1000);
      console.log(`   ⏳ 等待 ${delay}ms...`);
      await sleep(delay);
    }
  }

  // 汇总
  const elapsed = Date.now() - startTime;
  console.log();
  console.log('='.repeat(55));
  console.log('  采集完成');
  console.log('='.repeat(55));

  summarizeResults(allResults, elapsed);

  if (successCount > 0) {
    console.log(`\n✅ 成功: ${successCount}, 失败: ${failCount}`);
    console.log(`📂 所有结果已保存到: ${CONFIG.outputDir}`);
  } else {
    console.log(`\n⚠️  未采集到有效数据`);
    console.log(`  失败: ${failCount}`);
  }

  console.log();
}

main().catch((err) => {
  console.error('❌ 程序异常退出:', err);
  process.exit(1);
});
