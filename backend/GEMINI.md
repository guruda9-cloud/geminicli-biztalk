# 프로젝트: Vibe 코딩 백엔드

## 프로젝트 개요

이 프로젝트는 텍스트 변환 서비스를 제공하도록 설계된 Flask 기반 백엔드 애플리케이션입니다. 주요 기능은 Groq API의 언어 모델 기능을 사용하여 사용자가 제공한 텍스트를 다양한 전문적인 어조(예: 상사, 동료 또는 고객에게 적합한 어조)로 변환하는 것입니다. 이 애플리케이션은 해당 프런트엔드를 위한 정적 파일도 제공하므로, 이 백엔드가 상위 디렉토리에 있는 사용자 인터페이스의 API 및 콘텐츠 서버 역할을 하는 풀스택 아키텍처를 의미합니다.

## 사용 기술

*   **백엔드 프레임워크:** Python (Flask)
*   **API 통합:** Groq API 클라이언트 (대규모 언어 모델 추론용)
*   **환경 관리:** `python-dotenv` (API 키와 같은 환경 변수 로드용)
*   **CORS 관리:** `flask-cors`
*   **의존성 관리:** `requirements.txt`

## 아키텍처

이 프로젝트의 핵심은 `app.py` Flask 애플리케이션입니다.
다음 엔드포인트를 노출합니다:

*   `/`: `../frontend` 디렉토리의 `index.html` 파일을 제공합니다.
*   `/css/<path:filename>`: `../frontend/css`에서 CSS 파일을 제공합니다.
*   `/js/<path:filename>`: `../frontend/js`에서 JavaScript 파일을 제공합니다.
*   `/favicon.ico`: `../frontend`에서 파비콘을 제공합니다.
*   `/api/time`: 현재 서버 시간을 JSON 객체로 반환합니다.
*   `/convert` (POST): 주요 API 엔드포인트입니다. `text`(사용자 입력) 및 `targetAudience`(예: "boss", "colleague", "client")를 포함하는 JSON 페이로드를 허용합니다. 그런 다음 미리 정의된 템플릿을 사용하여 프롬프트를 구성하고 Groq API로 보냅니다. Groq에서 받은 변환된 텍스트는 JSON 응답으로 반환됩니다.

애플리케이션은 Groq API로 인증하는 데 중요한 `.env` 파일에서 `GROQ_API_KEY`를 로드합니다.

## 빌드 및 실행

### 필수 구성 요소

*   Python 3.x
*   `backend` 디렉토리의 루트에 `GROQ_API_KEY`가 포함된 `.env` 파일.
    `.env` 파일 예시:
    ```
    GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
    ```

### 설정

1.  **의존성 설치:**
    `backend` 디렉토리로 이동하여 필요한 Python 패키지를 설치합니다:
    ```bash
    pip install -r requirements.txt
    ```

### 애플리케이션 실행

1.  **Flask 서버 시작:**
    `backend` 디렉토리에서 다음을 실행합니다:
    ```bash
    python app.py
    ```
    애플리케이션은 일반적으로 디버그 모드에서 `http://127.0.0.1:5000` (또는 `localhost:5000`)으로 실행됩니다.

## 개발 규칙

*   환경 변수는 `.env` 파일을 통해 관리되며 `python-dotenv`를 사용하여 로드됩니다.
*   CORS는 개발 유연성을 위해 전역적으로 활성화됩니다.
*   누락된 API 키 및 Groq API 통신 중 발생하는 문제에 대한 오류 처리가 구현되어 있습니다.
*   API 호출 중 오류를 캡처하기 위해 로깅이 사용됩니다.

## 테스트

*   **API 엔드포인트:**
    `curl`, Postman과 같은 도구를 사용하거나 프런트엔드 애플리케이션(사용 가능한 경우)과 상호 작용하여 `/convert` 엔드포인트를 테스트할 수 있습니다.
    `/convert`에 대한 `curl` 명령 예시:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"text": "안녕하세요", "targetAudience": "boss"}' http://127.0.0.1:5000/convert
    ```

    `/api/time`에 대한 `curl` 명령 예시:
    ```bash
    curl http://127.0.0.1:5000/api/time
    ```

(TODO: 이 백엔드와 관련된 프런트엔드 애플리케이션이 있는 경우 실행 지침을 추가합니다.)

### .env 파일은 수정하지 마세요.
### 내용은 수정하고 git commit 하기 전에 먼저 내용 물어보기