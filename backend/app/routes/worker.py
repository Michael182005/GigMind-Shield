from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models, schemas
from ..services.burnout_model import predict_burnout
from ..services.nlp_parser import parse_worker_text

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/worker-data")
def create_worker_data(data: schemas.WorkerDataCreate, db: Session = Depends(get_db)):

    worker = models.WorkerData(
        hours_worked=data.hours_worked,
        rating=data.rating,
        jobs_completed=data.jobs_completed,
        days_without_break=data.days_without_break,
        stress_level=data.stress_level,
        burnout_score=0.0
    )

    db.add(worker)
    db.commit()
    db.refresh(worker)

    return {"message": "Worker data stored successfully"}


@router.post("/predict")
def predict(data: schemas.WorkerDataCreate, db: Session = Depends(get_db)):

    burnout_score = predict_burnout(
        data.hours_worked,
        data.rating,
        data.jobs_completed,
        data.days_without_break,
        data.stress_level
    )


    if burnout_score < 0.4:
        risk = "LOW"
    elif burnout_score < 0.7:
        risk = "MEDIUM"
    else:
        risk = "HIGH"

    warning = False
    extra_work = 0
    extra_payout = 0

    SAFE_JOB_LIMIT = 20
    PAY_PER_EXTRA_JOB = 5


    if risk == "HIGH":
        warning = True


    if data.continue_at_risk:
        if data.jobs_completed > SAFE_JOB_LIMIT:
            extra_work = data.jobs_completed - SAFE_JOB_LIMIT
            extra_payout = extra_work * PAY_PER_EXTRA_JOB

    worker = models.WorkerData(
    hours_worked=data.hours_worked,
    rating=data.rating,
    jobs_completed=data.jobs_completed,
    days_without_break=data.days_without_break,
    stress_level=data.stress_level,
    burnout_score=burnout_score,
    risk_level=risk,
    continue_at_risk=data.continue_at_risk,
    extra_work=extra_work,
    extra_payout=extra_payout,


    name=data.name,
    job_title=data.job_title,
    platform=data.platform,
    location=data.location
)

    db.add(worker)
    db.commit()

    return {
        "burnout_score": burnout_score,
        "risk_level": risk,
        "burnout_warning": warning,
        "safe_limit" : SAFE_JOB_LIMIT,
        "extra_work": extra_work,
        "extra_payout": extra_payout
    }
    
    
@router.get("/history")
def get_history(db: Session = Depends(get_db)):

    records = db.query(models.WorkerData).order_by(models.WorkerData.timestamp.desc()).all()

    history = []

    for record in records:
        history.append({
            "timestamp": record.timestamp,
            "burnout_score": record.burnout_score,
            "risk_level": record.risk_level,
            "name": record.name,
            "job_title": record.job_title,
            "platform": record.platform,
            "location": record.location
        })

    return history


@router.get("/recommendation/{score}")
def get_recommendation(score: float):

    recommendations = []

    if score < 0.4:
        recommendations.append("Low burnout risk. Maintain your current work balance.")
    elif score < 0.7:
        recommendations.append("Moderate burnout risk. Consider short breaks during shifts.")
    else:
        recommendations.append("High burnout risk detected. Reduce workload and prioritize rest.")

    return {"recommendations": recommendations}

@router.post("/nlp-parse")
def parse_text_input(data: dict):

    text = data.get("text", "")

    parsed = parse_worker_text(text)

    return {
        "parsed_data": parsed
    }