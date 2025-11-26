from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import joinedload
from sqlmodel import Session, select

from src.api.account.api import get_current_admin
from src.database.engine import get_session as get_db
from src.database.models import User, UserSocial
from src.modules.media.media_methods import create_media
from src.modules.storages.storage_methods import upload_file
from src.modules.user.user_methods import (
    ban_user,
    create_user,
    delete_user,
    get_all_users,
    update_user,
)

from .serializer import UserCreate, UserResponse, UserUpdate

router = APIRouter()


@router.post("/users/", response_model=UserResponse)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    user_data = user.model_dump()
    return create_user(db, user_data)


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    statement = (
        select(User)
        .options(joinedload(User.user_settings), joinedload(User.user_social))
        .where(User.id == user_id)
    )
    user = db.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users/username/{username}", response_model=UserResponse)
def get_user_by_username_endpoint(username: str, db: Session = Depends(get_db)):
    statement = (
        select(User)
        .options(joinedload(User.user_settings), joinedload(User.user_social))
        .where(User.username == username)
    )
    user = db.exec(statement).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users/", response_model=List[UserResponse])
def get_all_users_endpoint(
    skip: int = 0,
    limit: int = 100,
    query: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return get_all_users(db, skip, limit, query)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_endpoint(user_id: str, user: UserUpdate, db: Session = Depends(get_db)):
    update_data = {k: v for k, v in user.model_dump().items() if v is not None}
    user_social_data = update_data.pop("user_social", None)

    updated_user = update_user(db, user_id, update_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Handle user_social updates
    if user_social_data:
        statement = select(UserSocial).where(UserSocial.user_id == user_id)
        user_social = db.exec(statement).first()
        if not user_social:
            user_social = UserSocial(user_id=user_id)
            db.add(user_social)

        for key, value in user_social_data.items():
            setattr(user_social, key, value)

        db.commit()

    # Load user with relationships before returning
    statement = (
        select(User)
        .options(joinedload(User.user_settings), joinedload(User.user_social))
        .where(User.id == user_id)
    )
    user_with_relations = db.exec(statement).first()

    return user_with_relations


@router.put("/users/{user_id}/with-file", response_model=UserResponse)
def update_user_with_file_endpoint(
    user_id: str,
    user: str = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    import json

    user_data = json.loads(user)
    user_social_data = user_data.pop("user_social", None)

    updated_user = update_user(db, user_id, user_data)

    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    if file:
        url = upload_file(file)
        media_data = {
            "url": url,
            "post_id": None,
            "user_id": user_id,
        }
        create_media(db, media_data)
        updated_user.avatar_url = url

    # Handle user_social updates
    if user_social_data:
        statement = select(UserSocial).where(UserSocial.user_id == user_id)
        user_social = db.exec(statement).first()
        if not user_social:
            user_social = UserSocial(user_id=user_id)
            db.add(user_social)

        for key, value in user_social_data.items():
            setattr(user_social, key, value)

    db.commit()

    # Load user with relationships before returning
    statement = (
        select(User)
        .options(joinedload(User.user_settings), joinedload(User.user_social))
        .where(User.id == user_id)
    )
    user_with_relations = db.exec(statement).first()

    return user_with_relations


@router.delete("/users/{user_id}")
def delete_user_endpoint(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if not delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


@router.post("/users/{user_id}/ban", response_model=UserResponse)
def ban_user_endpoint(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = ban_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
