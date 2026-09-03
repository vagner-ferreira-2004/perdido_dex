# Plano — Subida do Servidor e Conexão com o Banco

## Objetivo

Definir a responsabilidade de cada arquivo envolvido na inicialização do backend, garantindo que:

- o servidor não suba se a conexão com o banco (MySQL) falhar;
- o fluxo `server → routes → controllers → services → models` fique claro desde a inicialização;
- a nomenclatura siga o contexto de desenvolvimento do projeto:
  - arquivos de `routes` e `controllers` em minúsculo;
  - demais arquivos em PascalCase;
  - funções em camelCase;
  - variáveis em snake_case.

---

## Estrutura envolvida nesta etapa

```text
backend/
├── database/
│   └── Connection.py       # engine, session, checkDbConnection()
├── routes/
│   ├── __init__.py         # registerRoutes(app)
│   ├── user.py
│   ├── object.py
│   └── ...
├── controllers/
│   ├── user.py
│   ├── object.py
│   └── ...
├── services/
│   ├── __init__.py         # agrega os services e expõe para os controllers
│   ├── UserService.py
│   └── ...
├── App.py                  # createApp() — cria e configura o Flask
└── server.py               # entrypoint — checa banco e sobe o servidor
```

### Observação sobre nomenclatura

`routes/` e `controllers/` seguem a exceção do contexto (minúsculo).

`database/Connection.py`, `App.py` e os arquivos de `services/` seguem a regra geral (PascalCase), por não serem routes nem controllers.

---

# Responsabilidade de cada arquivo

## `database/Connection.py`

Responsável pela configuração e teste de conexão com o banco.

Deve:

1. Carregar `DATABASE_URL` do `.env`.
2. Usar uma string de conexão MySQL, por exemplo:

```text
mysql+pymysql://user:senha@host/dbname
```

3. Criar o `engine` do SQLAlchemy.
4. Criar a `SessionLocal`, que será a fábrica de sessões utilizada posteriormente pelos services/models.
5. Expor a função:

```python
checkDbConnection()
```

Essa função deve:

- executar um `SELECT 1`;
- em caso de sucesso, registrar/logar que a conexão foi estabelecida;
- em caso de falha, registrar/logar o erro;
- relançar a exceção.

**Importante:** `Connection.py` não decide encerrar o processo. A decisão de impedir a subida do servidor pertence ao `server.py`.

---

## `App.py`

Responsável somente por montar e configurar a aplicação HTTP.

Deve expor:

```python
createApp()
```

Essa função deve:

1. instanciar o Flask;
2. chamar:

```python
registerRoutes(app)
```

3. retornar a instância configurada.

### Regra

`App.py` **não deve saber nada sobre a conexão com o banco**.

Sua responsabilidade é somente criar a aplicação HTTP e conectar as rotas.

---

## `routes/__init__.py`

Responsável por centralizar o registro das rotas.

Deve:

1. importar cada Blueprint dos arquivos individuais:
   - `user.py`
   - `object.py`
   - `category.py`
   - etc.

2. expor:

```python
registerRoutes(app)
```

3. registrar todos os Blueprints na aplicação.

### Regra

Cada arquivo de rota:

- define suas rotas/Blueprints;
- chama funções do controller correspondente;
- **não acessa services nem models diretamente**.

---

## `controllers/*.py`

Responsáveis por receber e tratar a requisição já roteada.

Devem:

1. receber os dados da requisição;
2. realizar o tratamento necessário relacionado à camada HTTP;
3. chamar o(s) service(s) correspondente(s) através do agregador:

```text
services/__init__.py
```

### Regra

Controllers **não devem acessar models ou banco diretamente**.

O acesso à camada de dados deve ocorrer através dos services.

---

## `services/__init__.py`

Funciona como agregador dos services.

Deve:

1. importar os services individuais;
2. expor esses services de forma centralizada;
3. permitir que os controllers consumam os services através de um único ponto.

Exemplo conceitual:

```text
services/
├── __init__.py
├── UserService.py
├── ObjectService.py
└── CategoryService.py
```

O controller consome o agregador, e não precisa conhecer a organização interna de cada service.

