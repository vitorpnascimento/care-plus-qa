# Care Plus - Sprint 4 (QA)

Entrega da Sprint 4 da disciplina Testing, Compliance and Quality Assurance.
Contém o plano de testes manuais (Azure Boards) e a automação de testes (Postman)
da API de bem-estar do Care Plus.

## Integrantes
- Vitor Pinheiro Nascimento - RM553693
- Pedro Chaves - RM553988
- Miguel Parrado - RM554007
- Matheus Farias - RM554254
- Gabriel Leão - RM552642

## Links de entrega

- **Azure Boards (testes manuais):** COLAR_LINK_AQUI
- **Vídeo da automação:** COLAR_LINK_AQUI

> O professor precisa ser adicionado como membro da organização e do projeto no
> Azure DevOps para conseguir acessar e corrigir os testes manuais.

## Estrutura do repositório
```
care-plus-qa/
├── backend/        API Care Plus (sistema sob teste)
├── automation/     Collection do Postman com os testes automatizados
└── docs/           Plano de testes manuais (referência para o Azure Boards)
```

## Parte A - Testes manuais (Azure Boards)
O plano completo está em `docs/plano-de-testes-manuais.md`, com 12 casos de teste de
nível de sistema, cobrindo cadastro, login, autenticação, hidratação e check-in de
bem-estar. Cada caso tem dados de entrada e saída controlados e o procedimento passo
a passo. Esses casos foram cadastrados como Test Cases no Azure Boards (link acima).

## Parte B - Testes automatizados (Postman)
A collection `automation/CarePlus.postman_collection.json` tem 7 casos automatizados
com 13 validações (assertions). Cobre cadastro, login válido e inválido, bloqueio de
acesso sem token, acesso autenticado, hidratação e check-in.

### Como rodar a automação
1. Suba o backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. No Postman, importe `automation/CarePlus.postman_collection.json`.
3. Abra o **Collection Runner**, selecione a collection e clique em **Run**.
4. Todos os 7 casos devem passar (verde).

A collection gera um email novo a cada execução, então pode rodar quantas vezes quiser
sem dar conflito.
