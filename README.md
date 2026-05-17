# 💬 ChatApp — Infraestrutura Multicontainer com Docker

> **Trabalho 02 — Cloud Computing | Sistemas de Informação**  
> Prof. Esp. Ademar Perfoll Junior

---

## 📋 Nome do Projeto

**ChatApp** — Aplicativo de Chat com Infraestrutura Multicontainer

---

## 📝 Descrição da Aplicação

O **ChatApp** é uma aplicação web de chat em tempo real que permite o **cadastro de usuários** e o **envio/consulta de mensagens**. A solução simula um ambiente real de Cloud Computing e DevOps, utilizando múltiplos containers Docker conectados entre si por uma rede interna.

A aplicação realiza as seguintes operações de **CRUD**:

| Entidade   | Criar | Ler | Deletar |
|------------|-------|-----|---------|
| Usuários   | ✅    | ✅  | ✅     |
| Mensagens  | ✅    | ✅  | ✅     |

---

## 🛠 Tecnologias Utilizadas

| Camada         | Tecnologia                          |
|----------------|-------------------------------------|
| Backend        | Node.js 20 + Express 4              |
| Frontend       | HTML5 / CSS3 / JavaScript (Vanilla) |
| Banco de Dados | PostgreSQL 16                       |
| Container      | Docker + Docker Compose v2          |
| Imagem Base    | `node:20-alpine`                    |
| Registro       | Docker Hub                          |

---

## 🏗 Arquitetura Utilizada

```
┌─────────────────────────────────────────────────────────┐
│                    HOST (sua máquina)                   │
│                                                         │
│   Navegador → localhost:3000                            │
│                    │                                    │
│         ┌──────────▼──────────────────────────┐         │
│         │       chatapp_network (bridge)      │         │
│         │                                     │         │
│         │  ┌──────────────┐  ┌──────────────┐ │         │
│         │  │ chatapp_app  │  │ chatapp_db   │ │         │
│         │  │ Node.js:3000 │──│ PostgreSQL   │ │         │
│         │  │              │  │ :5432        │ │         │
│         │  └──────────────┘  └──────┬───────┘ │         │
│         └───────────────────────────│ ────────┘         │
│                                     │                   │
│                               ┌─────▼──────┐            │
│                               │  Volume    │            │
│                               │chatapp_db  │            │
│                               │   _data    │            │
│                               └────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Componentes

- **`chatapp_app`** — Container da aplicação Node.js/Express. Serve o frontend estático e expõe a API REST na porta 3000.
- **`chatapp_db`** — Container PostgreSQL 16. Armazena usuários e mensagens.
- **`chatapp_network`** — Rede bridge interna. Permite comunicação entre os containers pelo nome do serviço (`db`).
- **`chatapp_db_data`** — Volume Docker para persistência dos dados do banco.

---

## 📁 Estrutura do Projeto

```
projeto/
├── app/
│   ├── public/
│   │   └── index.html        # Interface web do chat
│   ├── server.js             # Servidor Node.js + API REST
│   └── package.json          # Dependências Node.js
├── evidencias/
├── Dockerfile                # Build da imagem da aplicação
├── docker-compose.yml        # Orquestração dos containers
├── .env                      # Variáveis de ambiente
├── .gitignore
└── README.md
```

---

## ⚙️ Variáveis de Ambiente

O arquivo `.env` na raiz do projeto contém:

| Variável          | Descrição                              | Valor Padrão           |
|-------------------|----------------------------------------|------------------------|
| `DB_NAME`         | Nome do banco de dados                 | `chatdb`               |
| `DB_USER`         | Usuário do PostgreSQL                  | `chatuser`             |
| `DB_PASSWORD`     | Senha do PostgreSQL                    | `chatpass123`          |
| `APP_PORT`        | Porta exposta no host                  | `3000`                 |
| `DOCKERHUB_USER`  | Seu usuário do Docker Hub              | `carlosweg`            |

> ⚠️ **Importante:** Confirme que o arquivo `.env` contém seu usuário correto do Docker Hub antes de executar.

---

## 🌐 Portas Utilizadas

| Serviço    | Porta no Container | Porta no Host |
|------------|-------------------|---------------|
| Aplicação  | 3000              | 3000          |
| PostgreSQL | 5432              | não exposta   |

> O banco de dados **não expõe porta ao host** por segurança. Ele é acessível apenas internamente pela rede `chatapp_network`.

---

## 🚀 Instruções Completas de Execução

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) ou Docker Engine (Linux)
- Git

Verifique a instalação:

```bash
docker --version
docker compose version
git --version
```

---

### 1. Clonar o Repositório

```bash
git clone https://github.com/CarlosWeg/aplicacoes_multicontainer_docker_docker_compose
cd aplicacoes_multicontainer_docker_docker_compose
```

---

### 2. Configurar as Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```bash
# Linux/Mac
nano .env

