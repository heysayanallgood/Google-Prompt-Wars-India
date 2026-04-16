# Run on Google Cloud Run
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code (frontend and backend)
COPY . .

# Cloud Run sets the PORT env variable; expose 8080 as a fallback
EXPOSE 8080

# Start FastAPI. We cd into backend directory so imports resolve properly
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
