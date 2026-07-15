import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.services import extract_text_from_pdf, generate_summary
from app.models import SessionLocal, DocumentHistory

app = FastAPI(title="PDF Summary AI API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/summarize")
async def summarize_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    temp_file_path = f"temp_{file.filename}"

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = await extract_text_from_pdf(temp_file_path)
        summary = await generate_summary(text)

        db_record = DocumentHistory(filename=file.filename, summary=summary)
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        return {
            "id": db_record.id,
            "filename": db_record.filename,
            "summary": db_record.summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(DocumentHistory).order_by(DocumentHistory.created_at.desc()).limit(5).all()
    return history