from fastapi import FastAPI, UploadFile, File, HTTPException

app = FastAPI(
    title="PDF Summary AI",
    description="API for uploading PDFs and generating summaries using OpenAI",
    version="1.0.0"
)

@app.post("/api/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "message": "File received successfully. Ready for parsing in Step 2!"
    }