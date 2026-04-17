# Build the frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source
# Ensure we don't overwrite node_modules if it exists locally
COPY frontend/ ./

# Fix permissions for the vite binary just in case
RUN chmod +x node_modules/.bin/vite

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

# Start FastAPI
CMD ["sh", "-c", "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
