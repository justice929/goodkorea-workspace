import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8633595701:AAGJkKBWOAT6hpL5Cr2kdjubIGwmQVO5zuw";
const CHAT_ID = 1397448028;

const bot = new TelegramBot(TOKEN, { polling: false });

bot.sendMessage(CHAT_ID, `🧭 하율입니다, 대표님!
외출 스탠바이 확인했습니다. 
지금부터 팀 전체를 [전사 자율 주행(Autonomous) 모드]로 전환합니다.

🎬 제이 PD가 숏폼 영상(브이로그/화면녹화/경고형)의 음성(TTS) 더빙 및 B롤 소스 수집 백그라운드 작업을 시작했습니다.
의사결정이 필요한 중요 안건(영상 톤앤매너 확정 등)이 발생하면 즉시 이 텔레그램 방으로 브리핑 올리겠습니다.

안전하게 다녀오십시오! 🚗💨`).then(() => {
  console.log("텔레그램 메시지 전송 성공");
  process.exit(0);
}).catch(err => {
  console.error("전송 실패", err);
  process.exit(1);
});
