# Plano de Testes Manuais - Care Plus

**Disciplina:** Testing, Compliance and Quality Assurance
**Sprint 4 - QA**
**Sistema:** Care Plus - API de serviços de bem-estar
**Nível de teste:** Sistema (validação das funcionalidades principais)

---

## Objetivo

Validar as funcionalidades principais da API Care Plus de forma manual, no nível de
sistema, usando dados controlados (valores de entrada e saída predefinidos). As
funcionalidades cobertas são: cadastro de usuário, login e autenticação, registro de
hidratação e check-in de bem-estar. Cada caso abaixo deve ser cadastrado como um Test
Case no Azure Boards (Test Plans), com os passos transcritos na grade de etapas.

## Ambiente e dados base (controlados)

| Item | Valor |
|------|-------|
| URL base da API | http://localhost:3000 |
| Usuário padrão de teste | nome: Aluno QA / email: aluno.qa@careplus.com / senha: Senha@123 |
| Meta diária de hidratação | 2000 ml |
| Humores válidos | ruim, neutro, bom, otimo |

---

## CT01 - Cadastro de usuário com dados válidos

**Pré-condição:** o email aluno.qa@careplus.com ainda não está cadastrado.

**Dados de entrada:**
- nome: Aluno QA
- email: aluno.qa@careplus.com
- senha: Senha@123

**Dados de saída esperados:**
- Status HTTP 201
- Corpo com id (número), nome e email iguais aos enviados

**Procedimento:**
1. Enviar POST para /auth/register com o corpo dos dados de entrada. Esperado: resposta 201.
2. Conferir no corpo da resposta que existe o campo id. Esperado: id numérico presente.
3. Conferir que email retornado é aluno.qa@careplus.com. Esperado: email confere.

---

## CT02 - Cadastro com email já existente

**Pré-condição:** o email aluno.qa@careplus.com já foi cadastrado (rodar CT01 antes).

**Dados de entrada:**
- nome: Outro Aluno
- email: aluno.qa@careplus.com
- senha: Senha@123

**Dados de saída esperados:**
- Status HTTP 409
- Corpo com mensagem de erro "email ja cadastrado"

**Procedimento:**
1. Enviar POST para /auth/register com o email repetido. Esperado: resposta 409.
2. Conferir a mensagem de erro no corpo. Esperado: campo erro indicando email já cadastrado.

---

## CT03 - Cadastro com senha curta

**Pré-condição:** nenhuma.

**Dados de entrada:**
- nome: Aluno Curto
- email: curto@careplus.com
- senha: 123

**Dados de saída esperados:**
- Status HTTP 400
- Corpo com erro informando que a senha deve ter ao menos 6 caracteres

**Procedimento:**
1. Enviar POST para /auth/register com senha de 3 caracteres. Esperado: resposta 400.
2. Conferir mensagem de erro no corpo. Esperado: erro sobre tamanho mínimo da senha.

---

## CT04 - Login com credenciais válidas

**Pré-condição:** usuário aluno.qa@careplus.com cadastrado (CT01).

**Dados de entrada:**
- email: aluno.qa@careplus.com
- senha: Senha@123

**Dados de saída esperados:**
- Status HTTP 200
- Corpo com campo token (string não vazia) e dados do usuário

**Procedimento:**
1. Enviar POST para /auth/login com email e senha corretos. Esperado: resposta 200.
2. Conferir que o corpo tem o campo token preenchido. Esperado: token presente.
3. Guardar o token para usar nos testes autenticados (CT07 em diante).

---

## CT05 - Login com senha incorreta

**Pré-condição:** usuário aluno.qa@careplus.com cadastrado.

**Dados de entrada:**
- email: aluno.qa@careplus.com
- senha: senhaErrada

**Dados de saída esperados:**
- Status HTTP 401
- Corpo com mensagem "credenciais invalidas"

**Procedimento:**
1. Enviar POST para /auth/login com a senha errada. Esperado: resposta 401.
2. Conferir mensagem de erro no corpo. Esperado: credenciais inválidas.

---

## CT06 - Acesso a recurso protegido sem token

**Pré-condição:** nenhuma.

**Dados de entrada:**
- Requisição GET /me sem cabeçalho Authorization

**Dados de saída esperados:**
- Status HTTP 401
- Corpo com mensagem "Token nao informado"

**Procedimento:**
1. Enviar GET para /me sem token. Esperado: resposta 401.
2. Conferir mensagem de erro no corpo. Esperado: token não informado.

