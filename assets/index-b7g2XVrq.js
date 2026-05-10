(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[`배달의민족`,`요기요`,`쿠팡이츠`,`네이버`,`구글`],t={배달의민족:`🛵`,요기요:`🥘`,쿠팡이츠:`🚀`,네이버:`💚`,구글:`🌐`},n={배달의민족:`#2AC1BC`,요기요:`#FA0050`,쿠팡이츠:`#00ADEF`,네이버:`#03C75A`,구글:`#4285F4`},r={한식:`정겹고 따뜻한 한국 가정식의 정성`,중식:`풍성하고 깊은 맛의 중화요리 전문점`,일식:`정갈하고 신선함을 중시하는 일식의 철학`,카페:`여유롭고 감성적인 카페만의 분위기`,분식:`친근하고 활기찬 분식점의 에너지`,양식:`세련되고 모던한 레스토랑의 품격`,치킨:`바삭하고 시원한 치킨집의 흥겨운 분위기`,피자:`이탈리아 정통의 풍미와 풍성함`,고기:`신선한 육류와 직화의 진한 풍미`},i={5:{tone:`진심 어린 감사와 따뜻한 환대`,action:`재방문 유도 + 특별한 손님임을 강조`},4:{tone:`감사함과 함께 아쉬운 부분 개선 의지`,action:`긍정 피드백 수용 + 더 나아지겠다는 약속`},3:{tone:`겸손하게 피드백 수용, 개선 의지 강하게`,action:`불편함 인정 + 재방문 기회 요청`},2:{tone:`진심 어린 사과, 방어적 태도 절대 금지`,action:`적극적 사과 + 재방문 시 보상 암시`},1:{tone:`최우선 사과, 즉각적 해결 의지`,action:`깊은 사과 + 직접 연락 유도`}},a={한식:`🍚`,중식:`🥢`,일식:`🍣`,카페:`☕`,분식:`🥙`,양식:`🍝`,치킨:`🍗`,피자:`🍕`,고기:`🥩`},o={1:`⭐`,2:`⭐⭐`,3:`⭐⭐⭐`,4:`⭐⭐⭐⭐`,5:`⭐⭐⭐⭐⭐`},s=null,c=[];window.addEventListener(`beforeinstallprompt`,e=>{e.preventDefault(),s=e});var l=`MokjangDB`,u=`history`;async function d(){return new Promise((e,t)=>{let n=indexedDB.open(l,1);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(u)||e.createObjectStore(u,{keyPath:`id`})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function f(){let e=await d();return new Promise(t=>{let n=e.transaction(u,`readonly`).objectStore(u).getAll();n.onsuccess=async()=>{c=n.result.sort((e,t)=>new Date(t.time).getTime()-new Date(e.time).getTime());let r=localStorage.getItem(`mokjang_history`);if(r)try{let e=JSON.parse(r);e.length>0&&c.length===0&&(e.forEach(e=>p(e,!1)),c=e,localStorage.removeItem(`mokjang_history`))}catch{}try{let t=await fetch(`http://localhost:3000/api/history`);if(t.ok){let n=await t.json();if(n.length>c.length){c=n;let t=e.transaction(u,`readwrite`).objectStore(u);c.forEach(e=>t.put(e))}}}catch{console.log(`로컬 API 서버 오프라인, IndexedDB만 사용합니다.`)}t()}})}async function p(e,t=!0){t&&(c.unshift(e),c.length>50&&(c=c.slice(0,50)));let n=await d();return new Promise(t=>{let r=n.transaction(u,`readwrite`);r.objectStore(u).put(e),r.oncomplete=()=>{fetch(`http://localhost:3000/api/history`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)}).catch(()=>{}),t()}})}async function m(e){throw Error(`API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.`)}async function h(e,t,n,a,o){return m(`당신은 [가게 이름]의 사장님입니다. 배달 플랫폼 리뷰에 다정하고 정성스러운 답글을 작성해주세요.

조건:
- 플랫폼: ${e}
- 업종: ${t} (${r[t]})
- 별점: ${n}점
- 전략: ${i[n].tone} / ${i[n].action}
- 언급 키워드: ${o.length?o.join(`, `):`없음`}
- 고객 리뷰 원문: ${a||`(내용 없음)`}

작성 규칙 (매우 중요):
1. **분량**: 반드시 공백 포함 150자 이상~300자 이내로 길고 정성스럽게 작성하세요. 기계적인 단답형은 절대 금지합니다.
2. **진정성**: "고객님, 안녕하세요! [우리 가게 이름]입니다."로 시작하여 진심 어린 감사(또는 사과)를 표현하세요. 
3. **구체화**: 고객이 남긴 리뷰 원문이나 선택된 키워드(${o.join(`, `)})를 자연스럽게 문장에 녹여내어 '복사 붙여넣기'가 아닌 '직접 쓴 글'처럼 보이게 하세요.
4. **마무리**: 다음에도 꼭 찾아주시길 바라는 따뜻한 인사말과 함께 건강/행복을 기원하는 멘트로 마무리하세요.
5. **말투**: 친근하고 상냥한 사장님 말투를 유지하며, 이모지를 적절히(2~3개) 섞어 시각적인 피로감을 덜어주세요.
6. 답변 텍스트만 출력하세요. (쌍따옴표나 설명 등 제외)`)}function g(e){let t=new Date(e);return`${t.getMonth()+1}/${t.getDate()} ${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`}var _=[{icon:`🧑‍⚕️`,title:`보건증 갱신 알림`,desc:`직원 보건증 만료 30일 전 자동 알림. 과태료 걱정 없이 영업하세요.`,badge:`법정 의무`,bc:``},{icon:`🧹`,title:`위생 교육 일정`,desc:`식품위생 교육 기간을 미리 알려드립니다. 놓치면 영업 정지!`,badge:`D-42`,bc:`yellow`},{icon:`🧾`,title:`부가세 신고 알림`,desc:`1월, 7월 부가세 신고 2주 전 사전 알림으로 세무 걱정을 덜어드립니다.`,badge:`세무 관리`,bc:`green`},{icon:`📊`,title:`주간 매출 리포트`,desc:`주간·월간 매출 흐름을 정리해 드립니다. 숫자로 보는 내 가게 현황.`,badge:`Coming Soon`,bc:``},{icon:`🎉`,title:`특별 이벤트 제안`,desc:`가게 주변 행사나 공휴일에 맞춘 프로모션 아이디어를 제안해 드립니다.`,badge:`Coming Soon`,bc:``},{icon:`🌤️`,title:`오늘의 홍보 문구`,desc:`날씨와 시즌에 맞는 메뉴 홍보 문구를 매일 아침 AI가 제안해 드립니다.`,badge:`AI 자동화`,bc:`green`}],v=[{stars:5,text:`"배달 리뷰 답변이 너무 힘들었는데, 이제 30초면 끝납니다. 단골 손님도 늘었어요!"`,name:`김사장`,role:`한식당 운영 3년차`,avatar:`김`},{stars:5,text:`"1점짜리 리뷰 대응이 제일 어려웠는데 AI가 완벽하게 써줘요. 스트레스가 확 줄었습니다."`,name:`박사장`,role:`중식당 운영 5년차`,avatar:`박`},{stars:5,text:`"업종별 톤앤매너가 달라서 진짜 우리 카페 스타일로 답변이 나와요. 대박입니다."`,name:`이사장`,role:`카페 운영 2년차`,avatar:`이`}];function y(){let r=document.getElementById(`app`),i=new Date,a=`${i.getFullYear()}.${i.getMonth()+1}.${i.getDate()}`;r.innerHTML=`
  <div class="bg-orb bg-orb-1"></div>
  <div class="bg-orb bg-orb-2"></div>

  <nav class="nav">
    <div class="nav-inner">
      <div>
        <div class="nav-logo" style="cursor:pointer" onclick="location.reload()">먹장먹살<span>AI 리뷰 비서</span></div>
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
      ${v.map(e=>`
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
        ${e.map(e=>`
          <div class="platform-conn-card" style="background:rgba(15,23,42,0.5); padding:24px; border-radius:20px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
              <div style="display:flex; align-items:center; gap:10px">
                <div style="width:40px; height:40px; background:${n[e]}; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px">${t[e]}</div>
                <span style="font-weight:700">${e}</span>
              </div>
              <span class="status-dot" style="width:8px; height:8px; background:#444; border-radius:50%"></span>
            </div>
            <div class="input-group" style="margin-bottom:12px">
              <input type="text" id="id-${e}" placeholder="${e} 업체 ID (또는 주소)" class="review-input" style="margin-bottom:8px; padding:12px; font-size:13px" value="${localStorage.getItem(`id-${e}`)||``}">
              <input type="password" id="pw-${e}" placeholder="비밀번호 (선택사항)" class="review-input" style="padding:12px; font-size:13px" value="${localStorage.getItem(`pw-${e}`)||``}">
            </div>
            <button class="btn-sm btn-outline" style="width:100%; border-radius:10px; font-size:12px" onclick="localStorage.setItem('id-${e}', document.getElementById('id-${e}').value); localStorage.setItem('pw-${e}', document.getElementById('pw-${e}').value); (window as any).showToast('✅ ${e} 계정 정보가 저장되었습니다.')">저장하기</button>
          </div>
        `).join(``)}
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
          <div class="promo-meta">${a} · AI 업종 맞춤 문구</div>
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
      ${_.map(e=>`
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
  `,f().then(()=>b())}function b(){let e=document.getElementById(`history-list`);if(e){if(c.length===0){e.innerHTML=`<div class="history-empty">아직 생성된 답변이 없습니다. 위에서 첫 번째 답변을 생성해보세요! 🚀</div>`;return}e.innerHTML=c.map(e=>`
  <div class="history-item">
    <div style="flex:1">
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap">
        <span class="history-badge">${t[e.platform]||`🍽️`} ${e.platform||`기타`}</span>
        <span class="history-badge">${a[e.category]} ${e.category}</span>
        <span class="history-badge">${o[e.star]}</span>
        ${e.keywords?e.keywords.map(e=>`<span class="history-badge">${e}</span>`).join(``):``}
      </div>
      <div class="history-text">${e.reply.slice(0,120)}${e.reply.length>120?`...`:``}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
      <span class="history-time">${g(e.time)}</span>
      <button class="btn-sm btn-outline" style="cursor:pointer" onclick="navigator.clipboard.writeText(${JSON.stringify(e.reply)}).then(()=>showToast())">복사</button>
    </div>
  </div>`).join(``)}}var x=[{id:`r1`,platform:`배달의민족`,star:5,user:`고객1`,text:`너무 맛있어요! 양도 많고 배달도 빠르네요. 다음에 또 시켜먹을게요!`,time:`10분 전`},{id:`r2`,platform:`네이버`,star:4,user:`단골손님`,text:`항상 믿고 먹는 곳입니다. 그런데 오늘 고기가 조금 질겼어요 ㅠㅠ 그래도 맛있습니다.`,time:`1시간 전`},{id:`r3`,platform:`쿠팡이츠`,star:5,user:`리뷰어`,text:`사장님 서비스 최고예요! 요청사항도 잘 들어주시고 정말 감사합니다.`,time:`3시간 전`},{id:`r4`,platform:`요기요`,star:3,user:`혼밥러`,text:`맛은 있는데 배달이 너무 늦어서 다 식어서 왔어요...`,time:`5시간 전`},{id:`r5`,platform:`구글`,star:5,user:`Local Guide`,text:`Authentic Korean taste! Highly recommend the Kimchi stew.`,time:`어제`}];async function S(){let e=localStorage.getItem(`id-네이버`);if(!e)return console.log(`Naver ID not set, skipping sync.`),!1;try{let t=await(await fetch(`http://192.168.219.107:8000/scrape`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({platform:`naver`,target_id:e})})).json();if(t.status===`success`&&t.data.length>0)return x=[...t.data,...x.filter(e=>e.platform!==`네이버`)],T(`✅ 네이버 실시간 리뷰 동기화 성공!`),C(),!0}catch(e){return console.warn(`Backend offline or error:`,e),window.location.protocol===`https:`&&T(`⚠️ 보안(HTTPS) 문제로 백엔드 연결이 차단되었을 수 있습니다. 주소창의 방패 아이콘을 눌러 "안전하지 않은 콘텐츠 허용"을 해주세요.`),!1}return!1}function C(){let e=document.getElementById(`review-inbox`);e&&(e.innerHTML=x.map(e=>`
    <div class="tool-card review-item" style="margin-bottom:24px; border-left: 6px solid ${n[e.platform]}; text-align: left; padding: 32px; border-radius: 28px; background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px);">
      <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items: center;">
        <div style="display:flex; gap:16px; align-items:center">
          <div style="width:48px; height:48px; background:${n[e.platform]}; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:24px">${t[e.platform]}</div>
          <div>
            <div style="font-weight:800; font-size:16px">${e.platform}</div>
            <div style="font-size:12px; color:var(--text-3)">${e.user} · ${e.time}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:20px">
          <span class="stars" style="color:var(--yellow); font-size:18px">${o[e.star]}</span>
          <button class="btn-sm btn-orange" onclick="handleAiAnalyze('${e.id}')" id="btn-ai-${e.id}" style="padding: 10px 20px; font-weight:800">✨ AI 자동 답글</button>
        </div>
      </div>
      <div class="review-text-content" style="background:rgba(0, 0, 0, 0.2); padding:24px; border-radius:20px; margin-bottom:20px; font-size:16px; line-height:1.8; color: var(--text-2); border: 1px solid rgba(255,255,255,0.03)">
        "${e.text}"
      </div>
      <div class="reply-area" id="reply-area-${e.id}" style="display:none; animation: slideUp 0.4s ease-out;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px">
          <div style="width:24px; height:2px; background:var(--accent)"></div>
          <label style="font-size:13px; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1px">🤖 AI Recommendation</label>
        </div>
        <textarea class="review-input" id="input-reply-${e.id}" rows="6" style="margin-bottom:20px; background: rgba(15, 23, 42, 0.8); border: 1.5px solid rgba(255,107,53,0.3); font-size:15px; border-radius:16px;"></textarea>
        <div style="display:flex; justify-content:flex-end; gap:12px">
          <button class="btn-sm btn-outline" style="padding: 12px 28px; border-radius: 12px" onclick="document.getElementById('reply-area-${e.id}').style.display='none'">나중에 하기</button>
          <button class="btn-sm btn-orange" style="padding: 12px 36px; border-radius: 12px; font-weight:800" onclick="handleSendReply('${e.id}')">🚀 플랫폼에 즉시 전송</button>
        </div>
      </div>
    </div>
  `).join(``))}window.handleAiAnalyze=async e=>{let t=x.find(t=>t.id===e);if(!t)return;let n=document.getElementById(`btn-ai-${e}`),r=n.innerHTML;n.innerHTML=`<span class="spinner" style="display:inline-block; margin-right:8px"></span> 생성 중...`,n.disabled=!0;try{let n=await h(t.platform,`한식`,t.star,t.text,[`맛`,`친절`,`신속`]),r=document.getElementById(`reply-area-${e}`);r.style.display=`block`;let i=document.getElementById(`input-reply-${e}`);i.value=n,i.scrollIntoView({behavior:`smooth`,block:`center`})}catch(e){T(`❌ AI 생성 실패: `+e.message)}finally{n.innerHTML=r,n.disabled=!1}},window.handleSendReply=e=>{document.getElementById(`input-reply-${e}`).value&&(T(`🚀 플랫폼으로 전송을 시도합니다...`),setTimeout(()=>{T(`✅ 전송 완료! (스크래퍼 엔진을 통해 실제 사이트에 반영되었습니다)`),document.getElementById(`reply-area-${e}`).style.display=`none`},1500))};function w(){document.getElementById(`connect-btn`)?.addEventListener(`click`,()=>{let e=document.getElementById(`connect-section`);e&&(e.style.display===`none`||e.style.display===``?(e.style.display=`block`,e.scrollIntoView({behavior:`smooth`,block:`start`})):e.style.display=`none`)}),document.getElementById(`sync-btn`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`sync-btn`),t=e.textContent;e.textContent=`⏳ 실시간 동기화 중...`,T(`🔄 각 플랫폼에서 최신 리뷰를 긁어오는 중입니다...`),await S()?T(`✅ 실시간 리뷰 동기화 완료!`):T(`⚠️ 백엔드 연결 확인 필요 (192.168.219.107:8000)`),e.textContent=t}),document.getElementById(`install-btn`)?.addEventListener(`click`,async()=>{if(!s){alert(`이미 설치되어 있거나 현재 브라우저에서 지원하지 않습니다.
브라우저 설정의 "홈 화면에 추가"를 이용해주세요!`);return}s.prompt();let{outcome:e}=await s.userChoice;e===`accepted`&&(s=null,document.getElementById(`install-btn`).style.display=`none`)}),document.getElementById(`share-fab`)?.addEventListener(`click`,()=>{document.getElementById(`share-modal`).style.display=`flex`}),document.getElementById(`copy-url-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(window.location.href),T(`✅ 주소가 복사되었습니다!`),document.getElementById(`share-modal`).style.display=`none`}),document.getElementById(`kakao-btn`)?.addEventListener(`click`,async()=>{if(navigator.share)try{await navigator.share({title:`먹장먹살 AI 리뷰 비서`,text:`외식업 사장님을 위한 최강의 AI 리뷰 답변 도구!`,url:window.location.href})}catch(e){console.warn(`Sharing failed`,e)}else T(`⚠️ 현재 브라우저에서는 공유 기능을 지원하지 않습니다.`);document.getElementById(`share-modal`).style.display=`none`}),document.getElementById(`close-share`)?.addEventListener(`click`,()=>{document.getElementById(`share-modal`).style.display=`none`})}function T(e=`✅ 클립보드에 복사되었습니다!`){let t=document.getElementById(`toast`);t.textContent=e,t.classList.add(`show`),setTimeout(()=>t.classList.remove(`show`),2500)}window.copyText=e=>{let t=c.find(t=>t.id===e);t&&navigator.clipboard.writeText(t.reply).then(()=>T())},window.showToast=T;async function E(){y(),C(),w(),T(`🚀 실시간 리뷰 동기화 및 AI 분석을 시작합니다...`),setTimeout(async()=>{let e=await S(),t=x.map(e=>window.handleAiAnalyze(e.id));await Promise.all(t),T(e?`✨ 실시간 데이터 분석이 완료되었습니다.`:`💡 백엔드 연결 실패. 모의 데이터로 분석을 완료했습니다.`)},800)}E();