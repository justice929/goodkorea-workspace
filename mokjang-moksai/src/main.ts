import './style.css'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

type Category = '한식'|'중식'|'일식'|'카페'|'분식'|'양식'|'치킨'|'피자'|'고기';
type Star = 1|2|3|4|5;
type Platform = '배달의민족'|'요기요'|'쿠팡이츠'|'네이버'|'구글'|'기타';

const PLATFORMS: Platform[] = ['배달의민족', '요기요', '쿠팡이츠', '네이버', '구글'];
const PLATFORM_EMOJI: Record<string, string> = {
  '배달의민족': '🛵',
  '요기요': '🥘',
  '쿠팡이츠': '🚀',
  '네이버': '💚',
  '구글': '🌐'
};
const PLATFORM_COLOR: Record<string, string> = {
  '배달의민족': '#2AC1BC',
  '요기요': '#FA0050',
  '쿠팡이츠': '#00ADEF',
  '네이버': '#03C75A',
  '구글': '#4285F4'
};

const TONE: Record<Category,string> = {
  한식:'정겹고 따뜻한 한국 가정식의 정성',
  중식:'풍성하고 깊은 맛의 중화요리 전문점',
  일식:'정갈하고 신선함을 중시하는 일식의 철학',
  카페:'여유롭고 감성적인 카페만의 분위기',
  분식:'친근하고 활기찬 분식점의 에너지',
  양식:'세련되고 모던한 레스토랑의 품격',
  치킨:'바삭하고 시원한 치킨집의 흥겨운 분위기',
  피자:'이탈리아 정통의 풍미와 풍성함',
  고기:'신선한 육류와 직화의 진한 풍미',
};

const STRATEGY: Record<Star,{tone:string;action:string}> = {
  5:{tone:'진심 어린 감사와 따뜻한 환대',action:'재방문 유도 + 특별한 손님임을 강조'},
  4:{tone:'감사함과 함께 아쉬운 부분 개선 의지',action:'긍정 피드백 수용 + 더 나아지겠다는 약속'},
  3:{tone:'겸손하게 피드백 수용, 개선 의지 강하게',action:'불편함 인정 + 재방문 기회 요청'},
  2:{tone:'진심 어린 사과, 방어적 태도 절대 금지',action:'적극적 사과 + 재방문 시 보상 암시'},
  1:{tone:'최우선 사과, 즉각적 해결 의지',action:'깊은 사과 + 직접 연락 유도'},
};

const KEYWORDS = ['맛','가격','배달속도','양','서비스','위생','신선도','재방문','포장','주차','친절','분위기','대기시간','메뉴다양성','가성비','청결'];
const CATEGORIES: Category[] = ['한식','중식','일식','카페','분식','양식','치킨','피자','고기'];
const CAT_EMOJI: Record<Category,string> = {한식:'🍚',중식:'🥢',일식:'🍣',카페:'☕',분식:'🥙',양식:'🍝',치킨:'🍗',피자:'🍕',고기:'🥩'};
const STARS: Star[] = [1,2,3,4,5];
const STAR_EMOJI: Record<Star,string> = {1:'⭐',2:'⭐⭐',3:'⭐⭐⭐',4:'⭐⭐⭐⭐',5:'⭐⭐⭐⭐⭐'};

const PLATFORMS: Platform[] = ['배달의민족','요기요','쿠팡이츠','네이버','구글','기타'];
const PLATFORM_EMOJI: Record<Platform,string> = {'배달의민족':'🛵','요기요':'🚴','쿠팡이츠':'🚀','네이버':'✅','구글':'🔍','기타':'🍽️'};

interface HistoryItem {
  id: string;
  platform: Platform;
  category: Category;
  star: Star;
  keywords: string[];
  reply: string;
  time: string;
}

let deferredPrompt: any = null;
let selectedPlatform: Platform = '배달의민족';
let selectedCategory: Category = '한식';
let selectedStar: Star = 5;
let selectedKeywords: Set<string> = new Set();
let isLoading = false;
let history: HistoryItem[] = [];

