import os
import pymupdf4llm
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

async def extract_text_from_pdf(file_path: str) -> str:
    md_text = pymupdf4llm.to_markdown(file_path)
    return md_text

async def generate_summary(text: str) -> str:
    try:
        response = await client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert document summarizer. Provide a structured, concise summary of the document, highlighting the key findings, conclusions, and any important data/tables."
                },
                {"role": "user", "content": f"Please summarize this document:\n\n{text}"}
            ],
            max_tokens=1200
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Помилка при генерації саммарі: {str(e)}"