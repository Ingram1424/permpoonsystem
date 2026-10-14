FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and folders
COPY api/ ./api/
COPY static/ ./static/
COPY templates/ ./templates/
COPY logo.png ./logo.png
COPY logo_icon.png ./logo_icon.png

# Expose port (default 8000, Railway will override via $PORT)
EXPOSE 8000

# Run the app with uvicorn supporting Railway dynamic $PORT
CMD ["sh", "-c", "uvicorn api.index:app --host 0.0.0.0 --port ${PORT:-8000}"]