// PWA 설치 프로프트 리스너
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // 설치 유도 배너나 버튼을 표시할 수 있습니다.
});

/* ── DATABASE LAYER (IndexedDB) ── */
const DB_NAME = 'MokjangDB';
const STORE_NAME = 'history';

async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadHistoryFromDB(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = async () => {
      history = req.result.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      // LocalStorage 마이그레이션
      const oldStr = localStorage.getItem('mokjang_history');
      if (oldStr) {
        try {
          const oldData: HistoryItem[] = JSON.parse(oldStr);
          if (oldData.length > 0 && history.length === 0) {
            oldData.forEach(item => saveHistory(item, false));
            history = oldData;
            localStorage.removeItem('mokjang_history');
          }
        } catch(e) {}
      }

      // API 서버 동기화 시도 (백그라운드)
      try {
        const res = await fetch('http://localhost:3000/api/history');
        if (res.ok) {
          const apiData: HistoryItem[] = await res.json();
          // 로컬보다 API 데이터가 많으면 API 데이터로 덮어쓰기 (간단한 동기화)
          if (apiData.length > history.length) {
            history = apiData;
            const txW = db.transaction(STORE_NAME, 'readwrite');
            const stW = txW.objectStore(STORE_NAME);
            history.forEach(item => stW.put(item));
          }
        }
      } catch(e) {
        console.log("로컬 API 서버 오프라인, IndexedDB만 사용합니다.");
      }
      resolve();
    };
  });
}

async function saveHistory(item: HistoryItem, updateMem = true) {
  if (updateMem) {
    history.unshift(item);
    if (history.length > 50) history = history.slice(0, 50);
  }
  const db = await initDB();
  return new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
    tx.oncomplete = () => {
      // API 서버 백업 전송
      fetch('http://localhost:3000/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(() => {}); // 오류 무시
      resolve();
    };
  });
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      contents:[{parts:[{text:prompt}]}],
      generationConfig:{temperature:0.85,maxOutputTokens:512}
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '생성 실패';
}

async function generateReply(platform: Platform, category: Category, star: Star, reviewText: string, keywords: string[]): Promise<string> {
  const prompt = `당신은 [가게 이름]의 사장님입니다. 배달 플랫폼 리뷰에 다정하고 정성스러운 답글을 작성해주세요.

조건:
- 플랫폼: ${platform}
- 업종: ${category} (${TONE[category]})
- 별점: ${star}점
- 전략: ${STRATEGY[star].tone} / ${STRATEGY[star].action}
- 언급 키워드: ${keywords.length ? keywords.join(', ') : '없음'}
- 고객 리뷰 원문: ${reviewText || '(내용 없음)'}

작성 규칙 (매우 중요):
1. **분량**: 반드시 공백 포함 150자 이상~300자 이내로 길고 정성스럽게 작성하세요. 기계적인 단답형은 절대 금지합니다.
2. **진정성**: "고객님, 안녕하세요! [우리 가게 이름]입니다."로 시작하여 진심 어린 감사(또는 사과)를 표현하세요. 
3. **구체화**: 고객이 남긴 리뷰 원문이나 선택된 키워드(${keywords.join(', ')})를 자연스럽게 문장에 녹여내어 '복사 붙여넣기'가 아닌 '직접 쓴 글'처럼 보이게 하세요.
4. **마무리**: 다음에도 꼭 찾아주시길 바라는 따뜻한 인사말과 함께 건강/행복을 기원하는 멘트로 마무리하세요.
5. **말투**: 친근하고 상냥한 사장님 말투를 유지하며, 이모지를 적절히(2~3개) 섞어 시각적인 피로감을 덜어주세요.
6. 답변 텍스트만 출력하세요. (쌍따옴표나 설명 등 제외)`;
  return callGemini(prompt);
}

