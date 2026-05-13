import './style.css'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// [Config]
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY as string;

// [Types]
type View = 'login' | 'signup' | 'main' | 'connect' | 'reviews';
type Platform = '네이버'|'배달의민족'|'쿠팡이츠'|'요기요'|'구글';

interface Review {
  id: string;
  platform: Platform;
  user: string;
  star: number;
  text: string;
  time: string;
  replied: boolean;
}

// [State Management]
let currentView: View = localStorage.getItem('isLoggedIn') === 'true' ? 'main' : 'login';
let selectedPlatform: Platform | null = null;
let liveReviews: Review[] = [];
let reviewFilter: 'all' | 'unreplied' = 'unreplied';
let currentUser: any = JSON.parse(localStorage.getItem('currentUser') || 'null');

const PLATFORMS: Platform[] = ['네이버', '배달의민족', '쿠팡이츠', '요기요', '구글'];
const PLATFORM_EMOJI: Record<Platform, string> = { '네이버':'💚', '배달의민족':'🛵', '쿠팡이츠':'🚀', '요기요':'🥘', '구글':'🌐' };
const PLATFORM_COLOR: Record<Platform, string> = { '네이버':'#03C75A', '배달의민족':'#2AC1BC', '쿠팡이츠':'#00ADEF', '요기요':'#FA0050', '구글':'#4285F4' };

// [Kakao SDK Init]
if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
  (window as any).Kakao.init(KAKAO_JS_KEY);
}

// [Helpers]
const showToast = (msg: string, isError = false) => {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.className = `toast show ${isError ? 'error' : ''}`;
    setTimeout(() => t.classList.remove('show'), 3000);
  }
};

// [Navigation]
(window as any).navigateTo = (view: View) => {
  currentView = view;
  updateUI();
  window.scrollTo(0, 0);
};

// [Auth Logic]
const loginSuccess = (name: string) => {
  currentUser = { name, type: 'owner' };
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  (window as any).navigateTo('main');
  showToast(`반갑습니다, ${name}님!`);
};

(window as any).handleKakaoLogin = () => {
  const kakao = (window as any).Kakao;
  if (!kakao || !kakao.isInitialized()) {
    // Kakao 미설정 시 MVP 모드로 바로 입장
    loginSuccess(localStorage.getItem('ownerName') || '사장님');
    return;
  }
  kakao.Auth.login({
    success: () => {
      kakao.API.request({
        url: '/v2/user/me',
        success: (res: any) => loginSuccess(res.kakao_account?.profile?.nickname || '사장님'),
        fail: () => loginSuccess('사장님'),
      });
    },
    fail: (_err: any) => {
      showToast('카카오 로그인에 실패했습니다.', true);
    }
  });
};

(window as any).handleSignup = (e: Event) => {
  e.preventDefault();
  const bizNum = (document.getElementById('signup-biz-num') as HTMLInputElement).value;
  const storeName = (document.getElementById('signup-store-name') as HTMLInputElement).value;
  if (!bizNum || bizNum.replace(/-/g, '').length < 10) {
    return showToast('올바른 사업자 등록번호를 입력해주세요.', true);
  }
  if (!storeName.trim()) {
    return showToast('매장명을 입력해주세요.', true);
  }
  localStorage.setItem('ownerName', storeName.trim() + ' 사장님');
  // MVP: 등록 즉시 로그인 처리
  loginSuccess(storeName.trim() + ' 사장님');
  showToast('가게 등록이 완료되었습니다! 바로 시작합니다.');
};

(window as any).handleLogout = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  (window as any).navigateTo('login');
};

// [UI Components]
const renderNav = () => `
  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-logo" style="cursor:pointer" onclick="navigateTo('main')">먹장먹살<span>AI 비서</span></div>
      <div style="display:flex; gap:12px; align-items:center">
        ${currentView !== 'login' && currentView !== 'signup' ? `
          <button class="btn-sm btn-outline" onclick="navigateTo('connect')">🔌 연동관리</button>
          <button class="btn-sm btn-outline" onclick="handleLogout()">로그아웃</button>
        ` : ''}
        <div class="nav-badge"><span class="dot"></span>Live</div>
      </div>
    </div>
  </nav>
`;

