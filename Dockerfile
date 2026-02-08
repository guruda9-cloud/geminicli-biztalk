# vibe_coding - Flask backend + frontend
FROM python:3.12-slim

WORKDIR /app

# Copy backend and frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /app/backend

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV FLASK_APP=app.py
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
