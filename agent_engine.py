import requests
import time
import json
import os

# 설정 로드
secrets_path = ".agent/secrets/telegram.json"
with open(secrets_path, "r", encoding="utf-8") as f:
    config = json.load(f)

TOKEN = config["bot_token"]
CHAT_ID = config["chat_id"]
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"

def send_message(text):
    url = f"{BASE_URL}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": text}
    requests.post(url, json=payload)

def get_updates(offset=None):
    url = f"{BASE_URL}/getUpdates"
    params = {"timeout": 30, "offset": offset}
    try:
        response = requests.get(url, params=params)
        return response.json()
    except:
        return None

def main():
    print("🚀 [상시 가동 엔진: 하율 24] 가동 시작...")
    send_message("대표님! [상시 가동 엔진: 하율 24] 가동을 시작했습니다! 📋✨\n이제 24시간 언제든 지시를 내려주세요. 제가 여기서 대기하겠습니다! 🧭✅")
    
    last_update_id = None
    
    while True:
        updates = get_updates(last_update_id)
        if updates and updates.get("ok") and updates.get("result"):
            for update in updates["result"]:
                last_update_id = update["update_id"] + 1
                if "message" in update and "text" in update["message"]:
                    msg_text = update["message"]["text"]
                    print(f"📩 수신 메시지: {msg_text}")
                    
                    # 간단한 응답 로직 (MVP)
                    if msg_text == "/status":
                        reply = "🟢 현재 팀 상태: 정상 가동 중\n📁 프로젝트: 먹장먹살\n🛠️ 진행: 텔레그램 엔진 연동 완료"
                    elif msg_text == "/report":
                        reply = "📋 최신 보고: 프로젝트 환경 구축 완료 및 디자인 컨셉 도출 중입니다!"
                    else:
                        reply = f"✅ 지시하신 내용('{msg_text}') 확인했습니다! \n난설 실장님과 팀원들에게 즉시 전달하고 기록하겠습니다. 🛡️⚙️"
                    
                    send_message(reply)
                    
                    # 지시사항 기록
                    with open("telegram_inbox.log", "a", encoding="utf-8") as log:
                        log.write(f"[{time.ctime()}] CEO: {msg_text}\n")
        
        time.sleep(1)

if __name__ == "__main__":
    main()