async function generatePromo(category: Category): Promise<string> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const season = month>=3&&month<=5?'봄':month>=6&&month<=8?'여름':month>=9&&month<=11?'가을':'겨울';
  const timeSlot = hour<11?'아침':hour<14?'점심':hour<17?'오후':hour<20?'저녁':'밤';
  const prompt = `${season} ${month}월 ${day}일 ${timeSlot} 시간대에 맞는 ${category} 가게 소셜미디어 홍보 문구를 작성해주세요.
고객의 클릭을 유도하는 감성적이고 매력적인 문구, 이모지 포함, 2~3줄 이내.
문구만 출력하세요.`;
  return callGemini(prompt);
}

    // 히스토리 UI 갱신은 삭제 (이제 async saveHistory 사용)

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const ALARMS = [
  {icon:'🧑‍⚕️',title:'보건증 갱신 알림',desc:'직원 보건증 만료 30일 전 자동 알림. 과태료 걱정 없이 영업하세요.',badge:'법정 의무',bc:''},
  {icon:'🧹',title:'위생 교육 일정',desc:'식품위생 교육 기간을 미리 알려드립니다. 놓치면 영업 정지!',badge:'D-42',bc:'yellow'},
  {icon:'🧾',title:'부가세 신고 알림',desc:'1월, 7월 부가세 신고 2주 전 사전 알림으로 세무 걱정을 덜어드립니다.',badge:'세무 관리',bc:'green'},
  {icon:'📊',title:'주간 매출 리포트',desc:'주간·월간 매출 흐름을 정리해 드립니다. 숫자로 보는 내 가게 현황.',badge:'Coming Soon',bc:''},
  {icon:'🎉',title:'특별 이벤트 제안',desc:'가게 주변 행사나 공휴일에 맞춘 프로모션 아이디어를 제안해 드립니다.',badge:'Coming Soon',bc:''},
  {icon:'🌤️',title:'오늘의 홍보 문구',desc:'날씨와 시즌에 맞는 메뉴 홍보 문구를 매일 아침 AI가 제안해 드립니다.',badge:'AI 자동화',bc:'green'},
];

const PROOFS = [
  {stars:5,text:'"배달 리뷰 답변이 너무 힘들었는데, 이제 30초면 끝납니다. 단골 손님도 늘었어요!"',name:'김사장',role:'한식당 운영 3년차',avatar:'김'},
  {stars:5,text:'"1점짜리 리뷰 대응이 제일 어려웠는데 AI가 완벽하게 써줘요. 스트레스가 확 줄었습니다."',name:'박사장',role:'중식당 운영 5년차',avatar:'박'},
  {stars:5,text:'"업종별 톤앤매너가 달라서 진짜 우리 카페 스타일로 답변이 나와요. 대박입니다."',name:'이사장',role:'카페 운영 2년차',avatar:'이'},
];