const renderLoginView = () => `
  <section class="hero" style="padding-top: 100px; animation: slideDown 0.6s ease-out;">
    <div class="section-tag">사장님 전용</div>
    <h1 style="font-size: 42px;">사장님의 리뷰 고민,<br><span class="highlight">먹장먹살이 해결합니다.</span></h1>
    <p style="color: var(--text-3); margin-bottom: 12px;">처음 오셨나요? 먼저 가게를 등록해주세요.</p>

    <div style="max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <button class="generate-btn" style="width:100%; font-size:18px; padding:20px;" onclick="navigateTo('signup')">
        🏪 우리 가게 등록하고 시작하기
      </button>
      <p style="color:var(--text-3); font-size:13px; margin:0;">이미 등록하셨나요?</p>
      <button class="generate-btn" style="background:#FEE500; color:#3C1E1E; border:none; width:100%;" onclick="handleKakaoLogin()">
        <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_small.png" style="width:20px; vertical-align:middle; margin-right:8px"> 카카오로 로그인
      </button>
    </div>
  </section>
`;

const renderSignupView = () => `
  <section class="tool-section" style="max-width: 500px; padding-top: 80px;">
    <div class="tool-card" style="padding: 40px;">
      <h2 style="margin-bottom: 8px; text-align: center;">🏪 가게 등록하기</h2>
      <p style="text-align:center; color:var(--text-3); font-size:13px; margin-bottom:28px;">등록 후 바로 리뷰 관리를 시작할 수 있습니다.</p>
      <form onsubmit="handleSignup(event)">
        <label>매장명 *</label>
        <input type="text" id="signup-store-name" class="review-input" placeholder="예) 맛있는 삼겹살집" style="margin-bottom: 20px;">
        <label>사업자 등록번호 *</label>
        <input type="text" id="signup-biz-num" class="review-input" placeholder="000-00-00000" style="margin-bottom: 28px;">
        <button type="submit" class="generate-btn">등록하고 바로 시작하기 →</button>
      </form>
      <p style="text-align:center; font-size:12px; color:var(--text-3); margin-top:20px; cursor:pointer;" onclick="navigateTo('login')">← 이전으로</p>
    </div>
  </section>
`;

const renderMainView = () => {
  const hasAnyId = PLATFORMS.some(p => localStorage.getItem(`id-${p}`));
  return `
  <section class="hero" style="padding-top: 60px;">
    <h1 style="font-size: 32px; margin-bottom: 12px;">반갑습니다, <span class="highlight">${currentUser?.name || '사장님'}!</span></h1>
    <p style="color: var(--text-3); margin-bottom: 32px;">관리할 플랫폼을 선택하세요.</p>

    ${!hasAnyId ? `
    <div style="max-width:900px; margin: 0 auto 40px; padding:24px 32px; background:rgba(255,200,0,0.07); border:1px solid rgba(255,200,0,0.3); border-radius:20px; display:flex; align-items:center; gap:16px;">
      <span style="font-size:28px;">🔌</span>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">먼저 가게 ID를 연동해주세요</div>
        <div style="font-size:13px; color:var(--text-3);">각 플랫폼의 가게 ID를 등록해야 리뷰를 불러올 수 있습니다.</div>
      </div>
      <button class="btn-sm btn-outline" style="margin-left:auto; white-space:nowrap;" onclick="navigateTo('connect')">지금 연동하기 →</button>
    </div>
    ` : ''}

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:20px; max-width: 900px; margin: 0 auto;">
      ${PLATFORMS.map(p => {
        const hasId = !!localStorage.getItem(`id-${p}`);
        return `
        <div onclick="openPlatformReviews('${p}')" style="cursor:pointer; padding:32px 20px; border:1px solid ${hasId ? PLATFORM_COLOR[p] + '55' : 'var(--border)'}; border-radius:32px; text-align:center; background:rgba(255,255,255,0.03); transition:all 0.3s">
          <div style="font-size:48px; margin-bottom:16px;">${PLATFORM_EMOJI[p]}</div>
          <div style="font-weight:900; font-size:16px;">${p}</div>
          <div style="font-size:11px; color:${hasId ? PLATFORM_COLOR[p] : 'var(--text-3)'}; margin-top:8px">${hasId ? '✅ 연동됨' : '미연동'}</div>
        </div>`;
      }).join('')}
    </div>
  </section>
`};


