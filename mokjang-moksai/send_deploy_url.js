import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8633595701:AAGJkKBWOAT6hpL5Cr2kdjubIGwmQVO5zuw";
const CHAT_ID = 1397448028;

const bot = new TelegramBot(TOKEN, { polling: false });

const msg = `🚀 대표님! 굿코리아 '먹장먹살' 공식 배포 주소 보고드립니다!

🔗 접속 주소: 
https://justice929.github.io/goodkorea-workspace/

이제 이 주소로 전 세계 어디서든, 사장님들의 핸드폰에서도 즉시 구동이 가능합니다. 
모바일 홈 화면에 추가하여 '앱'처럼 사용해 보십시오! 🛡️🎯`;

bot.sendMessage(CHAT_ID, msg).then(() => {
  console.log("배포 주소 전송 성공");
  process.exit(0);
}).catch(err => {
  console.error("전송 실패", err);
  process.exit(1);
});
