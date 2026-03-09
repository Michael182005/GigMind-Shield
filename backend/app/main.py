from fastapi import FastAPI
from .database import engine, Base
from . import models
from .routes import worker
from fastapi.middleware.cors import CORSMiddleware
from app.routes import warnings



app = FastAPI(title="GigMind Shield API")

Base.metadata.create_all(bind=engine)

app.include_router(worker.router)

app.include_router(warnings.router)

@app.get("/")
def read_root():
    return {"message": "GigMind Shield Backend Running Successfully"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)