const renderReviewsView = () => {
  const filtered = liveReviews.filter(r => r.platform === selectedPlatform && (reviewFilter === 'all' || !r.replied));
  
  return `
  <section class="tool-section">
    <button class="btn-sm btn-outline" style="margin-bottom:24px;" onclick="navigateTo('main')">← 돌아가기</button>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
      <div>
        <div class="section-tag">${selectedPlatform} 관리</div>
        <h2 style="font-size:28px;">${PLATFORM_EMOJI[selectedPlatform!]} 리뷰 관리 대시보드</h2>
      </div>
      <div class="category-tabs" style="margin:0">
        <button class="tab-btn ${reviewFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">전체 리뷰</button>
        <button class="tab-btn ${reviewFilter === 'unreplied' ? 'active' : ''}" onclick="setFilter('unreplied')">미답변 리뷰</button>
      </div>
    </div>

    <div id="review-list-container">
      ${filtered.length === 0 ? `
        <div class="history-empty" style="background:rgba(255,255,255,0.02); border-radius:32px; padding:100px; border:1px dashed var(--border)">
          표시할 리뷰가 없습니다. 🎉
        </div>
      ` : filtered.map(r => `
        <div class="tool-card" style="margin-bottom:32px; padding:32px; border-left: 6px solid ${PLATFORM_COLOR[r.platform]}; border-radius:32px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
            <span style="font-weight:900; font-size:18px;">${r.user}</span>
            <span style="color:var(--yellow);">${'⭐'.repeat(r.star)}</span>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:16px; margin-bottom:24px; line-height:1.7; color:var(--text-2); border:1px solid rgba(255,255,255,0.05)">
            "${r.text}"
          </div>
          ${r.replied ? `
            <div style="background:rgba(34,197,94,0.05); color:var(--green); padding:16px; border-radius:12px; font-size:14px; text-align:center; font-weight:700">
              ✅ 답글 등록 완료
            </div>
          ` : `
            <button class="generate-btn" onclick="handleCreateDraft('${r.id}')">✨ AI 답변 생성</button>
          `}
          <div id="reply-result-${r.id}" style="display:none; margin-top:24px;">
            <textarea id="text-${r.id}" class="review-input" rows="6" style="margin-bottom:16px;"></textarea>
            <button class="btn-sm btn-orange" style="width:100%; padding:16px;" onclick="handleFinalSubmit('${r.id}')">플랫폼에 등록</button>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  `;
};

// 로그인 방식이 필요한 플랫폼 (ID|비밀번호 형식으로 저장)
const LOGIN_PLATFORMS: Platform[] = ['배달의민족', '쿠팡이츠', '요기요'];

const renderConnectView = () => `
  <section class="tool-section" style="max-width: 700px;">
    <button class="btn-sm btn-outline" style="margin-bottom:24px;" onclick="navigateTo('main')">← 돌아가기</button>
    <div class="section-tag">연동 관리</div>
    <h2 style="font-size:28px; margin-bottom:8px;">🔌 플랫폼 연동 설정</h2>
    <p style="color:var(--text-3); margin-bottom:40px;">각 플랫폼 정보를 입력하면 리뷰를 자동으로 가져옵니다.</p>

    ${PLATFORMS.map(p => {
      if (LOGIN_PLATFORMS.includes(p)) {
        const saved = (localStorage.getItem(`id-${p}`) || '').split('|');
        return `
        <div class="tool-card" style="margin-bottom:20px; padding:28px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <span style="font-size:28px;">${PLATFORM_EMOJI[p]}</span>
            <span style="font-weight:900; font-size:18px;">${p}</span>
            <span style="font-size:11px; color:var(--text-3); background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px;">사장님 계정 로그인 필요</span>
          </div>
          <label style="font-size:12px; color:var(--text-3); display:block; margin-bottom:4px;">사장님 로그인 ID (전화번호)</label>
          <input type="text" class="review-input" id="connect-id-${p}"
            placeholder="010-0000-0000" value="${saved[0] || ''}" style="margin-bottom:8px;">
          <label style="font-size:12px; color:var(--text-3); display:block; margin-bottom:4px;">비밀번호</label>
          <input type="password" class="review-input" id="connect-pw-${p}"
            placeholder="비밀번호" value="${saved[1] || ''}" style="margin-bottom:12px;">
          <button class="btn-sm btn-outline" onclick="saveConnectId('${p}')">저장</button>
        </div>`;
      }
      const spSaved = p === '네이버' ? (localStorage.getItem('sp-네이버') || '').split('|') : [];
      return `
      <div class="tool-card" style="margin-bottom:20px; padding:28px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <span style="font-size:28px;">${PLATFORM_EMOJI[p]}</span>
          <span style="font-weight:900; font-size:18px;">${p}</span>
        </div>
        <input type="text" class="review-input"
          id="connect-id-${p}"
          placeholder="${p === '구글' ? '구글 지도 URL 또는 Place ID (ChIJ...)' : p === '네이버' ? '네이버 플레이스 URL 또는 가게 ID' : p + ' 가게 ID 또는 URL'}"
          value="${localStorage.getItem(`id-${p}`) || ''}"
          style="margin-bottom:12px;">
        <button class="btn-sm btn-outline" onclick="saveConnectId('${p}')">저장</button>
        ${p === '네이버' ? `
        <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border);">
          <div style="font-size:12px; font-weight:700; margin-bottom:8px;">답글 등록용 스마트플레이스 계정</div>
          <label style="font-size:12px; color:var(--text-3); display:block; margin-bottom:4px;">네이버 아이디</label>
          <input type="text" class="review-input" id="sp-naver-id"
            placeholder="네이버 아이디" value="${spSaved[0] || ''}" style="margin-bottom:8px;">
          <label style="font-size:12px; color:var(--text-3); display:block; margin-bottom:4px;">비밀번호</label>
          <input type="password" class="review-input" id="sp-naver-pw"
            placeholder="비밀번호" value="${spSaved[1] || ''}" style="margin-bottom:12px;">
          <button class="btn-sm btn-outline" onclick="saveNaverSmartPlace()">스마트플레이스 계정 저장</button>
        </div>` : ''}
      </div>`;
    }).join('')}

    <div class="tool-card" style="padding:28px; margin-bottom:20px;">
      <div style="font-weight:900; margin-bottom:12px;">⚙️ 백엔드 서버 주소</div>
      <input type="text" class="review-input"
        id="connect-backend-url"
        placeholder="http://localhost:8000"
        value="${localStorage.getItem('backend-url') || 'http://localhost:8000'}"
        style="margin-bottom:12px;">
      <button class="btn-sm btn-outline" onclick="saveBackendUrl()">저장</button>
    </div>
  </section>