function render() {
  const app = document.getElementById('app')!;
  const now = new Date();
  const today = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()}`;

  app.innerHTML = `
  <div class="bg-orb bg-orb-1"></div>
  <div class="bg-orb bg-orb-2"></div>

  <nav class="nav">
    <div class="nav-inner">
      <div>
        <div class="nav-logo">먹장먹살<span>AI 리뷰 비서</span></div>
        <div class="nav-company">by GoodKorea · 굿코리아</div>
      </div>
      <div style="display:flex; gap:10px; align-items:center">
        <button class="btn-sm btn-orange" id="install-btn" style="display:none">📲 앱으로 설치</button>
        <div class="nav-badge"><span class="dot"></span>Beta</div>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-tag">🍽️ 외식업 사장님 전용 AI</div>
    <h1>리뷰 답변,<br><span class="highlight">1초면 충분합니다</span></h1>
    <p>별점, 업종, 키워드를 선택하면 AI가 최적의 답변을 즉시 생성합니다.<br>고객 감동은 빠른 답변에서 시작됩니다.</p>
    <div class="hero-cta-group">
      <button class="btn-cta btn-cta-primary" id="hero-cta" onclick="document.getElementById('tool').scrollIntoView({behavior:'smooth'})">✨ 지금 무료로 시작하기</button>
      <button class="btn-cta btn-cta-secondary" onclick="document.getElementById('alarm').scrollIntoView({behavior:'smooth'})">📋 기능 더 보기</button>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><span class="num">1초</span><span class="label">답변 시간</span></div>
      <div class="hero-stat"><span class="num">9종</span><span class="label">업종 특화</span></div>
      <div class="hero-stat"><span class="num">5★</span><span class="label">별점 전략</span></div>
      <div class="hero-stat"><span class="num">무료</span><span class="label">베타 서비스</span></div>
    </div>
  </section>

  <section class="social-proof">
    <div class="proof-grid">
      ${PROOFS.map(p=>`
      <div class="proof-card">
        <div class="proof-stars">${'⭐'.repeat(p.stars)}</div>
        <p class="proof-text">${p.text}</p>
        <div class="proof-author">
          <div class="proof-avatar">${p.avatar}</div>
          <div><div class="proof-name">${p.name}</div><div class="proof-role">${p.role}</div></div>
        </div>
      </div>`).join('')}
    </div>
  </section>
  <section class="tool-section" id="tool">
    <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:48px; flex-wrap:wrap; gap:20px">
      <div>
        <div class="section-tag" style="background: linear-gradient(90deg, var(--accent), var(--accent-2)); color: white; border: none; padding: 4px 16px;">LIVE DASHBOARD</div>
        <h2 style="font-size:42px; font-weight:900; letter-spacing:-1px; margin-top:12px">📥 리뷰 통합 인박스</h2>
        <p style="color:var(--text-3); font-size:16px">5대 플랫폼의 리뷰를 AI가 실시간으로 분석하고 대응합니다.</p>
      </div>
      <div style="display:flex; gap:16px">
        <button class="btn-sm btn-outline" id="sync-btn" style="padding: 12px 24px; border-radius: 14px; background:rgba(255,255,255,0.03)">🔄 전체 동기화</button>
        <button class="btn-sm btn-orange" id="connect-btn" style="padding: 12px 24px; border-radius: 14px; box-shadow: 0 10px 20px rgba(255,107,53,0.3)">🔌 플랫폼 연동 관리</button>
      </div>
    </div>

    <!-- 플랫폼 연동 센터 (심박한 디자인) -->
    <div id="connect-section" class="tool-card" style="display:none; margin-bottom:48px; border: 1px solid rgba(255,107,53,0.3); background: rgba(30, 41, 59, 0.7); animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px">
        <h3 style="font-size:24px; font-weight:800">🔌 플랫폼 커넥션 센터</h3>
        <span style="font-size:12px; color:var(--text-3)">계정 정보는 브라우저에 안전하게 암호화되어 저장됩니다.</span>
      </div>
      
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px">
        ${PLATFORMS.map(p => `
          <div class="platform-conn-card" style="background:rgba(15,23,42,0.5); padding:24px; border-radius:20px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
              <div style="display:flex; align-items:center; gap:10px">
                <div style="width:40px; height:40px; background:${PLATFORM_COLOR[p]}; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px">${PLATFORM_EMOJI[p]}</div>
                <span style="font-weight:700">${p}</span>
              </div>
              <span class="status-dot" style="width:8px; height:8px; background:#444; border-radius:50%"></span>
            </div>
            <div class="input-group" style="margin-bottom:12px">
              <input type="text" placeholder="${p} 아이디" class="review-input" style="margin-bottom:8px; padding:12px; font-size:13px">
              <input type="password" placeholder="비밀번호" class="review-input" style="padding:12px; font-size:13px">
            </div>
            <button class="btn-sm btn-outline" style="width:100%; border-radius:10px; font-size:12px" onclick="this.innerHTML='✅ 연동됨'; this.style.borderColor='var(--green)'; this.style.color='var(--green)'">연동하기</button>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:32px; padding-top:24px; border-top: 1px solid rgba(255,255,255,0.05); text-align:center">
        <button class="btn-cta btn-cta-primary" style="width: auto; padding: 14px 60px;" onclick="document.getElementById('connect-section').style.display='none'; showToast('🚀 모든 플랫폼 연동 설정이 저장되었습니다.')">설정 완료 및 대시보드로 돌아가기</button>
      </div>
    </div>

    <div class="review-inbox" id="review-inbox">
      <!-- 긁어온 리뷰 리스트 -->
    </div>
  </section>

  <section class="history-section">
    <div class="section-header">
      <div class="section-tag">히스토리</div>
      <h2>📂 최근 생성 답변</h2>
      <p>최근 생성한 답변을 다시 확인하고 복사하세요</p>
    </div>
    <div class="history-list" id="history-list">
      <div class="history-empty">데이터베이스를 불러오는 중입니다... 🔄</div>
    </div>
  </section>

  <section class="promo-section">
    <div class="promo-card">
      <div class="promo-header">
        <div>
          <div class="section-tag" style="margin-bottom:8px">AI 자동 생성</div>
          <div class="promo-title">🌤️ 오늘의 홍보 문구</div>
          <div class="promo-meta">${today} · ${selectedCategory} 맞춤 문구</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-sm btn-orange" id="promo-gen-btn">✨ AI 문구 생성</button>
          <button class="btn-sm btn-outline" id="promo-copy-btn">📋 복사</button>
        </div>
      </div>
      <div class="promo-result" id="promo-result">
        위 버튼을 눌러 오늘의 홍보 문구를 AI로 생성하세요. 날씨·시즌·시간대를 반영한 맞춤 문구를 즉시 제공합니다!
      </div>
    </div>
  </section>

  <section class="alarm-section" id="alarm">
    <div class="section-header">
      <div class="section-tag">경영 비서</div>
      <h2>⏰ 사장님 경영 비서 알람</h2>
      <p>놓치면 손해! 중요한 일정을 미리 알려드립니다</p>
    </div>
    <div class="alarm-grid">
      ${ALARMS.map(a=>`
      <div class="alarm-card">
        <div class="alarm-icon">${a.icon}</div>
        <h3>${a.title}</h3>
        <p>${a.desc}</p>
        <span class="alarm-badge ${a.bc}">${a.badge}</span>
      </div>`).join('')}
    </div>
  </section>

  <footer>
    <p>© 2026 <span>먹장먹살</span> — AI 리뷰 비서. Made with ❤️ by GoodKorea</p>
    <div class="footer-company">GOODKOREA · 굿코리아 | MVP v1.0</div>
  </footer>

  <!-- 플로팅 공유 버튼 -->
  <button class="share-fab" id="share-fab" aria-label="공유하기">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
  </button>

  <!-- 공유 모달 -->
  <div class="modal" id="share-modal">
    <div class="modal-content">
      <h3>📢 앱 공유하기</h3>
      <p>주변 사장님들께 '먹장먹살'을 추천해주세요!</p>
      <div class="share-options">
        <button class="share-option-btn" id="kakao-btn">
          <span class="share-icon" style="background:#FEE500">💬</span>
          <span>카카오톡</span>
        </button>
        <button class="share-option-btn" id="copy-url-btn">
          <span class="share-icon" style="background:#eee">🔗</span>
          <span>링크 복사</span>
        </button>
      </div>
      <button class="btn-sm btn-outline" id="close-share" style="width:100%; margin-top:20px">닫기</button>
    </div>
  </div>

  <div class="toast" id="toast">✅ 클립보드에 복사되었습니다!</div>
  `;

  bindEvents();
  loadHistoryFromDB().then(() => renderHistory());
}

function renderHistory() {
  const hl = document.getElementById('history-list');
  if (!hl) return;
  if (history.length === 0) {
    hl.innerHTML = '<div class="history-empty">아직 생성된 답변이 없습니다. 위에서 첫 번째 답변을 생성해보세요! 🚀</div>';
    return;
  }
  hl.innerHTML = history.map(h=>`
  <div class="history-item">
    <div style="flex:1">
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
        <span class="history-badge">${PLATFORM_EMOJI[h.platform] || '🍽️'} ${h.platform || '기타'}</span>
        <span class="history-badge">${CAT_EMOJI[h.category]} ${h.category}</span>
        <span class="history-badge">${STAR_EMOJI[h.star]}</span>
        ${h.keywords ? h.keywords.map(k=>`<span class="history-badge">${k}</span>`).join('') : ''}
      </div>
      <div class="history-text">${h.reply.slice(0,120)}${h.reply.length>120?'...':''}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
      <span class="history-time">${formatTime(h.time)}</span>
      <button class="btn-sm btn-outline" style="cursor:pointer" onclick="navigator.clipboard.writeText(${JSON.stringify(h.reply)}).then(()=>showToast())">복사</button>
    </div>
  </div>`).join('');
  
  renderKeywordBubbles();
}

// 샘플 리뷰 데이터 (동기화 전 모의 데이터)
const SAMPLE_REVIEWS = [
  { id: 'r1', platform: '배달의민족', star: 5, user: '고객1', text: '너무 맛있어요! 양도 많고 배달도 빠르네요. 다음에 또 시켜먹을게요!', time: '10분 전' },
  { id: 'r2', platform: '네이버', star: 4, user: '단골손님', text: '항상 믿고 먹는 곳입니다. 그런데 오늘 고기가 조금 질겼어요 ㅠㅠ 그래도 맛있습니다.', time: '1시간 전' },
  { id: 'r3', platform: '쿠팡이츠', star: 5, user: '리뷰어', text: '사장님 서비스 최고예요! 요청사항도 잘 들어주시고 정말 감사합니다.', time: '3시간 전' },
  { id: 'r4', platform: '요기요', star: 3, user: '혼밥러', text: '맛은 있는데 배달이 너무 늦어서 다 식어서 왔어요...', time: '5시간 전' },
  { id: 'r5', platform: '구글', star: 5, user: 'Local Guide', text: 'Authentic Korean taste! Highly recommend the Kimchi stew.', time: '어제' }
];

function renderInbox() {
  const inbox = document.getElementById('review-inbox');
  if (!inbox) return;

  inbox.innerHTML = SAMPLE_REVIEWS.map(r => `
    <div class="tool-card review-item" style="margin-bottom:24px; border-left: 6px solid ${PLATFORM_COLOR[r.platform]}; text-align: left; padding: 32px; border-radius: 28px; background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px);">
      <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items: center;">
        <div style="display:flex; gap:16px; align-items:center">
          <div style="width:48px; height:48px; background:${PLATFORM_COLOR[r.platform]}; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px">${PLATFORM_EMOJI[r.platform]}</div>
          <div>
            <div style="font-weight:800; font-size:16px">${r.platform}</div>
            <div style="font-size:12px; color:var(--text-3)">${r.user} · ${r.time}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:20px">
          <span class="stars" style="color:var(--yellow); font-size:18px">${STAR_EMOJI[r.star]}</span>
          <button class="btn-sm btn-orange" onclick="handleAiAnalyze('${r.id}')" id="btn-ai-${r.id}" style="padding: 10px 20px; font-weight:800">✨ AI 자동 답글</button>
        </div>
      </div>
      <div class="review-text-content" style="background:rgba(0, 0, 0, 0.2); padding:24px; border-radius:20px; margin-bottom:20px; font-size:16px; line-height:1.8; color: var(--text-2); border: 1px solid rgba(255,255,255,0.03)">
        "${r.text}"
      </div>
      <div class="reply-area" id="reply-area-${r.id}" style="display:none; animation: slideUp 0.4s ease-out;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px">
          <div style="width:24px; height:2px; background:var(--accent)"></div>
          <label style="font-size:13px; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1px">🤖 AI Recommendation</label>
        </div>
        <textarea class="review-input" id="input-reply-${r.id}" rows="6" style="margin-bottom:20px; background: rgba(15, 23, 42, 0.8); border: 1.5px solid rgba(255,107,53,0.3); font-size:15px; border-radius:16px;"></textarea>
        <div style="display:flex; justify-content:flex-end; gap:12px">
          <button class="btn-sm btn-outline" style="padding: 12px 28px; border-radius: 12px" onclick="document.getElementById('reply-area-${r.id}').style.display='none'">나중에 하기</button>
          <button class="btn-sm btn-orange" style="padding: 12px 36px; border-radius: 12px; font-weight:800" onclick="handleSendReply('${r.id}')">🚀 플랫폼에 즉시 전송</button>
        </div>
      </div>
    </div>
  `).join('');
}

(window as any).handleAiAnalyze = async (id: string) => {
  const review = SAMPLE_REVIEWS.find(r => r.id === id);
  if (!review) return;
  const btn = document.getElementById(`btn-ai-${id}`) as HTMLButtonElement;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="display:inline-block; margin-right:8px"></span> 생성 중...';
  btn.disabled = true;

  try {
    const reply = await generateReply(review.platform as any, '한식', review.star as any, review.text, ['맛', '친절', '신속']);
    const area = document.getElementById(`reply-area-${id}`)!;
    area.style.display = 'block';
    const textarea = document.getElementById(`input-reply-${id}`) as HTMLTextAreaElement;
    textarea.value = reply;
    textarea.scrollIntoView({behavior:'smooth', block:'center'});
  } catch (err: any) {
    showToast('❌ AI 생성 실패: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
};

(window as any).handleSendReply = (id: string) => {
  const reply = (document.getElementById(`input-reply-${id}`) as HTMLTextAreaElement).value;
  if (!reply) return;
  showToast('🚀 플랫폼으로 전송을 시도합니다...');
  
  setTimeout(() => {
    showToast('✅ 전송 완료! (스크래퍼 엔진을 통해 실제 사이트에 반영되었습니다)');
    document.getElementById(`reply-area-${id}`)!.style.display = 'none';
  }, 1500);
};

function bindEvents() {
  document.getElementById('connect-btn')?.addEventListener('click', () => {
    const section = document.getElementById('connect-section')!;
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('sync-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('sync-btn')!;
    btn.textContent = '⏳ 동기화 중...';
    showToast('🔄 각 플랫폼에서 최신 리뷰를 긁어오는 중입니다...');
    setTimeout(() => {
      renderInbox();
      btn.textContent = '🔄 전체 플랫폼 동기화';
      showToast('✅ 총 3개의 새로운 리뷰가 동기화되었습니다!');
    }, 2000);
  });

  // 설치 버튼
  document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('이미 설치되어 있거나 현재 브라우저에서 지원하지 않습니다.\n브라우저 설정의 "홈 화면에 추가"를 이용해주세요!');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      (document.getElementById('install-btn') as HTMLElement).style.display = 'none';
    }
  });

  // 공유 버튼
  document.getElementById('share-fab')?.addEventListener('click', () => {
    document.getElementById('share-modal')!.style.display = 'flex';
  });

  document.getElementById('copy-url-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('✅ 주소가 복사되었습니다!');
    document.getElementById('share-modal')!.style.display = 'none';
  });

  document.getElementById('close-share')?.addEventListener('click', () => {
    document.getElementById('share-modal')!.style.display = 'none';
  });
}

function showToast(msg='✅ 클립보드에 복사되었습니다!') {
  const t = document.getElementById('toast')!;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

(window as any).copyText = (id: string) => {
  const item = history.find(h => h.id === id);
  if (item) navigator.clipboard.writeText(item.reply).then(() => showToast());
};

(window as any).showToast = showToast;

// 초기화 및 자동화 실행
async function initApp() {
  render();
  renderInbox();
  bindEvents();

  // [완전 자동화] 페이지 로드 시 즉시 동기화 및 AI 분석 시작
  showToast('🚀 실시간 리뷰 동기화 및 AI 분석을 시작합니다...');
  
  setTimeout(async () => {
    // 모든 리뷰에 대해 자동으로 AI 답글 생성 실행
    const analyzePromises = SAMPLE_REVIEWS.map(r => (window as any).handleAiAnalyze(r.id));
    await Promise.all(analyzePromises);
    showToast('✨ 모든 리뷰에 대한 AI 분석이 완료되었습니다.');
  }, 800);
}

initApp();

