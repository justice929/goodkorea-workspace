(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=undefined`,t={한식:`정겹고 따뜻한 한국 가정식의 정성`,중식:`풍성하고 깊은 맛의 중화요리 전문점`,일식:`정갈하고 신선함을 중시하는 일식의 철학`,카페:`여유롭고 감성적인 카페만의 분위기`,분식:`친근하고 활기찬 분식점의 에너지`,양식:`세련되고 모던한 레스토랑의 품격`,치킨:`바삭하고 시원한 치킨집의 흥겨운 분위기`,피자:`이탈리아 정통의 풍미와 풍성함`,고기:`신선한 육류와 직화의 진한 풍미`},n={5:{tone:`진심 어린 감사와 따뜻한 환대`,action:`재방문 유도 + 특별한 손님임을 강조`},4:{tone:`감사함과 함께 아쉬운 부분 개선 의지`,action:`긍정 피드백 수용 + 더 나아지겠다는 약속`},3:{tone:`겸손하게 피드백 수용, 개선 의지 강하게`,action:`불편함 인정 + 재방문 기회 요청`},2:{tone:`진심 어린 사과, 방어적 태도 절대 금지`,action:`적극적 사과 + 재방문 시 보상 암시`},1:{tone:`최우선 사과, 즉각적 해결 의지`,action:`깊은 사과 + 직접 연락 유도`}},r=[`맛`,`가격`,`배달속도`,`양`,`서비스`,`위생`,`신선도`,`재방문`,`포장`,`주차`,`친절`,`분위기`,`대기시간`,`메뉴다양성`,`가성비`,`청결`],i=[`한식`,`중식`,`일식`,`카페`,`분식`,`양식`,`치킨`,`피자`,`고기`],a={한식:`🍚`,중식:`🥢`,일식:`🍣`,카페:`☕`,분식:`🥙`,양식:`🍝`,치킨:`🍗`,피자:`🍕`,고기:`🥩`},o=[1,2,3,4,5],s={1:`⭐`,2:`⭐⭐`,3:`⭐⭐⭐`,4:`⭐⭐⭐⭐`,5:`⭐⭐⭐⭐⭐`},c=[`배달의민족`,`요기요`,`쿠팡이츠`,`네이버`,`구글`,`기타`],l={배달의민족:`🛵`,요기요:`🚴`,쿠팡이츠:`🚀`,네이버:`✅`,구글:`🔍`,기타:`🍽️`},u=null,d=`배달의민족`,f=`한식`,p=5,m=new Set,h=!1,g=[];window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),u=e});var _=`MokjangDB`,v=`history`;async function y(){return new Promise((e,t)=>{let n=indexedDB.open(_,1);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(v)||e.createObjectStore(v,{keyPath:`id`})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function b(){let e=await y();return new Promise(t=>{let n=e.transaction(v,`readonly`).objectStore(v).getAll();n.onsuccess=async()=>{g=n.result.sort((e,t)=>new Date(t.time).getTime()-new Date(e.time).getTime());let r=localStorage.getItem(`mokjang_history`);if(r)try{let e=JSON.parse(r);e.length>0&&g.length===0&&(e.forEach(e=>x(e,!1)),g=e,localStorage.removeItem(`mokjang_history`))}catch{}try{let t=await fetch(`http://localhost:3000/api/history`);if(t.ok){let n=await t.json();if(n.length>g.length){g=n;let t=e.transaction(v,`readwrite`).objectStore(v);g.forEach(e=>t.put(e))}}}catch{console.log(`로컬 API 서버 오프라인, IndexedDB만 사용합니다.`)}t()}})}async function x(e,t=!0){t&&(g.unshift(e),g.length>50&&(g=g.slice(0,50)));let n=await y();return new Promise(t=>{let r=n.transaction(v,`readwrite`);r.objectStore(v).put(e),r.oncomplete=()=>{fetch(`http://localhost:3000/api/history`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}).catch(()=>{}),t()}})}async function S(t){let n=await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:t}]}],generationConfig:{temperature:.85,maxOutputTokens:512}})});if(!n.ok)throw Error(`API ${n.status}`);return(await n.json()).candidates?.[0]?.content?.parts?.[0]?.text?.trim()??`생성 실패`}async function C(e,r,i,a,o){return S(`당신은 [가게 이름]의 사장님입니다. 배달 플랫폼 리뷰에 다정하고 정성스러운 답글을 작성해주세요.

조건:
- 플랫폼: ${e}
- 업종: ${r} (${t[r]})
- 별점: ${i}점
- 전략: ${n[i].tone} / ${n[i].action}
- 언급 키워드: ${o.length?o.join(`, `):`없음`}
- 고객 리뷰 원문: ${a||`(내용 없음)`}

작성 규칙 (매우 중요):
1. **분량**: 반드시 공백 포함 150자 이상~300자 이내로 길고 정성스럽게 작성하세요. 기계적인 단답형은 절대 금지합니다.
2. **진정성**: "고객님, 안녕하세요! [우리 가게 이름]입니다."로 시작하여 진심 어린 감사(또는 사과)를 표현하세요. 
3. **구체화**: 고객이 남긴 리뷰 원문이나 선택된 키워드(${o.join(`, `)})를 자연스럽게 문장에 녹여내어 '복사 붙여넣기'가 아닌 '직접 쓴 글'처럼 보이게 하세요.
4. **마무리**: 다음에도 꼭 찾아주시길 바라는 따뜻한 인사말과 함께 건강/행복을 기원하는 멘트로 마무리하세요.
5. **말투**: 친근하고 상냥한 사장님 말투를 유지하며, 이모지를 적절히(2~3개) 섞어 시각적인 피로감을 덜어주세요.
6. 답변 텍스트만 출력하세요. (쌍따옴표나 설명 등 제외)`)}async function w(e){let t=new Date,n=t.getMonth()+1,r=t.getDate(),i=t.getHours();return S(`${n>=3&&n<=5?`봄`:n>=6&&n<=8?`여름`:n>=9&&n<=11?`가을`:`겨울`} ${n}월 ${r}일 ${i<11?`아침`:i<14?`점심`:i<17?`오후`:i<20?`저녁`:`밤`} 시간대에 맞는 ${e} 가게 소셜미디어 홍보 문구를 작성해주세요.
고객의 클릭을 유도하는 감성적이고 매력적인 문구, 이모지 포함, 2~3줄 이내.
문구만 출력하세요.`)}function T(e){let t=new Date(e);return`${t.getMonth()+1}/${t.getDate()} ${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`}var E=[{icon:`🧑‍⚕️`,title:`보건증 갱신 알림`,desc:`직원 보건증 만료 30일 전 자동 알림. 과태료 걱정 없이 영업하세요.`,badge:`법정 의무`,bc:``},{icon:`🧹`,title:`위생 교육 일정`,desc:`식품위생 교육 기간을 미리 알려드립니다. 놓치면 영업 정지!`,badge:`D-42`,bc:`yellow`},{icon:`🧾`,title:`부가세 신고 알림`,desc:`1월, 7월 부가세 신고 2주 전 사전 알림으로 세무 걱정을 덜어드립니다.`,badge:`세무 관리`,bc:`green`},{icon:`📊`,title:`주간 매출 리포트`,desc:`주간·월간 매출 흐름을 정리해 드립니다. 숫자로 보는 내 가게 현황.`,badge:`Coming Soon`,bc:``},{icon:`🎉`,title:`특별 이벤트 제안`,desc:`가게 주변 행사나 공휴일에 맞춘 프로모션 아이디어를 제안해 드립니다.`,badge:`Coming Soon`,bc:``},{icon:`🌤️`,title:`오늘의 홍보 문구`,desc:`날씨와 시즌에 맞는 메뉴 홍보 문구를 매일 아침 AI가 제안해 드립니다.`,badge:`AI 자동화`,bc:`green`}],D=[{stars:5,text:`"배달 리뷰 답변이 너무 힘들었는데, 이제 30초면 끝납니다. 단골 손님도 늘었어요!"`,name:`김사장`,role:`한식당 운영 3년차`,avatar:`김`},{stars:5,text:`"1점짜리 리뷰 대응이 제일 어려웠는데 AI가 완벽하게 써줘요. 스트레스가 확 줄었습니다."`,name:`박사장`,role:`중식당 운영 5년차`,avatar:`박`},{stars:5,text:`"업종별 톤앤매너가 달라서 진짜 우리 카페 스타일로 답변이 나와요. 대박입니다."`,name:`이사장`,role:`카페 운영 2년차`,avatar:`이`}];function O(){let e=document.getElementById(`app`),t=new Date,n=`${t.getFullYear()}.${t.getMonth()+1}.${t.getDate()}`;e.innerHTML=`
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
      ${D.map(e=>`
      <div class="proof-card">
        <div class="proof-stars">${`⭐`.repeat(e.stars)}</div>
        <p class="proof-text">${e.text}</p>
        <div class="proof-author">
          <div class="proof-avatar">${e.avatar}</div>
          <div><div class="proof-name">${e.name}</div><div class="proof-role">${e.role}</div></div>
        </div>
      </div>`).join(``)}
    </div>
  </section>

  <section class="tool-section" id="tool">
    <div class="keyword-trends-card" style="margin-bottom: 48px; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,107,53,0.15); border-radius: 24px; padding: 32px; backdrop-filter: blur(10px);">
      <div class="section-tag" style="margin-bottom: 12px">실시간 트렌드</div>
      <h3 style="margin-bottom: 8px; font-size: 22px; font-weight: 800">🔥 우리 매장 인기 키워드</h3>
      <p style="font-size: 14px; color: var(--text-3); margin-bottom: 32px">사장님이 답변에 가장 많이 사용하신 핵심 키워드 비중입니다.</p>
      <div id="keyword-bubble-container" class="bubble-container">
        <!-- Bubbles rendered here -->
      </div>
    </div>

    <div class="section-header">
      <div class="section-tag">AI 핵심 기능</div>
      <h2>🤖 AI 리뷰 답변 생성기</h2>
      <p>업종과 별점을 선택하고 리뷰를 붙여넣으세요</p>
    </div>
    <div class="category-tabs" id="cat-tabs">
      ${i.map(e=>`
      <button class="tab-btn${e===f?` active`:``}" data-cat="${e}" id="tab-${e}">
        ${a[e]} ${e}
      </button>`).join(``)}
    </div>
    <div class="tool-card">
      <div class="platform-section" style="margin-bottom: 24px;">
        <label>주문 플랫폼</label>
        <div class="category-tabs" id="platform-tabs" style="justify-content: flex-start; margin-bottom: 0;">
          ${c.map(e=>`
          <button class="tab-btn platform-btn${e===d?` active`:``}" data-plat="${e}" id="plat-${e}">
            ${l[e]} ${e}
          </button>`).join(``)}
        </div>
      </div>
      <div class="star-section">
        <label>고객 별점</label>
        <div class="star-selector" id="star-sel">
          ${o.map(e=>`
          <div class="star-option${e===p?` active`:``}" data-star="${e}" id="star-${e}" role="button" tabindex="0">
            <span class="stars">${s[e]}</span>
            <span class="star-num">${e}점</span>
          </div>`).join(``)}
        </div>
      </div>
      <div class="input-section">
        <label>고객 리뷰 내용 (선택)</label>
        <textarea class="review-input" id="review-input" placeholder="고객이 남긴 리뷰를 붙여넣으세요. 없으면 비워두셔도 됩니다." rows="4"></textarea>
      </div>
      <div class="keyword-section">
        <label>핵심 키워드 (중복 선택 가능)</label>
        <div class="keyword-tags" id="kw-tags">
          ${r.map(e=>`<button class="keyword-tag" data-kw="${e}" id="kw-${e}">${e}</button>`).join(``)}
        </div>
      </div>
      <button class="generate-btn" id="gen-btn">
        <span class="btn-inner">
          <span class="spinner"></span>
          <span class="btn-text">✨ AI 답변 생성하기</span>
        </span>
      </button>
      <div class="result-card" id="result-card">
        <div class="result-header">
          <span class="result-label">🤖 AI 생성 답변</span>
          <button class="copy-btn" id="copy-btn">📋 복사</button>
        </div>
        <div class="result-body">
          <p class="result-text" id="result-text"></p>
        </div>
      </div>
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
          <div class="promo-meta">${n} · ${f} 맞춤 문구</div>
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
      ${E.map(e=>`
      <div class="alarm-card">
        <div class="alarm-icon">${e.icon}</div>
        <h3>${e.title}</h3>
        <p>${e.desc}</p>
        <span class="alarm-badge ${e.bc}">${e.badge}</span>
      </div>`).join(``)}
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
  `,j(),b().then(()=>k())}function k(){let e=document.getElementById(`history-list`);if(e){if(g.length===0){e.innerHTML=`<div class="history-empty">아직 생성된 답변이 없습니다. 위에서 첫 번째 답변을 생성해보세요! 🚀</div>`;return}e.innerHTML=g.map(e=>`
  <div class="history-item">
    <div style="flex:1">
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
        <span class="history-badge">${l[e.platform]||`🍽️`} ${e.platform||`기타`}</span>
        <span class="history-badge">${a[e.category]} ${e.category}</span>
        <span class="history-badge">${s[e.star]}</span>
        ${e.keywords?e.keywords.map(e=>`<span class="history-badge">${e}</span>`).join(``):``}
      </div>
      <div class="history-text">${e.reply.slice(0,120)}${e.reply.length>120?`...`:``}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
      <span class="history-time">${T(e.time)}</span>
      <button class="btn-sm btn-outline" style="cursor:pointer" onclick="navigator.clipboard.writeText(${JSON.stringify(e.reply)}).then(()=>showToast())">복사</button>
    </div>
  </div>`).join(``),A()}}function A(){let e=document.getElementById(`keyword-bubble-container`);if(!e)return;let t={};g.forEach(e=>{e.keywords?.forEach(e=>t[e]=(t[e]||0)+1)});let n=Object.entries(t).sort((e,t)=>t[1]-e[1]);if(n.length===0){e.innerHTML=`<p style="text-align:center; padding:20px; color:var(--text-3)">아직 집계된 키워드가 없습니다.</p>`;return}let r=n[0][1];e.innerHTML=n.map(([e,t],n)=>{let i=60+t/r*100;return`
      <div class="keyword-bubble" style="width:${i}px; height:${i}px; background: rgba(255, 107, 53, ${.4+t/r*.6}); animation-delay: ${n*.1}s">
        <span class="kw-name">${e}</span>
        <span class="kw-count">${t}회</span>
      </div>
    `}).join(``)}function j(){document.getElementById(`install-btn`)?.addEventListener(`click`,async()=>{if(!u){alert(`이미 설치되어 있거나 현재 브라우저에서 지원하지 않습니다.
브라우저 설정의 "홈 화면에 추가"를 이용해주세요!`);return}u.prompt();let{outcome:e}=await u.userChoice;e===`accepted`&&(u=null,document.getElementById(`install-btn`).style.display=`none`)}),document.getElementById(`share-fab`)?.addEventListener(`click`,()=>{document.getElementById(`share-modal`).style.display=`flex`}),document.getElementById(`copy-url-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(window.location.href),M(`✅ 주소가 복사되었습니다!`),document.getElementById(`share-modal`).style.display=`none`}),document.getElementById(`kakao-btn`)?.addEventListener(`click`,()=>{alert(`카카오톡 공유 기능을 준비 중입니다.
(카카오 개발자 키 설정이 필요합니다)`),document.getElementById(`share-modal`).style.display=`none`}),document.getElementById(`close-share`)?.addEventListener(`click`,()=>{document.getElementById(`share-modal`).style.display=`none`}),document.getElementById(`platform-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`.platform-btn`);t&&(d=t.dataset.plat,document.querySelectorAll(`.platform-btn`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`))}),document.getElementById(`cat-tabs`).addEventListener(`click`,e=>{let t=e.target.closest(`.tab-btn`);if(!t)return;f=t.dataset.cat,document.querySelectorAll(`.tab-btn`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`);let n=document.querySelector(`.promo-meta`);if(n){let e=new Date;n.textContent=`${e.getFullYear()}.${e.getMonth()+1}.${e.getDate()} · ${f} 맞춤 문구`}}),document.getElementById(`star-sel`).addEventListener(`click`,e=>{let t=e.target.closest(`.star-option`);t&&(p=parseInt(t.dataset.star),document.querySelectorAll(`.star-option`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`))}),document.getElementById(`kw-tags`).addEventListener(`click`,e=>{let t=e.target.closest(`.keyword-tag`);if(!t)return;let n=t.dataset.kw;m.has(n)?(m.delete(n),t.classList.remove(`active`)):(m.add(n),t.classList.add(`active`))}),document.getElementById(`gen-btn`).addEventListener(`click`,async()=>{if(h)return;h=!0;let e=document.getElementById(`gen-btn`);e.classList.add(`loading`),e.disabled=!0;let t=document.getElementById(`review-input`).value,n;try{n=await C(d,f,p,t,[...m])}catch(e){n=`[시스템 에러] AI 답변 생성에 실패했습니다.\n사유: ${e.message}\n(API 키가 유효한지 확인해주세요.)`}let r=document.getElementById(`result-card`),i=document.getElementById(`result-text`);i.textContent=n,r.style.display=`block`,setTimeout(()=>r.classList.add(`visible`),10),e.classList.remove(`loading`),e.disabled=!1,h=!1,r.scrollIntoView({behavior:`smooth`,block:`nearest`}),await x({id:Date.now().toString(),platform:d,category:f,star:p,keywords:[...m],reply:n,time:new Date().toISOString()}),k()}),document.getElementById(`copy-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`result-text`).textContent||``;await navigator.clipboard.writeText(e);let t=document.getElementById(`copy-btn`);t.textContent=`✅ 복사됨!`,t.classList.add(`copied`),M(),setTimeout(()=>{t.textContent=`📋 복사`,t.classList.remove(`copied`)},2e3)}),document.getElementById(`promo-gen-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`promo-gen-btn`),t=document.getElementById(`promo-result`);e.textContent=`⏳ 생성 중...`,e.disabled=!0,t.style.opacity=`0.5`;try{t.textContent=await w(f)}catch(e){t.textContent=`[시스템 에러] AI 문구 생성 실패: ${e.message}`}t.style.opacity=`1`,e.textContent=`✨ AI 문구 생성`,e.disabled=!1}),document.getElementById(`promo-copy-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`promo-result`).textContent||``;await navigator.clipboard.writeText(e),M()})}function M(e=`✅ 클립보드에 복사되었습니다!`){let t=document.getElementById(`toast`);t.textContent=e,t.classList.add(`show`),setTimeout(()=>t.classList.remove(`show`),2500)}window.copyText=e=>{let t=g.find(t=>t.id===e);t&&navigator.clipboard.writeText(t.reply).then(()=>M())},window.showToast=M,O();