from pydantic import BaseModel
from typing import Optional


class WorkerDataCreate(BaseModel):

    name: str
    job_title: Optional[str] = None
    platform: Optional[str] = None
    location: Optional[str] = None

    hours_worked: float
    rating: float
    jobs_completed: int
    days_without_break: int
    stress_level: int
    continue_at_risk: bool = False