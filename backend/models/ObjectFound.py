from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base


class ObjectFound(Base):
    __tablename__ = "object_found"

    id_object: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), nullable=False)
    id_category: Mapped[int] = mapped_column(ForeignKey("category.id_category"), nullable=False)
    id_location: Mapped[int] = mapped_column(ForeignKey("location.id_location"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    found_date: Mapped[date] = mapped_column(Date, nullable=False)

    user: Mapped["User"] = relationship(back_populates="objects_found")
    category: Mapped["Category"] = relationship(back_populates="objects_found")
    location: Mapped["Location"] = relationship(back_populates="objects_found")
    characteristic: Mapped["Characteristic"] = relationship(
        back_populates="object_found", uselist=False
    )
    photo: Mapped["Photo"] = relationship(back_populates="object_found", uselist=False)
    pickup: Mapped[Optional["Pickup"]] = relationship(back_populates="object_found", uselist=False)
