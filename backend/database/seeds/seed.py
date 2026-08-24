from database.database import Session
from models import Category, Location, User


CATEGORIES = ["Cell Phone", "Wallet", "Keys", "Backpack", "Documents", "School Material"]
LOCATIONS = [
    ("Block A", "Corridor in front of room 4"),
    ("Cafeteria", "Next to Lab 5"),
]
TEST_USER = {
    "name": "Development User",
    "cpf": "00000000000",
    "phone": "11999999999",
    "email": "dev@example.com",
    "rgm": "DEV0001",
}


def seedDatabase() -> None:
    with Session.begin() as session:
        for name in CATEGORIES:
            if session.query(Category).filter_by(name=name).first() is None:
                session.add(Category(name=name))
        for central_place, description in LOCATIONS:
            exists = session.query(Location).filter_by(
                central_place=central_place, description=description
            ).first()
            if exists is None:
                session.add(Location(central_place=central_place, description=description))
        if session.query(User).filter_by(email=TEST_USER["email"]).first() is None:
            session.add(User(**TEST_USER))


if __name__ == "__main__":
    seedDatabase()
    print("Development seeds inserted.")
