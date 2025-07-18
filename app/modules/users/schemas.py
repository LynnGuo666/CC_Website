from pydantic import BaseModel


# Shared properties
class UserBase(BaseModel):
    nickname: str
    source: str | None = None


# Properties to receive on user creation
class UserCreate(UserBase):
    pass


# Properties to return to client
class User(UserBase):
    id: int

    class Config:
        orm_mode = True