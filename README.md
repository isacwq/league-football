# ⚽ Passe - Sistema de Gestão de Liga de Futebol

> Aplicação web fullstack para gestão de liga futebolística fictícia, englobando controle de atletas, finanças de clubes, mercado de transferências com contratos de fidelidade e simulação determinística de partidas.

---

## 📋 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Configuração e Instalação](#-configuração-e-instalação)
- [Resumo dos Endpoints da API](#-resumo-dos-endpoints-da-api)
- [Qualidade e Testes](#-qualidade-e-testes)
- [Autor](#-autor)

---

## 🎯 Sobre o Projeto

O **Passe** é um sistema completo de gestão esportiva desenvolvido como estudo de caso para simulação de uma liga de futebol. A plataforma permite cadastrar e valorizar atletas, gerenciar os orçamentos e elencos de até 20 clubes, realizar negociações no mercado com cláusulas de rescisão e comissões, além de montar escalações táticas para simular partidas cujos placares são calculados de forma determinística com base nos atributos técnicos dos jogadores.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Linguagem:** TypeScript
- **Framework / Lib:** React
- **Estilização:** Tailwind CSS, shadcn/ui
- **Gerenciamento de Estado:** Zustand / Context API
- **Cliente HTTP:** Axios
- **Qualidade & Linting:** ESLint, Prettier

### **Backend** *(Ajuste conforme a stack escolhida)*
- **Linguagem:** Java 17
- **Framework:** Spring Boot '4.1.1
- **Banco de Dados:** PostgreSQL 16
- **ORM / Query Builder:** Hibernate
- **Validação de Dados:** Bean Validation

---

## 🚀 Funcionalidades Principais

1. **Jogadores (Players)**
   - Cadastro e listagem paginada com busca e ordenação por Overall ou Valor de Mercado.
   - Cálculo automático de Overall, Valor Base e Valor de Mercado a partir dos 6 atributos técnicos.
   - Controle de condição física (`APTO`, `MAL_CONDICIONADO`, `DOENTE`).

2. **Clubes (Clubs)**
   - Cadastro de até 20 clubes com caixa inicial de R$ 300,00.
   - Cálculo dinâmico do Patrimônio Líquido (`Caixa + Valor do Elenco`).
   - Ordenação via API por Nome, Maior ou Menor Patrimônio Líquido.

3. **Mercado de Transferências (Market)**
   - Compra de atletas livres com cobrança de taxa de mercado (5% para atletas de valor ≥ R$ 20,00).
   - Venda e rescisão de contrato com cálculo de multa por fidelidade e comissão.
   - Extrato e histórico de transações com exportação oficial para CSV.

4. **Escalação Tática e Liga (Lineup & Matches)**
   - Definição de formação tática (`3-1`, `2-2`, `2-1-1`, `1-2-1`) e 5 titulares obrigatórios.
   - Simulação de partidas com 6 duelos determinísticos por posição.
   - Tabela de classificação em tempo real (Pontos, Vitórias, Saldo de Gols, Gols Pró).

---

## 📂 Estrutura do Repositório

```text
league-football/
├── backend/                  # Código-fonte da API Backend
│   ├── src/
│   │   ├── controllers/      # Handlers das rotas HTTP
│   │   ├── services/         # Regras de negócio e cálculos
│   │   ├── repositories/     # Camada de acesso ao banco de dados
│   │   └── models/           # Entidades e schemas de banco
│   └── tests/                # Testes unitários e de integração
│
├── frontend/                 # Código-fonte da Interface Web (React)
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis de UI
│   │   ├── pages/            # Telas (Players, Clubs, League, Home)
│   │   ├── services/         # Clientes de API (clubService, marketService, etc.)
│   │   ├── types/            # Definições de interfaces TypeScript
│   │   └── utils/            # Formatadores de moeda, datas e utilitários
│   └── public/
│
└── README.md                 # Documentação principal na raiz do repositório
```

---

## ⚙️ Configuração e Instalação

### **0. Banco de dados**
```bash
podman run --name pg-16.15-alpine3.24-senai-8 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=league_football -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:16.15-alpine3.24
```

### **1. Executando o Backend**
```bash
cd backend

```

### **2. Executando o Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📑 Resumo dos Endpoints da API

| Módulo | Método | Endpoint | Descrição |
| :--- | :---: | :--- | :--- |
| **Jogadores** | `GET` | `/players` | Lista paginada com busca e ordenação |
| | `POST` | `/players` | Cadastra novo jogador |
| | `PATCH` | `/players/{id}/condition` | Atualiza condição física |
| **Clubes** | `GET` | `/clubs?sort={sort}` | Lista clubes ordenados pela API |
| | `GET` | `/clubs/{id}` | Detalhes do clube e elenco |
| | `PUT` | `/clubs/{id}/lineup` | Salva escalação tática |
| **Mercado** | `POST` | `/market/buy` | Realiza compra de jogador livre |
| | `POST` | `/players/{id}/sell` | Vende/rescinde contrato de jogador |
| | `GET` | `/clubs/{id}/transactions/export` | Exporta histórico em CSV |
| **Liga** | `GET` | `/matches` | Lista histórico de partidas |
| | `POST` | `/matches` | Simula partida entre dois clubes |
| | `GET` | `/standings` | Tabela de classificação atualizada |

---

## 🧪 Qualidade e Testes

- **Backend:** `./gradlew clean test` (testes automatizados de integração)
- **Frontend:** `npm run lint` (verificação de padronização do ESLint)

---

## Uso de inteligência artificial

- **Ferramentas:** GitHub Copilot.
- **Onde:** No backend e nos componentes do frontend.
- **Como e por quê:** Utilizado para acelerar a escrita de código repetitivo (boilplate de DTOs e validações).
- **O que foi aceito, alterado ou descartado:**
  - **Aceito:** Estrutura de rotas e tipagens TypeScript para os contratos das requisições.
  - **Alterado:** Importações de versões antigas de bibliotecas e classes inexistentes .
  - **Descartado:** Sugestões de rotas que acessavam o banco diretamente.

---

## 👤 Autor

Desenvolvido como projeto do estudo de caso **Passe - Gestão de Liga de Futebol**.
