# Docker로 vibe_coding 실행하기

이 프로젝트는 `C:\workspace_ai\vibe_coding` 에서 Docker로 실행됩니다.

## 사전 요건

- Docker Desktop 설치 및 실행 중
- 프로젝트 루트에 `.env` 파일이 있고, `GROQ_API_KEY` 가 설정되어 있어야 함

## 실행 방법

1. 터미널에서 프로젝트 폴더로 이동:
   ```powershell
   cd C:\workspace_ai\vibe_coding
   ```

2. Docker Compose로 빌드 및 실행:
   ```powershell
   docker compose up --build
   ```

3. 브라우저에서 접속:
   - http://localhost:5000

## 백그라운드 실행

```powershell
docker compose up -d --build
```

## 중지

```powershell
docker compose down
```

## .env 없을 때

`.env` 가 없으면 `backend\.env.example` 을 참고해 프로젝트 루트에 `.env` 를 만들고 `GROQ_API_KEY` 를 넣어 주세요.

## `docker` / qwen에서 "docker"를 찾지 못할 때

이 폴더의 `docker.cmd`를 쓰면 `docker compose` 는 동작합니다. **qwen**처럼 다른 프로그램이 `docker` 를 부를 때는 시스템 PATH에 Docker가 있어야 합니다.

**같은 터미널에서 바로 반영하려면** (PowerShell):
```powershell
$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path
```

**cmd**:
```cmd
set "PATH=C:\Program Files\Docker\Docker\resources\bin;%PATH%"
```

위 명령을 실행한 뒤 그 터미널에서 `docker --version`, `qwen` 등을 다시 실행해 보세요. 영구 적용을 원하면 Cursor를 완전히 끄고 다시 실행한 뒤 새 터미널을 여세요.