---

# `server.py` — Entrypoint

`server.py` é o ponto de entrada do backend.

O processo deve seguir esta ordem:

```text
1. Carregar variáveis de ambiente (.env)
2. Chamar checkDbConnection()
3. Se falhar:
   - mostrar erro claro de conexão com o banco;
   - encerrar o processo com sys.exit(1)
4. Se funcionar:
   - chamar createApp()
   - iniciar o servidor HTTP
```

### Regra principal

**O servidor nunca deve subir antes de uma conexão válida com o banco ser confirmada.**

Fluxo conceitual:

```text
python server.py
       │
       ▼
   load .env
       │
       ▼
checkDbConnection()
       │
   ┌───┴────┐
 falhou     OK
   │          │
sys.exit   createApp()
   (erro)      │
          registerRoutes(app)
                │
     ┌──────────┼──────────┐
   user.py   object.py   category.py
   routes       routes       routes
     │            │            │
     ▼            ▼            ▼
 controllers/*.py
                │
                ▼
      services/__init__.py
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
   UserService ObjectService ...
                │
                ▼
             models/
                │
                ▼
              MySQL
```

---

# Regra de falha

`checkDbConnection()` **nunca deve engolir a exceção silenciosamente**.

O comportamento esperado é:

```text
Falha no banco
      ↓
checkDbConnection()
      ↓
registra/loga o erro
      ↓
relança a exceção
      ↓
server.py captura a falha
      ↓
informa o problema
      ↓
sys.exit(1)
```

### Responsabilidades

`Connection.py`:

> "Consigo me conectar ao banco?"

`server.py`:

> "O banco não está disponível. Portanto, o processo não deve subir."

Isso mantém a responsabilidade de decidir se a aplicação inicia isolada no entrypoint.

---

# Ordem de implementação

## Step 1 — Configuração do banco

Criar:

```text
backend/database/Connection.py
```

Implementar:

- leitura de `DATABASE_URL`;
- `engine`;
- `SessionLocal`;
- `checkDbConnection()`.

---

## Step 2 — Criação da aplicação

Criar:

```text
backend/App.py
```

Implementar:

```python
createApp()
```

Responsável por:

- criar a aplicação Flask;
- registrar as rotas;
- retornar a aplicação.

---

## Step 3 — Registro central das rotas

Criar/ajustar:

```text
backend/routes/__init__.py
```

Implementar:

```python
registerRoutes(app)
```

Centralizar o registro de todos os Blueprints.

---

## Step 4 — Entrypoint

Criar/ajustar:

```text
backend/server.py
```

Implementar o fluxo:

```text
load .env
    ↓
checkDbConnection()
    ↓
    ├── erro → log + sys.exit(1)
    │
    └── sucesso
           ↓
       createApp()
           ↓
       app.run(...)
```

---

## Step 5 — Validar o comportamento

### Banco funcionando

Executar:

```bash
python server.py
```

Resultado esperado:

```text
Database connection established.
Server started.
```

### Banco indisponível

Executar:

```bash
python server.py
```

Resultado esperado:

```text
Database connection failed: ...
```

E o processo deve terminar com código de saída:

```text
1
```

O servidor HTTP **não deve ficar escutando a porta**.

---

# O que fica fora deste plano

Esta etapa não implementa o conteúdo interno de:

- `routes/*.py` — Blueprints individuais;
- `controllers/*.py`;
- `services/__init__.py` e services individuais;
- `models/*.py` — já cobertos pelo plano de banco anterior;
- regras de negócio;
- validações detalhadas;
- autenticação/autorização;
- migrations do Alembic;
- seeds.

Esses pontos serão tratados nas próximas etapas.

---

# Critério de conclusão

Esta etapa estará concluída quando:

- `server.py` carregar a configuração;
- a conexão com o MySQL for validada antes da subida;
- uma falha no banco impedir o servidor de iniciar;
- `App.py` cuidar apenas da montagem da aplicação HTTP;
- `routes/__init__.py` centralizar o registro das rotas;
- controllers chamarem services;
- controllers não acessarem o banco diretamente;
- a estrutura de responsabilidades estiver respeitada.
