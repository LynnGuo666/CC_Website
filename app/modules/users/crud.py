from sqlalchemy.orm import Session

from . import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    """Get or Create a user."""
    db_user = db.query(models.User).filter(models.User.nickname == user.nickname).first()
    if db_user:
        return db_user
    db_user = models.User(nickname=user.nickname, source=user.source)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user