console.log("🚀 먹장먹살 AI: Background Service Worker 가동 중");

chrome.runtime.onInstalled.addListener(() => {
  console.log("먹장먹살 익스텐션이 설치되었습니다.");
});
