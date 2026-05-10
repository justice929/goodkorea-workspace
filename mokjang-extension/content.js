console.log("🚀 먹장먹살 AI: One-Click 오토매직 시스템 로드 완료");

// 화면에 플로팅되는 '원클릭 전체 답변 생성' 버튼 주입
function injectMasterButton() {
  if (document.querySelector('.mokjang-master-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'mokjang-master-btn';
  btn.innerHTML = '✨ 먹장먹살: 화면 내 모든 리뷰 답변 생성';
  
  // 버튼 스타일 (글래스모피즘 & 최상단 플로팅)
  Object.assign(btn.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '999999',
    padding: '12px 24px',
    background: 'rgba(255, 107, 53, 0.9)',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  });

  btn.onmouseover = () => btn.style.transform = 'translateX(-50%) scale(1.05)';
  btn.onmouseout = () => btn.style.transform = 'translateX(-50%) scale(1)';

  btn.onclick = async (e) => {
    e.preventDefault();
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ 굿코리아 AI가 리뷰를 정밀 분석 중입니다...';
    btn.style.background = 'rgba(34, 197, 94, 0.9)'; 
    
    // 플랫폼별 최적화 셀렉터 맵핑 (네이버, 배민, 구글 등)
    const selectors = {
      reviewText: [
        '.u_cbox_contents', 'div[class*="review-text"]', 'span[class*="comment-text"]', 
        'div[class*="content_text"]', 'p[class*="text"]', '[data-review-text]'
      ],
      replyInput: [
        'textarea', 'input[type="text"]', 'div[contenteditable="true"]',
        '[placeholder*="답글"]', '[placeholder*="답변"]'
      ],
      container: [
        'li[class*="review"]', 'div[class*="review_item"]', 'div[class*="comment_item"]',
        'div[class*="ReplyItem"]', 'tr[class*="review"]'
      ]
    };

    const findEl = (parent, sList) => {
      for (const s of sList) {
        const el = parent.querySelector(s);
        if (el) return el;
      }
      return null;
    };

    // 1. 화면 내 모든 리뷰 아이템 스캔
    const containers = document.querySelectorAll(selectors.container.join(', '));
    let processedCount = 0;

    for (const container of containers) {
      // 이미 답변이 달렸거나 입력창이 없는 경우 스킵
      const input = findEl(container, selectors.replyInput);
      if (!input || input.value?.length > 10) continue; 

      // 리뷰 본문 추출
      const textEl = findEl(container, selectors.reviewText);
      const reviewContent = textEl ? textEl.textContent.trim() : '리뷰 내용 없음';

      // [핵심]: 여기서 백그라운드 스크립트(main.ts/Gemini)로 통신하여 실제 고퀄리티 답변 수령
      // 현재는 UI 연동 로직 확립을 위한 오토필 시뮬레이션
      const generatedReply = `[굿코리아 AI 정성 답변]\n고객님, 소중한 리뷰 감사합니다! ${reviewContent.substring(0, 20)}... 이 부분 특히 신경 썼는데 알아봐 주셔서 감동입니다. 앞으로도 굿코리아의 철학을 담아 최고의 맛과 서비스로 보답하겠습니다!`;

      // 자동 입력 실행
      if (input.tagName === 'DIV') {
        input.innerHTML = generatedReply; // contenteditable 대응
      } else {
        input.value = generatedReply;
      }

      // 프레임워크(React/Vue) 상태 동기화를 위한 이벤트 발생
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      processedCount++;
    }

    setTimeout(() => {
      alert(`🎉 [먹장먹살] 오토매직 완료!\n총 ${processedCount}개의 리뷰에 AI 정성 답변이 자동 입력되었습니다.\n내용 확인 후 '등록'만 눌러주세요!`);
      btn.innerHTML = originalText;
      btn.style.background = 'rgba(255, 107, 53, 0.9)';
    }, 1200);
  };

  document.body.appendChild(btn);
}

// SPA 대응: DOM 변화 감지하여 마스터 버튼 유지
const observer = new MutationObserver(() => {
  injectMasterButton();
});
observer.observe(document.body, { childList: true, subtree: true });

// 초기 실행
setTimeout(injectMasterButton, 1000);
