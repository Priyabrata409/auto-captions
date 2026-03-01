FROM python:3.10-slim

# Install ffmpeg and clean up apt cache
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set up a new user named "user" with user ID 1000
# (Hugging Face Spaces recommends running as a non-root user)
RUN useradd -m -u 1000 user

# Switch to the non-root user
USER user

# Set home to the user's home directory and add local bin to PATH
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory
WORKDIR $HOME/app

# Copy the requirements file and install dependencies
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Whisper base model so it doesn't download on first request
# We do this by running a quick python command that loads the model into cache
RUN python -c "import whisper; whisper.load_model('base')"

# Copy the rest of the application
COPY --chown=user . .

# Ensure the temp_uploads directory exists and is writable
RUN mkdir -p temp_uploads

# Expose the standard Hugging Face Spaces port
EXPOSE 7860

# Command to run the FastAPI application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
