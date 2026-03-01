import argparse
import os
import whisper
from datetime import timedelta

def format_timestamp(seconds: float) -> str:
    """Convert seconds to SRT timestamp format (HH:MM:SS,mmm)"""
    td = timedelta(seconds=seconds)
    hours = td.seconds // 3600
    minutes = (td.seconds % 3600) // 60
    secs = td.seconds % 60
    milliseconds = int(td.microseconds / 1000)
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

def generate_srt(segments: list, output_path: str):
    """Generate .srt file from whisper segments"""
    with open(output_path, "w", encoding="utf-8") as f:
        for i, segment in enumerate(segments, start=1):
            start_time = format_timestamp(segment['start'])
            end_time = format_timestamp(segment['end'])
            text = segment['text'].strip()
            
            f.write(f"{i}\n")
            f.write(f"{start_time} --> {end_time}\n")
            f.write(f"{text}\n\n")
            
def transcribe(file_path: str, model_size: str = "base"):
    """Transcribe audio/video file and generate SRT"""
    print(f"Loading Whisper model: '{model_size}'...")
    model = whisper.load_model(model_size)
    
    print(f"Transcribing '{file_path}'...")
    # fp16=False is safer for CPU execution if no GPU is available
    result = model.transcribe(file_path, fp16=False)
    
    # Generate output path
    base_name = os.path.splitext(file_path)[0]
    output_path = f"{base_name}.srt"
    
    print(f"Generating subtitles: '{output_path}'...")
    generate_srt(result["segments"], output_path)
    
    print("Done!")
    return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Transcribe audio/video and generate output.srt")
    parser.add_argument("file", help="Path to the audio or video file")
    parser.add_argument("--model", default="base", choices=["tiny", "base", "small", "medium", "large"], help="Whisper model size")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File '{args.file}' not found.")
        exit(1)
        
    transcribe(args.file, args.model)
