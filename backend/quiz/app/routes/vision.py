from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any
from app.services.gemini_service import identify_organ
import io

router = APIRouter(
    prefix="/vision",
    tags=["Vision"]
)

@router.post("/identify")
async def identify_organ_route(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        image_bytes = await file.read()
        mime_type = file.content_type
        
        result = identify_organ(image_bytes, mime_type)
        
        if "error" in result:
            return {"success": False, "message": result["error"]}
            
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        print(f"Vision error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
