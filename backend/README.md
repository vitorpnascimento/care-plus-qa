# Care Plus API (backend)

API REST de serviços de bem-estar usada para a validação de QA da Sprint 4.
Sem banco externo: os dados ficam em memória, o que facilita rodar e testar.

## Tecnologias
- Node.js + Express
- bcryptjs (hash de senha)
- jsonwebtoken (autenticação com token JWT)

## Como rodar
```bash
cd backend
npm install
npm run dev
```
A API sobe em http://localhost:3000

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /auth/register | não | Cadastra um usuário |
| POST | /auth/login | não | Faz login e retorna o token |
| GET | /me | sim | Dados do usuário logado |
| POST | /hidratacao | sim | Registra consumo de água (ml) |
| GET | /hidratacao/hoje | sim | Progresso de água do dia |
| POST | /checkin | sim | Registra check-in (humor + sono) |
| GET | /checkin | sim | Histórico de check-ins |
| GET | /dicas | não | Lista dicas de bem-estar |

Para as rotas autenticadas, enviar o cabeçalho:
```
Authorization: Bearer SEU_TOKEN
```
