from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.modules.config.models import SiteConfig
from app.modules.config.schemas import SiteConfigResponse, SiteConfigUpdate
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/config", response_model=SiteConfigResponse)
def get_config(db: Session = Depends(get_db)):
    config = db.query(SiteConfig).filter(SiteConfig.id == 1).first()
    if not config:
        return SiteConfigResponse()
    return config

@router.put("/admin/config", response_model=SiteConfigResponse)
def update_config(
    config_update: SiteConfigUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_active_user)
):
    config = db.query(SiteConfig).filter(SiteConfig.id == 1).first()
    if not config:
        config = SiteConfig(id=1)
        db.add(config)

    for key, value in config_update.model_dump(exclude_unset=True).items():
        setattr(config, key, value)

    db.commit()
    db.refresh(config)
    return config
