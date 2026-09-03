"""create initial tables

Revision ID: 0001_create_initial_tables
Revises:
Create Date: 2026-08-23
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_create_initial_tables"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "role",
        sa.Column("id_role", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id_role"),
        sa.UniqueConstraint("name"),
    )
    op.bulk_insert(
        sa.table("role", sa.column("name", sa.String(length=50))),
        [{"name": "common"}, {"name": "admin"}],
    )
    op.create_table(
        "profile",
        sa.Column("id_profile", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id_profile"),
        sa.UniqueConstraint("name"),
    )
    op.bulk_insert(
        sa.table(
            "profile",
            sa.column("name", sa.String(length=50)),
            sa.column("display_name", sa.String(length=100)),
        ),
        [
            {"name": "student", "display_name": "Estudante"},
            {"name": "professor", "display_name": "Professor"},
            {"name": "staff", "display_name": "Funcionário"},
        ],
    )
    op.create_table(
        "user",
        sa.Column("id_user", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("cpf", sa.String(length=11), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=False),
        sa.Column("rgm", sa.String(length=20), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("id_profile", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["id_profile"], ["profile.id_profile"]),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["role_id"], ["role.id_role"]),
        sa.PrimaryKeyConstraint("id_user"),
        sa.UniqueConstraint("cpf"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("rgm"),
    )
    op.create_table(
        "category",
        sa.Column("id_category", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id_category"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "location",
        sa.Column("id_location", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("central_place", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id_location"),
    )
    op.create_table(
        "object_found",
        sa.Column("id_object", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_user", sa.Integer(), nullable=False),
        sa.Column("id_category", sa.Integer(), nullable=False),
        sa.Column("id_location", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("found_date", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["id_category"], ["category.id_category"]),
        sa.ForeignKeyConstraint(["id_location"], ["location.id_location"]),
        sa.ForeignKeyConstraint(["id_user"], ["user.id_user"]),
        sa.PrimaryKeyConstraint("id_object"),
    )
    op.create_table(
        "characteristic",
        sa.Column("id_characteristic", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_object", sa.Integer(), nullable=False),
        sa.Column("color", sa.String(length=50), nullable=False),
        sa.Column("brand", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["id_object"], ["object_found.id_object"]),
        sa.PrimaryKeyConstraint("id_characteristic"),
        sa.UniqueConstraint("id_object"),
    )
    op.create_table(
        "photo",
        sa.Column("id_photo", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_object", sa.Integer(), nullable=False),
        sa.Column("source", sa.String(length=500), nullable=False),
        sa.ForeignKeyConstraint(["id_object"], ["object_found.id_object"]),
        sa.PrimaryKeyConstraint("id_photo"),
        sa.UniqueConstraint("id_object"),
    )
    op.create_table(
        "pickup",
        sa.Column("id_pickup", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_object", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("cpf", sa.String(length=11), nullable=False),
        sa.Column("rg", sa.String(length=20), nullable=False),
        sa.Column("rgm", sa.String(length=20), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("person_photo", sa.String(length=500), nullable=False),
        sa.Column("pickup_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["id_object"], ["object_found.id_object"]),
        sa.PrimaryKeyConstraint("id_pickup"),
        sa.UniqueConstraint("id_object"),
    )


def downgrade() -> None:
    op.drop_table("pickup")
    op.drop_table("photo")
    op.drop_table("characteristic")
    op.drop_table("object_found")
    op.drop_table("location")
    op.drop_table("category")
    op.drop_table("user")
    op.drop_table("profile")
    op.drop_table("role")