`;

// [Core Logic]
(window as any).setFilter = (filter: 'all' | 'unreplied') => {
  reviewFilter = filter;
  updateUI();
};

(window as any).openPlatformReviews = async (platform: Platform) => {
  selectedPlatform = platform;
  currentView = 'reviews';
  updateUI();
  (window as any).syncReviews(platform);
};

(window as any).syncReviews = async (platform: Platform) => {
  showToast(`${platform} 리뷰를 가져오고 있습니다...`);
  try {
    const backendUrl = localStorage.getItem('backend-url') || 'http://localhost:8000';
    const savedId = localStorage.getItem(`id-${platform}`) || '';
    const placeId = savedId || (platform === '네이버' ? '1876527582' : '');
    if (!placeId) {
      showToast(`${platform} 연동 정보가 없습니다. 연동관리에서 설정해주세요.`, true);
      return;
    }
    const res = await fetch(`${backendUrl}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': BACKEND_API_KEY },
      body: JSON.stringify({ platform: platform === '네이버' ? 'naver' : platform, target_id: placeId })
    });
    const result = await res.json();
    if (result.status === 'success') {
      liveReviews = result.data.map((r:any) => ({...r, platform}));
      updateUI();
      showToast('리뷰 동기화 완료!');
    }
  } catch (err) {
    showToast('백엔드 연결 실패. 모의 데이터를 표시합니다.', true);
    // Mock data for demo
    liveReviews = [
      { id: '1', platform, user:'고마워요', star:5, text:'진짜 맛있네요! 또 올게요.', time:'방금', replied: false },
      { id: '2', platform, user:'단골님', star:4, text:'항상 잘 먹고 있습니다.', time:'어제', replied: true }
    ];
    updateUI();
  }
};

