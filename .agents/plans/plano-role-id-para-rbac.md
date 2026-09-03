# Mini plano — Roles + organização das rotas

## 1. Criar tabela `role`
```text
role
- id_role
- name
```

### Seed inicial:
- `1 | common`
- `2 | admin`

---

## 2. Relacionar `user` → `role`
- Adicionar: `user.role_id → role.id_role`

> Todo usuário autenticado terá uma role.

---

## 3. Manter rotas organizadas por feature
Não separar por `admin`/`common`/`no_auth`.

```text
routes/
├── auth.py
├── objects.py
├── users.py
└── ...
```

### Exemplo (`objects.py`):
- **NO_AUTH**
  - `GET /objects`
- **COMMON**
  - `POST /objects`
- **ADMIN**
  - `PATCH /objects/{id}/status`
  - `DELETE /objects/{id}`

---

## 4. Criar autenticação/autorização

### Fluxo:
```text
Request
  ↓
Authentication
  ↓
User
  ↓
Role
  ↓
Authorization
  ↓
Route
```

> A rota apenas define qual nível de acesso exige.

---

## 5. Separar a lógica no service
A organização interna pode refletir os níveis:

```text
services/
├── objects/
│   ├── common/
│   └── admin/
├── users/
│   └── admin/
└── ...
```

> A route não deve conter regra de negócio.

```text
route
  ↓
authorization
  ↓
service
  ↓
repository/database
```

---

## 6. Deixar RBAC expansível

### Agora:
```text
role
 ├── common
 └── admin
```

### Futuramente:
```text
role
   ↓
role_permission
   ↓
permission
```

> Assim você não precisa criar toda a estrutura de permissões antes de realmente precisar dela.