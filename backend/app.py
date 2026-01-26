from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from groq import Groq

# .env 파일에서 환경 변수 로드
load_dotenv()

# Flask 애플리케이션 생성
# frontend 디렉토리를 template_folder로 설정
app = Flask(__name__, template_folder='../frontend')

# CORS 설정: 모든 도메인에서 오는 요청을 허용 (개발 초기 단계)
CORS(app)

# Groq API 키 로드
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.")

# Groq 클라이언트 초기화
client = Groq(api_key=GROQ_API_KEY)

# 대상별 프롬프트 정의
PROMPT_TEMPLATES = {
    "boss": "다음 문장을 상사에게 적합한 존댓말과 경어를 사용하여 변환해주세요: ",
    "colleague": "다음 문장을 타팀 동료에게 적합한 중립적이지만 예의바른 업무 말투로 변환해주세요: ",
    "client": "다음 문장을 고객에게 적합한 공식적이고 정중한 비즈니스 어투로 변환해주세요: "
}

# --- Static File Serving ---
@app.route('/')
def index():
    """ frontend/index.html 파일을 렌더링합니다. """
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    """ frontend/css 디렉토리의 파일을 제공합니다. """
    return send_from_directory('../frontend/css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """ frontend/js 디렉토리의 파일을 제공합니다. """
    return send_from_directory('../frontend/js', filename)

@app.route('/favicon.ico')
def favicon():
    """ favicon.ico 파일을 제공합니다. """
    return send_from_directory('../frontend', 'favicon.ico')
# -------------------------

import datetime

@app.route('/api/time')
def get_current_time():
    """ 현재 서버 시간을 반환합니다. """
    now = datetime.datetime.now()
    return jsonify({"currentTime": now.strftime("%Y-%m-%d %H:%M:%S")})


@app.route('/convert', methods=['POST'])
def convert_text():
    data = request.get_json()
    user_text = data.get('text')
    target_audience = data.get('targetAudience')

    if not user_text or not target_audience:
        return jsonify({"error": "텍스트와 변환 대상을 모두 제공해야 합니다."}), 400

    if target_audience not in PROMPT_TEMPLATES:
        return jsonify({"error": "유효하지 않은 변환 대상입니다."}), 400

    system_prompt = "당신은 업무 말투 변환 전문가입니다. 사용자의 요청에 따라 주어진 텍스트를 적절한 업무 어투로 변환합니다. 변환된 텍스트만 출력하며, 추가적인 설명은 포함하지 않습니다."
    user_prompt = PROMPT_TEMPLATES[target_audience] + user_text

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            # model="llama-3.1-8b-instant",
            model="moonshotai/kimi-k2-instruct-0905",
            temperature=0.7,
            max_tokens=1024
        )
        converted_text = chat_completion.choices[0].message.content.strip()
        return jsonify({"convertedText": converted_text})

    except Exception as e:
        app.logger.error(f"Groq API 호출 중 오류 발생: {e}")
        return jsonify({"error": "텍스트 변환 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}), 500

# 이 파일이 직접 실행될 때만 Flask 개발 서버를 실행
if __name__ == '__main__':
    app.run(debug=True)