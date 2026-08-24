from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base

if TYPE_CHECKING:
    from .ObjectFound import ObjectFound


class User(Base):
    __tablename__ = "user"

    id_user: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    cpf: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    rgm: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    objects_found: Mapped[list["ObjectFound"]] = relationship(back_populates="user")
