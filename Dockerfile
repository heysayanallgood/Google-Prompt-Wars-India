FROM python:3.11-slim
WORKDIR /app

# Copy python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code (frontend and backend)
COPY . .

# Cloud Run sets the PORT env variable; expose 8080 as fallback
EXPOSE 8080

# Start FastAPI. We run from root so paths are predictable.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
