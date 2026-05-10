import requests
import json

token = "8633595701:AAGJkKBWOAT6hpL5Cr2kdjubIGwmQVO5zuw"
url = f"https://api.telegram.org/bot{token}/getUpdates"

try:
    response = requests.get(url)
    data = response.json()
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
