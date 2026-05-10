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
    btn.innerHTML = '⏳ 화면의 리뷰를 스캔하고 작성 중입니다...';
    btn.style.background = 'rgba(34, 197, 94, 0.9)'; // 녹색
    
    // 1. 화면 내 리뷰 컨테이너 스캔 (배민, 네이버, 요기요 등 범용 셀렉터 패턴)
    const reviewContainers = document.querySelectorAll('div[class*="review"], li[class*="review"], div[class*="comment"]');
    let processedCount = 0;

    for (const container of reviewContainers) {
      // 이미 답변이 달린 리뷰인지 체크 (가상의 로직)
      const hasReply = container.querySelector('textarea, input[type="text"]') !== null;
      if (!hasReply) continue;

      // 리뷰 텍스트 추출
      const reviewTextEl = container.querySelector('p, span[class*="text"], div[class*="content"]');
      const reviewText = reviewTextEl ? reviewTextEl.textContent : '';

      // (실제 서비스에서는 여기서 백그라운드 스크립트를 통해 Gemini API를 호출하여 답변을 받아옵니다)
      // 현재는 UI 동작 검증용 시뮬레이션
      
      // 입력창(Textarea) 찾기 및 자동 입력
      const replyInput = container.querySelector('textarea, input[type="text"]');
      if (replyInput) {
        (replyInput as HTMLTextAreaElement).value = `[먹장먹살 AI 자동생성] 고객님 안녕하세요! 소중한 리뷰 감사합니다. (스캔된 리뷰: ${reviewText?.substring(0,10)}...)`;
        
        // React/Vue 등 프레임워크의 이벤트를 트리거하기 위해 input 이벤트 발생
        replyInput.dispatchEvent(new Event('input', { bubbles: true }));
        replyInput.dispatchEvent(new Event('change', { bubbles: true }));
        processedCount++;
      }
    }

    setTimeout(() => {
      alert(`🎉 먹장먹살 오토매직 완료!\n총 ${processedCount}개의 리뷰에 정성스러운 답변이 자동 입력되었습니다.\n이제 사장님은 '등록' 버튼만 누르시면 됩니다.`);
      btn.innerHTML = originalText;
      btn.style.background = 'rgba(255, 107, 53, 0.9)';
    }, 1500);
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
