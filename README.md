---
title: Auto Captions API
emoji: 🎥
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# Local Video & Audio Captioning API

This is a FastAPI backend powered by OpenAI Whisper, deployed on Hugging Face Spaces using Docker.
It is designed to receive media files, extract their audio using ffmpeg, transcribe them using the Whisper base model, and return standard `.srt` subtitles.
