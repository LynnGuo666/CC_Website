# -*- coding: utf-8 -*-
from sqlalchemy.orm import Session
from typing import Optional
import datetime
import hashlib
import secrets

from passlib.context import CryptContext

from . import models, schemas

_bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2y$")


def _is_legacy_bcrypt(hash_value: str) -> bool:
    """
    判断是否为旧版 bcrypt 格式密码
    传统 bcrypt 哈希以 $2a/$2b/$2y 开头，并包含多个 $ 分隔段。
    """
    return hash_value.startswith(_BCRYPT_PREFIXES) and hash_value.count("$") >= 3

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    # 兼容旧版 bcrypt 存量数据
    if _is_legacy_bcrypt(hashed_password):
        return _bcrypt_context.verify(plain_password, hashed_password)

    # 默认使用 PBKDF2（salt$hash）
    try:
        salt, stored_hash = hashed_password.split('$', 1)
        # 使用相同的 salt 计算 hash
        computed_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return computed_hash == stored_hash
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    # 生成随机 salt
    salt = secrets.token_hex(16)
    # 使用 PBKDF2 计算 hash
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    # 返回 salt$hash 格式
    return f"{salt}${pwd_hash}"


def get_admin_user(db: Session, user_id: int) -> Optional[models.AdminUser]:
    """根据 ID 获取管理员用户"""
    return db.query(models.AdminUser).filter(models.AdminUser.id == user_id).first()


def get_admin_user_by_username(db: Session, username: str) -> Optional[models.AdminUser]:
    """根据用户名获取管理员用户"""
    return db.query(models.AdminUser).filter(models.AdminUser.username == username).first()


def get_admin_user_by_email(db: Session, email: str) -> Optional[models.AdminUser]:
    """根据邮箱获取管理员用户"""
    return db.query(models.AdminUser).filter(models.AdminUser.email == email).first()


def get_admin_user_by_api_key(db: Session, api_key: str) -> Optional[models.AdminUser]:
    """根据 API Key 获取管理员用户"""
    return db.query(models.AdminUser).filter(models.AdminUser.api_key == api_key).first()


def get_admin_users(db: Session, skip: int = 0, limit: int = 100):
    """获取管理员用户列表"""
    return db.query(models.AdminUser).offset(skip).limit(limit).all()


def generate_unique_api_key(db: Session) -> str:
    """生成唯一的 API Key"""
    while True:
        candidate = secrets.token_urlsafe(32)
        if not get_admin_user_by_api_key(db, candidate):
            return candidate


def create_admin_user(db: Session, user: schemas.AdminUserCreate) -> models.AdminUser:
    """创建管理员用户"""
    hashed_password = get_password_hash(user.password)
    api_key_value = user.api_key or generate_unique_api_key(db)
    if user.api_key:
        existing_key_user = get_admin_user_by_api_key(db, user.api_key)
        if existing_key_user:
            raise ValueError("API Key already in use")

    db_user = models.AdminUser(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role,
        api_key=api_key_value,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_admin_user(db: Session, user_id: int, user_update: schemas.AdminUserUpdate) -> Optional[models.AdminUser]:
    """更新管理员用户"""
    db_user = get_admin_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)

    # 如果更新密码，需要加密
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    if "api_key" in update_data:
        new_key = update_data["api_key"]
        if new_key:
            existing_key_user = get_admin_user_by_api_key(db, new_key)
            if existing_key_user and existing_key_user.id != user_id:
                raise ValueError("API Key already in use")
        else:
            new_key = generate_unique_api_key(db)
        update_data["api_key"] = new_key

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db_user.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_admin_user(db: Session, user_id: int) -> bool:
    """删除管理员用户"""
    db_user = get_admin_user(db, user_id)
    if not db_user:
        return False

    db.delete(db_user)
    db.commit()
    return True


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.AdminUser]:
    """验证用户登录"""
    user = get_admin_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None

    # 更新最后登录时间
    user.last_login = datetime.datetime.utcnow()
    db.commit()

    return user
