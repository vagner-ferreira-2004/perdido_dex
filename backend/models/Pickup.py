from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base


class Pickup(Base):
    __tablename__ = "pickup"

    id_pickup: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_object: Mapped[int] = mapped_column(
        ForeignKey("object_found.id_object"), unique=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    cpf: Mapped[str] = mapped_column(String(11), nullable=False)
    rg: Mapped[str] = mapped_column(String(20), nullable=False)
    rgm: Mapped[str] = mapped_column(String(20), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    person_photo: Mapped[str] = mapped_column(String(500), nullable=False)
    pickup_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    object_found: Mapped["ObjectFound"] = relationship(back_populates="pickup")
