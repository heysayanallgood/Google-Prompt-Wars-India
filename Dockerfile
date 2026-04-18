FROM python:3.11-slim
WORKDIR /app

# Copy python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code (frontend and backend)
COPY . .

# Cloud Run sets the PORT env variable; expose 8080 as fallback
EXPOSE 8080

# Start FastAPI. We cd into backend so imports like 'from models' just work.
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