(window as any).handleFinalSubmit = async (id: string) => {
  const review = liveReviews.find(r => r.id === id);
  if (!review) return;
  const textarea = document.getElementById(`text-${id}`) as HTMLTextAreaElement;
  const replyText = textarea?.value?.trim();
  if (!replyText) return showToast('답변 내용을 입력해주세요.', true);
  try {
    showToast('답글을 등록하고 있습니다...');
    const backendUrl = localStorage.getItem('backend-url') || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': BACKEND_API_KEY },
      body: JSON.stringify({
        platform: review.platform === '네이버' ? 'naver' : review.platform,
        place_id: localStorage.getItem(`id-${review.platform}`) || '',
        review_id: review.id,
        reply_text: replyText,
        credentials: review.platform === '네이버' ? (localStorage.getItem('sp-네이버') || '') : ''
      })
    });
    const result = await res.json();
    if (result.status === 'success') {
      review.replied = true;
      showToast('답글이 등록되었습니다!');
      updateUI();
    } else {
      showToast('답글 등록에 실패했습니다.', true);
    }
  } catch {
    showToast('백엔드 연결 실패.', true);
  }
};

(window as any).saveConnectId = (platform: Platform) => {
  const input = document.getElementById(`connect-id-${platform}`) as HTMLInputElement;
  if (!input) return;
  if (LOGIN_PLATFORMS.includes(platform)) {
    const pwInput = document.getElementById(`connect-pw-${platform}`) as HTMLInputElement;
    const pw = pwInput?.value || '';
    localStorage.setItem(`id-${platform}`, `${input.value}|${pw}`);
  } else {
    localStorage.setItem(`id-${platform}`, input.value);
  }
  showToast(`${platform} 정보가 저장되었습니다.`);
};

(window as any).saveNaverSmartPlace = () => {
  const idInput = document.getElementById('sp-naver-id') as HTMLInputElement;
  const pwInput = document.getElementById('sp-naver-pw') as HTMLInputElement;
  if (idInput && pwInput) {
    localStorage.setItem('sp-네이버', `${idInput.value}|${pwInput.value}`);
    showToast('스마트플레이스 계정이 저장되었습니다.');
  }
};

(window as any).saveBackendUrl = () => {
  const input = document.getElementById('connect-backend-url') as HTMLInputElement;
  if (input) {
    localStorage.setItem('backend-url', input.value);
    showToast('백엔드 서버 주소가 저장되었습니다.');
  }
};

(window as any).handleCreateDraft = async (id: string) => {
  const review = liveReviews.find(r => r.id === id);
  if (!review) return;

  showToast('AI 답변을 생성하고 있습니다...');
  let reply = '';
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `당신은 친절한 음식점 사장님입니다. 아래 고객 리뷰에 대해 감사하고 진심 어린 답글을 3~5문장으로 작성해주세요.\n\n리뷰: "${review.text}"` }] }]
      })
    });
    const data = await res.json();
    if (!res.ok) {
      const errMsg = data.error?.message || `HTTP ${res.status}`;
      showToast(`Gemini 오류: ${errMsg}`, true);
      reply = `[오류] ${errMsg}\n\n직접 답변을 입력해주세요.`;
    } else {
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '답변 생성에 실패했습니다.';
    }
  } catch (e: any) {
    const msg = e?.message || '알 수 없는 오류';
    showToast(`네트워크 오류: ${msg}`, true);
    reply = '네트워크 오류로 생성에 실패했습니다. 직접 입력해주세요.';
  }

  document.getElementById(`reply-result-${id}`)!.style.display = 'block';
  (document.getElementById(`text-${id}`) as HTMLTextAreaElement).value = reply;
  showToast('AI 답변이 생성되었습니다!');
};

// [UI Update]
function updateUI() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    ${renderNav()}
    <div id="view-container">
      ${currentView === 'login' ? renderLoginView() : 
        currentView === 'signup' ? renderSignupView() :
        currentView === 'main' ? renderMainView() : 
        currentView === 'connect' ? renderConnectView() : 
        renderReviewsView()}
    </div>
    <div class="toast" id="toast"></div>
  `;
}

updateUI();
