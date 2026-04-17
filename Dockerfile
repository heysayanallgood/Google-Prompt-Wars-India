# Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend source and build it
COPY frontend/ ./
RUN npm run build

# Build the backend and final image
FROM python:3.11-slim
WORKDIR /app

# Copy python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Cloud Run sets the PORT env variable; expose 8080 as fallback
EXPOSE 8080

# Start FastAPI. We cd into backend directory so imports resolve properly
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
