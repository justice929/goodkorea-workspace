const https = require('https');

const TOKEN = "8633595701:AAGJkKBWOAT6hpL5Cr2kdjubIGwmQVO5zuw";
const CHAT_ID = 1397448028;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

// HTTP GET 요청
function apiGet(method, params = {}) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const url = `${BASE_URL}/${method}${query ? '?' + query : ''}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// HTTP POST 요청
function apiPost(method, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => resolve(JSON.parse(resData)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sendMessage(text) {
  const result = await apiPost('sendMessage', { chat_id: CHAT_ID, text });
  if (result.ok) {
    console.log(`✅ 메시지 전송 완료: "${text}"`);
  } else {
    console.error(`❌ 전송 실패:`, result);
  }
  return result;
}

async function getUpdates(offset) {
  const params = { timeout: 30 };
  if (offset) params.offset = offset;
  return await apiGet('getUpdates', params);
}

async function main() {
  // 1. 연결 확인
  console.log("🔍 텔레그램 봇 연결 확인 중...");
  const me = await apiGet('getMe');
  if (!me.ok) {
    console.error("❌ 봇 연결 실패!", me);
    process.exit(1);
  }
  console.log(`✅ 봇 연결 성공! 봇 이름: @${me.result.username}`);

  // 2. 인사 메시지 전송
  await sendMessage("안녕하세요 대표님");

  // 3. 답장 대기 → "옛썰" 자동 응답
  console.log("📡 대표님 답장 대기 중...");
  
  // 현재 업데이트 오프셋 초기화 (기존 메시지 무시)
  const initUpdates = await apiGet('getUpdates', { offset: -1 });
  let lastUpdateId = null;
  if (initUpdates.ok && initUpdates.result.length > 0) {
    lastUpdateId = initUpdates.result[initUpdates.result.length - 1].update_id + 1;
  }

  // 폴링 루프
  while (true) {
    const params = { timeout: 30 };
    if (lastUpdateId) params.offset = lastUpdateId;

    const updates = await apiGet('getUpdates', params);
    if (updates.ok && updates.result.length > 0) {
      for (const update of updates.result) {
        lastUpdateId = update.update_id + 1;
        if (update.message && update.message.text) {
          const msg = update.message.text;
          console.log(`📩 대표님 메시지: "${msg}"`);
          await sendMessage("옛썰");
          console.log("✅ '옛썰' 전송 완료! 종료합니다.");
          process.exit(0);
        }
      }
    }
  }
}

main().catch(err => {
  console.error("💥 오류 발생:", err.message);
  process.exit(1);
});
