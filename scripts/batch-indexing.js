const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const path = require('path');

// 采用 Indexing API 的 JSON 密钥
const keyFile = path.join(__dirname, '../.gcp-keys/indexing-api.json');

// 初始化 Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: ['https://www.googleapis.com/auth/indexing'],
});

async function requestIndexing(url) {
  const client = await auth.getClient();
  const res = await client.request({
    url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
    method: 'POST',
    data: {
      url: url,
      type: 'URL_UPDATED',
    },
  });
  return res.data;
}

async function runBatch() {
  console.log('🚀 开始执行 Google Indexing API 批量推送...');
  
  // 从命令行获取输入文件路径
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('❌ 请提供包含 URL 的 CSV 或文本文件路径作为参数。');
    console.error('💡 示例: node batch-indexing.js ../docs/gsc_exports/discovered-not-indexed.csv');
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ 文件不存在: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`📝 正在读取文件: ${absolutePath}`);
  
  const fileStream = fs.createReadStream(absolutePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const urls = [];
  for await (const line of rl) {
    const url = line.trim();
    // 简单的过滤逻辑，跳过 CSV 表头或空行
    if (url && url.startsWith('http') && !url.includes('URL')) {
      urls.push(url.split(',')[0]); // 处理CSV格式
    }
  }

  console.log(`✅ 找到 ${urls.length} 个有效的 URL 准备推送。\n`);

  let successCount = 0;
  let failCount = 0;

  // 考虑到 API 有配额限制（默认 200 个/天），我们每次请求加点延迟
  for (let i = 0; i < urls.length; i++) {
    const targetUrl = urls[i];
    try {
      console.log(`[${i + 1}/${urls.length}] 正在推送: ${targetUrl}`);
      await requestIndexing(targetUrl);
      successCount++;
      // Google API 会有限流，适当延迟 500ms
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      failCount++;
      console.error(`❌ 推送失败: ${targetUrl}`);
      console.error(error.message || error);
    }
  }

  console.log('\n🎉 推送任务完成！');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  
  if (successCount + failCount > 200) {
    console.log('⚠️ 提醒: Google Indexing API 默认配额为每天 200 个请求。如果出现 429 报错，请明天再继续推送剩余部分。');
  }
}

runBatch();
