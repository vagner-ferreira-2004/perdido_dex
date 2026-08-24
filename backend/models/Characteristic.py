from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base

if TYPE_CHECKING:
    from .ObjectFound import ObjectFound


class Characteristic(Base):
    __tablename__ = "characteristic"

    id_characteristic: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_object: Mapped[int] = mapped_column(
        ForeignKey("object_found.id_object"), unique=True, nullable=False
    )
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    object_found: Mapped["ObjectFound"] = relationship(back_populates="characteristic")
