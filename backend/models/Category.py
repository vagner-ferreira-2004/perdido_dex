from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base

if TYPE_CHECKING:
    from .ObjectFound import ObjectFound


class Category(Base):
    __tablename__ = "category"

    id_category: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    objects_found: Mapped[list["ObjectFound"]] = relationship(back_populates="category")
