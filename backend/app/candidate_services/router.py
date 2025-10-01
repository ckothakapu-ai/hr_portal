from typing import List
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from ..auth import auth, models as auth_models
from . import models, schemas
from ..database.database import SessionLocal
import shutil

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/jobs/", response_model=List[schemas.Job])
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = db.query(models.Job).offset(skip).limit(limit).all()
    return jobs

@router.post("/jobs/{job_id}/apply", response_model=schemas.Application)
def apply_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth.get_current_user),
):
    db_job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")

    db_application = models.Application(job_id=job_id, candidate_id=current_user.id)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth.get_current_user),
):

    upload_dir = "documents"
    os.makedirs(upload_dir, exist_ok=True)
    file_location = os.path.join(upload_dir, file.filename)

    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    db_document = models.Document(
        file_name=file.filename,
        file_path=file_location,
        owner_id=current_user.id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return {"info": f"file '{file.filename}' stored at '{file_location}'"}