from sqlalchemy import Column, Integer, Float, DateTime, String, Boolean
from datetime import datetime
from .database import Base


class WorkerData(Base):
    __tablename__ = "worker_data"

    id = Column(Integer, primary_key=True, index=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)

    name = Column(String, nullable=False)
    job_title = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    location = Column(String, nullable=True)

    hours_worked = Column(Float)
    rating = Column(Float)
    jobs_completed = Column(Integer)
    days_without_break = Column(Integer)
    stress_level = Column(Integer)

    burnout_score = Column(Float)
    risk_level = Column(String)
    
    continue_at_risk = Column(Boolean, default=False)
    extra_work = Column(Integer, default=0)
    extra_payout = Column(Float, default=0.0)