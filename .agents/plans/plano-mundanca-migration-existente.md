
Adequar o banco ao formulário de cadastro/login, permitindo que o RGM seja obrigatório apenas para estudantes.

---

## 1. Criar tabela `profile`

```text
profile
-----------------
id_profile       PK
name             NOT NULL UNIQUE
display_name     NOT NULL
```

### Exemplo
| id_profile | name      | display_name |
| :--- | :--- | :--- |
| 1 | `student` | Estudante |
| 2 | `professor` | Professor |
| 3 | `staff` | Funcionário |

- **`name`**: valor interno usado pelo sistema.
- **`display_name`**: nome apresentado ao frontend/backend.

---

## 2. Alterar tabela `user`

### Adicionar
- `password_hash` `NOT NULL`
- `id_profile` `NOT NULL FK` → `profile.id_profile`

### Alterar
- `rgm`: de `NOT NULL` para permitir `NULL`.

### Estrutura final
```text
user
-------------------------
id_user           PK
name              NOT NULL
cpf               NOT NULL UNIQUE
phone             NOT NULL
email             NOT NULL UNIQUE
rgm               NULL UNIQUE
password_hash     NOT NULL
id_profile        NOT NULL FK
```

---

## 3. Regra do RGM

Implementar na validação do cadastro:
- `profile = student` → RGM obrigatório
- `profile != student` → RGM pode ser `NULL`

O banco não deve armazenar `confirm_password`. Apenas `password_hash`. A senha deve ser armazenada como hash, nunca em texto puro.

## isso é fora de escopo, só cria altera a migration existente e o modelo

---

## 4. Atualizar usuário de desenvolvimento

O usuário existente `Development User` deve receber:
- `password_hash`
- `id_profile`

Deve continuar com `rgm` preenchido, caso o perfil escolhido seja `student`.

---

## Resultado esperado

```text
profile
   │
   └── 1:N ── user

user
 ├── id_profile → profile
 ├── rgm (nullable)
 └── password_hash
```

> **Fora deste plano:** implementação das rotas, controllers, services e validações detalhadas do cadastro.