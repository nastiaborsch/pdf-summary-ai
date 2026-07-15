import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from app.services import extract_text_from_pdf, generate_summary
app = FastAPI(title="PDF Summary AI")

@app.post("/api/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    #тимчасово
    temp_file_path = f"temp_{file.filename}"

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = await extract_text_from_pdf(temp_file_path)

        summary = await generate_summary(text)

        return {
            "filename": file.filename,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)