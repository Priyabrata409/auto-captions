from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import sys

# Add core path to Python path so we can import transcriber
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.transcriber import transcribe

app = FastAPI(title="Video Captioning API")

# Allow requests from our frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def cleanup_files(files_to_delete: list):
    """Background task to delete temporary files after responding to the user"""
    for file_path in files_to_delete:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting temporary file {file_path}: {e}")

@app.post("/transcribe")
async def create_transcription(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: str = Form("base")
):
    print(f"Received file: {file.filename}, model: {model}")
    
    # Save uploaded file temporarily
    temp_file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Transcribe the file
        output_srt_path = transcribe(temp_file_path, model_size=model)
        
        # Add a background task to clean up the files after the response is sent
        background_tasks.add_task(cleanup_files, [temp_file_path, output_srt_path])
        
        # Return the generated .srt file
        return FileResponse(
            path=output_srt_path,
            media_type="application/x-subrip",
            filename=f"captions_{file.filename}.srt",
            headers={"Access-Control-Expose-Headers": "Content-Disposition"}
        )
        
    except Exception as e:
        # Check if files exist to clean them up on error
        cleanup_files([temp_file_path])
        return {"error": str(e)}

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok"}
