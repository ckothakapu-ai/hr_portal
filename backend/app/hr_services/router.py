from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import auth, models as auth_models
from ..candidate_services import models as candidate_models
from . import schemas
from ..database.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/jobs/", response_model=schemas.Job)
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth.get_current_hr_user),
):
    db_job = candidate_models.Job(**job.model_dump(), owner_id=current_user.id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/jobs/{job_id}/applications", response_model=List[schemas.Application])
def read_applications_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth.get_current_hr_user),
):
    applications = db.query(candidate_models.Application).filter(candidate_models.Application.job_id == job_id).all()
    return applications

@router.put("/applications/{application_id}", response_model=schemas.Application)
def update_application_status(
    application_id: int,
    application: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(auth.get_current_hr_user),
):
    db_application = (
        db.query(candidate_models.Application)
        .filter(candidate_models.Application.id == application_id)
        .first()
    )
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")

    db_application.status = application.status
    db.commit()
    db.refresh(db_application)
    return db_application