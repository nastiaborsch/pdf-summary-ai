import asyncio
import pymupdf4llm

async def extract_text_from_pdf(file_path: str) -> str:
    md_text = pymupdf4llm.to_markdown(file_path)
    return md_text

async def generate_summary(text: str) -> str:
    """тимчасово"""
    await asyncio.sleep(2)

    return (
        f"Документ успішно розпарсено!Перші 100 символів тексту: {text[:100]}..."
    )