from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_db
from app.modules.config.models import SiteConfig
from app.modules.config.schemas import SiteConfigResponse, SiteConfigUpdate
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/config", response_model=SiteConfigResponse)
async def get_config(db: AsyncSession = Depends(get_db)):
    config = await db.run_sync(lambda sync_db: sync_db.query(SiteConfig).filter(SiteConfig.id == 1).first())
    if not config:
        return SiteConfigResponse()
    return config

@router.put("/admin/config", response_model=SiteConfigResponse)
async def update_config(
    config_update: SiteConfigUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_user)
):
    def _update(sync_db):
        config = sync_db.query(SiteConfig).filter(SiteConfig.id == 1).first()
        if not config:
            config = SiteConfig(id=1)
            sync_db.add(config)

        for key, value in config_update.model_dump(exclude_unset=True).items():
            setattr(config, key, value)

        sync_db.commit()
        sync_db.refresh(config)
        return config

    return await db.run_sync(_update)
