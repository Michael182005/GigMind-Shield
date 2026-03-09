from fastapi import APIRouter

router = APIRouter()

@router.get("/burnout-warning")

def burnout_warning():

    message = {
        "title": "Burnout Risk Alert",
        "message": "Your workload and stress levels are very high. Continuing work may affect your health.",
        "options": [
            "Take a Break",
            "Continue at My Own Risk"
        ]
    }

    return message