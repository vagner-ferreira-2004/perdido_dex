from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.database import Base


class Location(Base):
    __tablename__ = "location"

    id_location: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    central_place: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    objects_found: Mapped[list["ObjectFound"]] = relationship(back_populates="location")
