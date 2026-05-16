# Aplicação Otimizadora de Tarefas

Sistema web de gerenciamento de tarefas com sistema de pontuação por conclusão de atividades.

---
## Links

- Protótipo no Figma (https://www.figma.com/design/woB69VLn6FMxM8gxiSfXbF/Grupo-53?node-id=0-1&p=f&t=9J41AOOASRQslHZW-0)
- Vídeo de demonstração (colocar link do youtube)

---

## Tecnologias

**Frontend**
- HTML5, CSS3, JavaScript (Vanilla)

**Backend**
- Node.js
- Express 5
- pg (node-postgres)
- cors
- dotenv

**Banco de Dados**
- PostgreSQL 16

**Infraestrutura**
- Docker
- Docker Compose
- Nginx

---

## Funcionalidades

- Cadastro e login de usuários
- Criação de tarefas com categoria, duração estimada e prioridade
- Ordenação de tarefas por PEPS, mais rápidas ou prioridade
- Conclusão de tarefas com pontuação automática

---

## Como subir o projeto com Docker

### Pré-requisitos

- Docker instalado
- Docker Compose instalado


### Passo a passo

**1. Clone o repositório**

git clone https://github.com/marcelowillms/aplicacao-otimizadora
cd aplicacao-otimizadora


**2. Crie o arquivo .env na raiz do projeto**


Comando: cp .env.example .env

Abra o .env e defina os valores:


DB_USER=admin
DB_HOST=postgres
DB_NAME=aplicacao_otimizadora
DB_PASSWORD=sua_senha_aqui
DB_PORT=5432


> O arquivo .env nunca deve ser enviado ao GitHub. Ele já está no .gitignore.

**3. Suba os containers**


docker-compose up -d


Esse comando sobe três serviços:
- **postgres** — banco de dados na porta `5432`
- **backend** — API Node.js na porta `3000`
- **frontend** — interface web via Nginx na porta `80`

As tabelas são criadas automaticamente pelo arquivo `database/init.sql`.

**4. Acesse a aplicação**

Abra o navegador em:


http://localhost


### Parar os containers

docker-compose down

Para remover também os dados do banco: docker-compose down -v
