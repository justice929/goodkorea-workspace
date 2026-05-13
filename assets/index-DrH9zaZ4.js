(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=`,t=void 0,n=void 0,r=localStorage.getItem(`isLoggedIn`)===`true`?`main`:`login`,i=null,a=[],o=`unreplied`,s=JSON.parse(localStorage.getItem(`currentUser`)||`null`),c=[`네이버`,`배달의민족`,`쿠팡이츠`,`요기요`,`구글`],l={네이버:`💚`,배달의민족:`🛵`,쿠팡이츠:`🚀`,요기요:`🥘`,구글:`🌐`},u={네이버:`#03C75A`,배달의민족:`#2AC1BC`,쿠팡이츠:`#00ADEF`,요기요:`#FA0050`,구글:`#4285F4`};window.Kakao&&!window.Kakao.isInitialized()&&window.Kakao.init(t);var d=(e,t=!1)=>{let n=document.getElementById(`toast`);n&&(n.textContent=e,n.className=`toast show ${t?`error`:``}`,setTimeout(()=>n.classList.remove(`show`),3e3))};window.navigateTo=e=>{r=e,b(),window.scrollTo(0,0)};var f=e=>{s={name:e,type:`owner`},localStorage.setItem(`isLoggedIn`,`true`),localStorage.setItem(`currentUser`,JSON.stringify(s)),window.navigateTo(`main`),d(`반갑습니다, ${e}님!`)};window.handleKakaoLogin=()=>{let e=window.Kakao;if(!e||!e.isInitialized()){f(localStorage.getItem(`ownerName`)||`사장님`);return}e.Auth.login({success:()=>{e.API.request({url:`/v2/user/me`,success:e=>f(e.kakao_account?.profile?.nickname||`사장님`),fail:()=>f(`사장님`)})},fail:e=>{d(`카카오 로그인에 실패했습니다.`,!0)}})},window.handleSignup=e=>{e.preventDefault();let t=document.getElementById(`signup-biz-num`).value,n=document.getElementById(`signup-store-name`).value;if(!t||t.replace(/-/g,``).length<10)return d(`올바른 사업자 등록번호를 입력해주세요.`,!0);if(!n.trim())return d(`매장명을 입력해주세요.`,!0);localStorage.setItem(`ownerName`,n.trim()+` 사장님`),f(n.trim()+` 사장님`),d(`가게 등록이 완료되었습니다! 바로 시작합니다.`)},window.handleLogout=()=>{localStorage.removeItem(`isLoggedIn`),localStorage.removeItem(`currentUser`),window.navigateTo(`login`)};var p=()=>`
  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-logo" style="cursor:pointer" onclick="navigateTo('main')">먹장먹살<span>AI 비서</span></div>
      <div style="display:flex; gap:12px; align-items:center">
        ${r!==`login`&&r!==`signup`?`
          <button class="btn-sm btn-outline" onclick="navigateTo('connect')">🔌 연동관리</button>
          <button class="btn-sm btn-outline" onclick="handleLogout()">로그아웃</button>
        `:``}
        <div class="nav-badge"><span class="dot"></span>Live</div>
      </div>
    </div>
  </nav>
`,m=()=>`
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
`,h=()=>`
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
`,g=()=>{let e=c.some(e=>localStorage.getItem(`id-${e}`));return`
  <section class="hero" style="padding-top: 60px;">
    <h1 style="font-size: 32px; margin-bottom: 12px;">반갑습니다, <span class="highlight">${s?.name||`사장님`}!</span></h1>
    <p style="color: var(--text-3); margin-bottom: 32px;">관리할 플랫폼을 선택하세요.</p>

    ${e?``:`
    <div style="max-width:900px; margin: 0 auto 40px; padding:24px 32px; background:rgba(255,200,0,0.07); border:1px solid rgba(255,200,0,0.3); border-radius:20px; display:flex; align-items:center; gap:16px;">
      <span style="font-size:28px;">🔌</span>
      <div>
        <div style="font-weight:700; margin-bottom:4px;">먼저 가게 ID를 연동해주세요</div>
        <div style="font-size:13px; color:var(--text-3);">각 플랫폼의 가게 ID를 등록해야 리뷰를 불러올 수 있습니다.</div>
      </div>
      <button class="btn-sm btn-outline" style="margin-left:auto; white-space:nowrap;" onclick="navigateTo('connect')">지금 연동하기 →</button>
    </div>
    `}

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:20px; max-width: 900px; margin: 0 auto;">
      ${c.map(e=>{let t=!!localStorage.getItem(`id-${e}`);return`
        <div onclick="openPlatformReviews('${e}')" style="cursor:pointer; padding:32px 20px; border:1px solid ${t?u[e]+`55`:`var(--border)`}; border-radius:32px; text-align:center; background:rgba(255,255,255,0.03); transition:all 0.3s">
          <div style="font-size:48px; margin-bottom:16px;">${l[e]}</div>
          <div style="font-weight:900; font-size:16px;">${e}</div>
          <div style="font-size:11px; color:${t?u[e]:`var(--text-3)`}; margin-top:8px">${t?`✅ 연동됨`:`미연동`}</div>
        </div>`}).join(``)}
    </div>
  </section>
`},_=()=>{let e=a.filter(e=>e.platform===i&&(o===`all`||!e.replied));return`
  <section class="tool-section">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:40px;">
      <div>
        <div class="section-tag">${i} 관리</div>
        <h2 style="font-size:28px;">${l[i]} 리뷰 관리 대시보드</h2>
      </div>
      <div class="category-tabs" style="margin:0">
        <button class="tab-btn ${o===`all`?`active`:``}" onclick="setFilter('all')">전체 리뷰</button>
        <button class="tab-btn ${o===`unreplied`?`active`:``}" onclick="setFilter('unreplied')">미답변 리뷰</button>
      </div>
    </div>

    <div id="review-list-container">
      ${e.length===0?`
        <div class="history-empty" style="background:rgba(255,255,255,0.02); border-radius:32px; padding:100px; border:1px dashed var(--border)">
          표시할 리뷰가 없습니다. 🎉
        </div>
      `:e.map(e=>`
        <div class="tool-card" style="margin-bottom:32px; padding:32px; border-left: 6px solid ${u[e.platform]}; border-radius:32px">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
            <span style="font-weight:900; font-size:18px;">${e.user}</span>
            <span style="color:var(--yellow);">${`⭐`.repeat(e.star)}</span>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:16px; margin-bottom:24px; line-height:1.7; color:var(--text-2); border:1px solid rgba(255,255,255,0.05)">
            "${e.text}"
          </div>
          ${e.replied?`
            <div style="background:rgba(34,197,94,0.05); color:var(--green); padding:16px; border-radius:12px; font-size:14px; text-align:center; font-weight:700">
              ✅ 답글 등록 완료
            </div>
          `:`
            <button class="generate-btn" onclick="handleCreateDraft('${e.id}')">✨ AI 답변 생성</button>
          `}
          <div id="reply-result-${e.id}" style="display:none; margin-top:24px;">
            <textarea id="text-${e.id}" class="review-input" rows="6" style="margin-bottom:16px;"></textarea>
            <button class="btn-sm btn-orange" style="width:100%; padding:16px;" onclick="handleFinalSubmit('${e.id}')">플랫폼에 등록</button>
          </div>
        </div>
      `).join(``)}
    </div>
  </section>
  `},v=[`배달의민족`,`쿠팡이츠`],y=()=>`
  <section class="tool-section" style="max-width: 700px;">
    <div class="section-tag">연동 관리</div>
    <h2 style="font-size:28px; margin-bottom:8px;">🔌 플랫폼 연동 설정</h2>
    <p style="color:var(--text-3); margin-bottom:40px;">각 플랫폼 정보를 입력하면 리뷰를 자동으로 가져옵니다.</p>

    ${c.map(e=>{if(v.includes(e)){let t=(localStorage.getItem(`id-${e}`)||``).split(`|`);return`
        <div class="tool-card" style="margin-bottom:20px; padding:28px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <span style="font-size:28px;">${l[e]}</span>
            <span style="font-weight:900; font-size:18px;">${e}</span>
            <span style="font-size:11px; color:var(--text-3); background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px;">사장님 계정 로그인 필요</span>
          </div>
          <label style="font-size:12px; color:var(--text-3); display:block; margin-bottom:4px;">사장님 로그인 ID (전화번호)</label>
          <input type="text" class="review-input" id="connect-id-${e}"
            placeholder="010-0000-0000" value="${t[0]||``}" style="margin-bottom:8px;">
          <label style="font-size:12px; color:var(--text-3); display:block; margin-bottom:4px;">비밀번호</label>
          <input type="password" class="review-input" id="connect-pw-${e}"
            placeholder="비밀번호" value="${t[1]||``}" style="margin-bottom:12px;">
          <button class="btn-sm btn-outline" onclick="saveConnectId('${e}')">저장</button>
        </div>`}return`
      <div class="tool-card" style="margin-bottom:20px; padding:28px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <span style="font-size:28px;">${l[e]}</span>
          <span style="font-weight:900; font-size:18px;">${e}</span>
        </div>
        <input type="text" class="review-input"
          id="connect-id-${e}"
          placeholder="${e} 가게 ID 또는 URL"
          value="${localStorage.getItem(`id-${e}`)||``}"
          style="margin-bottom:12px;">
        <button class="btn-sm btn-outline" onclick="saveConnectId('${e}')">저장</button>
      </div>`}).join(``)}

    <div class="tool-card" style="padding:28px; margin-bottom:20px;">
      <div style="font-weight:900; margin-bottom:12px;">⚙️ 백엔드 서버 주소</div>
      <input type="text" class="review-input"
        id="connect-backend-url"
        placeholder="http://localhost:8000"
        value="${localStorage.getItem(`backend-url`)||`http://localhost:8000`}"
        style="margin-bottom:12px;">
      <button class="btn-sm btn-outline" onclick="saveBackendUrl()">저장</button>
    </div>
  </section>
`;window.setFilter=e=>{o=e,b()},window.openPlatformReviews=async e=>{i=e,r=`reviews`,b(),window.syncReviews(e)},window.syncReviews=async e=>{d(`${e} 리뷰를 가져오고 있습니다...`);try{let t=localStorage.getItem(`backend-url`)||`http://localhost:8000`,r=localStorage.getItem(`id-${e}`)||(e===`네이버`?`1876527582`:``);if(!r){d(`${e} 연동 정보가 없습니다. 연동관리에서 설정해주세요.`,!0);return}let i=await(await fetch(`${t}/scrape`,{method:`POST`,headers:{"Content-Type":`application/json`,"X-API-Key":n},body:JSON.stringify({platform:e===`네이버`?`naver`:e,target_id:r})})).json();i.status===`success`&&(a=i.data.map(t=>({...t,platform:e})),b(),d(`리뷰 동기화 완료!`))}catch{d(`백엔드 연결 실패. 모의 데이터를 표시합니다.`,!0),a=[{id:`1`,platform:e,user:`고마워요`,star:5,text:`진짜 맛있네요! 또 올게요.`,time:`방금`,replied:!1},{id:`2`,platform:e,user:`단골님`,star:4,text:`항상 잘 먹고 있습니다.`,time:`어제`,replied:!0}],b()}},window.handleFinalSubmit=async e=>{let t=a.find(t=>t.id===e);if(!t)return;let r=document.getElementById(`text-${e}`)?.value?.trim();if(!r)return d(`답변 내용을 입력해주세요.`,!0);try{d(`답글을 등록하고 있습니다...`);let e=localStorage.getItem(`backend-url`)||`http://localhost:8000`;(await(await fetch(`${e}/reply`,{method:`POST`,headers:{"Content-Type":`application/json`,"X-API-Key":n},body:JSON.stringify({platform:t.platform===`네이버`?`naver`:t.platform,place_id:localStorage.getItem(`id-${t.platform}`)||``,review_id:t.id,reply_text:r})})).json()).status===`success`?(t.replied=!0,d(`답글이 등록되었습니다!`),b()):d(`답글 등록에 실패했습니다.`,!0)}catch{d(`백엔드 연결 실패.`,!0)}},window.saveConnectId=e=>{let t=document.getElementById(`connect-id-${e}`);if(t){if(v.includes(e)){let n=document.getElementById(`connect-pw-${e}`)?.value||``;localStorage.setItem(`id-${e}`,`${t.value}|${n}`)}else localStorage.setItem(`id-${e}`,t.value);d(`${e} 정보가 저장되었습니다.`)}},window.saveBackendUrl=()=>{let e=document.getElementById(`connect-backend-url`);e&&(localStorage.setItem(`backend-url`,e.value),d(`백엔드 서버 주소가 저장되었습니다.`))},window.handleCreateDraft=async t=>{let n=a.find(e=>e.id===t);if(!n)return;d(`AI 답변을 생성하고 있습니다...`);let r=``;try{r=(await(await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:`당신은 친절한 음식점 사장님입니다. 아래 고객 리뷰에 대해 감사하고 진심 어린 답글을 3~5문장으로 작성해주세요.\n\n리뷰: "${n.text}"`}]}]})})).json()).candidates?.[0]?.content?.parts?.[0]?.text||`답변 생성에 실패했습니다.`}catch{r=`네트워크 오류로 AI 답변 생성에 실패했습니다. 직접 입력해주세요.`}document.getElementById(`reply-result-${t}`).style.display=`block`,document.getElementById(`text-${t}`).value=r,d(`AI 답변이 생성되었습니다!`)};function b(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    ${p()}
    <div id="view-container">
      ${r===`login`?m():r===`signup`?h():r===`main`?g():r===`connect`?y():_()}
    </div>
    <div class="toast" id="toast"></div>
  `}b();