# Lost and Found

## Banco de dados

O backend usa MySQL, SQLAlchemy e Alembic. Configure `.env` com as variáveis `DB_*`.
O comando `db:reset` cria o banco usando `DB_NAME`; se ele já existir, apaga tudo e recria a estrutura e os seeds.

A partir desta pasta (`backend/`):

```bash
py -m pip install -r requirements.txt
py manage.py db:reset
```

Comandos do Alembic disponíveis dentro de `backend/`:

```bash
py -m alembic upgrade head
py -m alembic downgrade -1
py -m database.seeds.seed
```

Toda alteração estrutural deve ser feita por uma nova migration. Não edite migrations já aplicadas ou compartilhadas.