# Windows (PowerShell)
notepad .env
```

Altere `DOCKERHUB_USER` para o seu usuário do Docker Hub:

```env
DB_NAME=chatdb
DB_USER=chatuser
DB_PASSWORD=chatpass123
APP_PORT=3000
DOCKERHUB_USER=carlosweg  # ← altere aqui
```

---

### 3. Executar com Docker Compose

#### ▶ Subir todos os containers (modo detached — recomendado)

```bash
docker compose up -d
```

#### ▶ Subir com logs visíveis no terminal

```bash
docker compose up
```

Aguarde as mensagens de inicialização:

```
chatapp_db   | database system is ready to accept connections
chatapp_app  | ✅ Banco de dados conectado com sucesso!
chatapp_app  | ✅ Tabelas criadas/verificadas com sucesso!
chatapp_app  | 🚀 Servidor rodando na porta 3000
```

---

### 4. Acessar a Aplicação

Abra o navegador em:

```
http://localhost:3000
```

---

### 5. Usando a Aplicação

1. **Cadastrar usuário** — preencha Nome e @username no painel esquerdo e clique em **+ Cadastrar**
2. **Selecionar usuário** — clique no usuário na lista para ativá-lo
3. **Enviar mensagem** — digite no campo inferior e pressione **Enviar →** ou **Enter**
4. **Ver mensagens** — o chat atualiza automaticamente a cada 5 segundos
5. **Apagar mensagem** — passe o mouse sobre uma mensagem e clique em 🗑 apagar
6. **Remover usuário** — com usuário selecionado, clique em **🗑 Remover usuário**

---

## 🐳 Comandos Docker

### Build da Imagem

```bash
# Construir a imagem localmente
docker build -t chatapp:latest .

# Ou com tag do Docker Hub
docker build -t carlosweg/chatapp:latest .
```

### Verificar Imagens

```bash
docker images
```

### Docker Compose — Comandos Principais

```bash
# Subir todos os containers em background
docker compose up -d

# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f app
docker compose logs -f db

# Ver containers em execução
docker compose ps

# Parar os containers (mantém os dados)
docker compose stop

# Parar e remover containers (mantém os volumes/dados)
docker compose down

# Parar, remover containers E volumes (APAGA os dados!)
docker compose down -v

# Reiniciar apenas a aplicação
docker compose restart app

# Rebuild forçado após alterações no código
docker compose up -d --build
```

### Inspecionar Containers

```bash
# Listar todos os containers em execução
docker ps

# Ver todos os volumes
docker volume ls

# Inspecionar o volume do banco
docker volume inspect projeto_chatapp_db_data

# Acessar o terminal do container da aplicação
docker exec -it chatapp_app sh

# Acessar o terminal do banco de dados
docker exec -it chatapp_db psql -U chatuser -d chatdb
```

### Comandos SQL no Banco (dentro do container)

```bash
docker exec -it chatapp_db psql -U chatuser -d chatdb
```

```sql
-- Listar tabelas
\dt

-- Ver usuários cadastrados
SELECT * FROM usuarios;

-- Ver mensagens
SELECT m.id, u.username, m.conteudo, m.enviado_em
FROM mensagens m
JOIN usuarios u ON m.usuario_id = u.id;

-- Sair
\q
```

---

## 🔗 Instruções do Docker Compose

O arquivo `docker-compose.yml` orquestra dois serviços:

### Serviço `db` (PostgreSQL)

```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_DB: ${DB_NAME}      # Lê do .env
    POSTGRES_USER: ${DB_USER}
    POSTGRES_PASSWORD: ${DB_PASSWORD}
  volumes:
    - chatapp_db_data:/var/lib/postgresql/data  # Persistência
  networks:
    - chatapp_network              # Rede interna
  healthcheck:                     # Aguarda banco estar pronto
    test: ["CMD-SHELL", "pg_isready ..."]