---

## CT07 - Registrar hidratação válida

**Pré-condição:** estar logado com o usuário de teste e ter o token (CT04). Nenhum registro de água no dia ainda.

**Dados de entrada:**
- Authorization: Bearer (token do CT04)
- quantidadeMl: 500

**Dados de saída esperados:**
- Status HTTP 201
- Corpo com totalMl = 500, metaMl = 2000, progresso = 25, metaAtingida = false

**Procedimento:**
1. Enviar POST para /hidratacao com o token e quantidadeMl 500. Esperado: resposta 201.
2. Conferir totalMl no corpo. Esperado: 500.
3. Conferir progresso no corpo. Esperado: 25 (porcentagem).
4. Conferir metaAtingida. Esperado: false.

---

## CT08 - Hidratação atingindo a meta diária

**Pré-condição:** usuário logado, já com 500 ml registrados no dia (após CT07).

**Dados de entrada:**
- Authorization: Bearer (token do CT04)
- quantidadeMl: 1500

**Dados de saída esperados:**
- Status HTTP 201
- Corpo com totalMl = 2000, progresso = 100, metaAtingida = true

**Procedimento:**
1. Enviar POST para /hidratacao com quantidadeMl 1500. Esperado: resposta 201.
2. Conferir totalMl no corpo. Esperado: 2000.
3. Conferir progresso. Esperado: 100.
4. Conferir metaAtingida. Esperado: true.

---

## CT09 - Hidratação com valor inválido

**Pré-condição:** usuário logado.

**Dados de entrada:**
- Authorization: Bearer (token do CT04)
- quantidadeMl: -100

**Dados de saída esperados:**
- Status HTTP 400
- Corpo com erro informando que quantidadeMl deve ser um número positivo

**Procedimento:**
1. Enviar POST para /hidratacao com quantidadeMl negativo. Esperado: resposta 400.
2. Conferir mensagem de erro no corpo. Esperado: erro de valor inválido.

---

## CT10 - Check-in de bem-estar válido

**Pré-condição:** usuário logado e sem check-in registrado no dia.

**Dados de entrada:**
- Authorization: Bearer (token do CT04)
- humor: bom
- horasSono: 8

**Dados de saída esperados:**
- Status HTTP 201
- Corpo com humor = bom e horasSono = 8

**Procedimento:**
1. Enviar POST para /checkin com humor bom e horasSono 8. Esperado: resposta 201.
2. Conferir humor no corpo. Esperado: bom.
3. Conferir horasSono no corpo. Esperado: 8.

---

## CT11 - Check-in duplicado no mesmo dia

**Pré-condição:** já existe um check-in registrado hoje (após CT10).

**Dados de entrada:**
- Authorization: Bearer (token do CT04)
- humor: otimo
- horasSono: 7

**Dados de saída esperados:**
- Status HTTP 409
- Corpo com mensagem "check-in de hoje ja registrado"

**Procedimento:**
1. Enviar POST para /checkin uma segunda vez no mesmo dia. Esperado: resposta 409.
2. Conferir mensagem de erro no corpo. Esperado: check-in já registrado.

---

## CT12 - Check-in com humor inválido

**Pré-condição:** usuário logado.

**Dados de entrada:**
- Authorization: Bearer (token do CT04)
- humor: feliz
- horasSono: 8

**Dados de saída esperados:**
- Status HTTP 400
- Corpo com erro listando os humores válidos

**Procedimento:**
1. Enviar POST para /checkin com humor "feliz" (não está na lista). Esperado: resposta 400.
2. Conferir mensagem de erro no corpo. Esperado: erro de humor inválido.

---

## Resumo de rastreabilidade (testes x funcionalidade)

| Caso | Funcionalidade | Resultado esperado |
|------|----------------|--------------------|
| CT01 | Cadastro | 201 - usuário criado |
| CT02 | Cadastro | 409 - email duplicado |
| CT03 | Cadastro | 400 - senha curta |
| CT04 | Login | 200 - token gerado |
| CT05 | Login | 401 - senha incorreta |
| CT06 | Autenticação | 401 - sem token |
| CT07 | Hidratação | 201 - 500 ml / 25% |
| CT08 | Hidratação | 201 - meta atingida |
| CT09 | Hidratação | 400 - valor inválido |
| CT10 | Check-in | 201 - registrado |
| CT11 | Check-in | 409 - duplicado |
| CT12 | Check-in | 400 - humor inválido |