```

### Serviço `app` (Node.js)

```yaml
app:
  build: .                         # Build via Dockerfile
  ports:
    - "${APP_PORT}:3000"           # 3000:3000
  environment:
    DB_HOST: db                    # Nome do serviço = hostname
  depends_on:
    db:
      condition: service_healthy   # Aguarda o banco estar saudável
  networks:
    - chatapp_network
```

### Comunicação entre Containers

O serviço `app` se conecta ao banco usando `DB_HOST=db`. O Docker Compose resolve automaticamente o hostname `db` para o IP interno do container do banco, via a rede `chatapp_network`.

---

## 📦 Publicação no Docker Hub

### 1. Login no Docker Hub

```bash
docker login
```

Digite seu usuário e senha do Docker Hub quando solicitado.

### 2. Build com a Tag Correta

Certifique-se que `DOCKERHUB_USER` no `.env` está correto, depois:

```bash
docker build -t carlosweg/chatapp:latest .
```

### 3. Push da Imagem

```bash
docker push carlosweg/chatapp:latest
```

### 4. Verificar no Docker Hub

Acesse: `https://hub.docker.com/r/carlosweg/chatapp`

### Usando a Imagem do Docker Hub (sem build)

Após o push, qualquer pessoa pode usar a imagem diretamente alterando o `docker-compose.yml`:

```yaml
app:
  image: carlosweg/chatapp:latest  # usa a imagem publicada
  # build: .                         # comente ou remova esta linha
```

Depois:

```bash
docker compose pull
docker compose up -d
```

---

## 🗄️ Persistência de Dados

Os dados do PostgreSQL são armazenados no volume Docker `chatapp_db_data`. Para verificar a persistência:

```bash
# 1. Cadastre usuários e envie mensagens na aplicação

# 2. Pare os containers
docker compose stop

# 3. Suba novamente
docker compose start

# 4. Acesse http://localhost:3000 — os dados continuam lá!
```

Para verificar o volume:

```bash
docker volume ls
docker volume inspect projeto_chatapp_db_data
```

---

## 🔍 API REST — Endpoints

| Método | Endpoint            | Descrição                  |
|--------|---------------------|----------------------------|
| GET    | `/api/health`       | Health check da aplicação  |
| GET    | `/api/usuarios`     | Listar todos os usuários   |
| POST   | `/api/usuarios`     | Cadastrar novo usuário     |
| DELETE | `/api/usuarios/:id` | Remover usuário            |
| GET    | `/api/mensagens`    | Listar todas as mensagens  |
| POST   | `/api/mensagens`    | Enviar nova mensagem       |
| DELETE | `/api/mensagens/:id`| Remover mensagem           |

### Exemplos com curl

```bash
# Cadastrar usuário
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria Silva", "username": "maria"}'

# Listar usuários
curl http://localhost:3000/api/usuarios

# Enviar mensagem (substitua 1 pelo id do usuário)
curl -X POST http://localhost:3000/api/mensagens \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": 1, "conteudo": "Olá, mundo!"}'

# Listar mensagens
curl http://localhost:3000/api/mensagens

# Health check
curl http://localhost:3000/api/health
```

---

## 🧯 Solução de Problemas

### Container da aplicação não sobe

```bash
# Veja os logs de erro
docker compose logs app
```

### Banco de dados não conecta

```bash
# Verifique se o banco está saudável
docker compose ps
docker compose logs db
```

### Porta 3000 já em uso

Edite o `.env` e mude `APP_PORT=3001`, depois:

```bash
docker compose down
docker compose up -d
```

### Resetar tudo (dados incluídos)

```bash
docker compose down -v
docker compose up -d
```

---

## 📸 Evidências

A pasta `evidencias/` contém os arquivos que comprovam a execução do projeto.

---

## 👤 Autor

**CARLOS HENRIQUE ANDRADE WEEGE**  
Sistemas de Informação — Cloud Computing  
Trabalho 02 — Docker e Docker Compose
