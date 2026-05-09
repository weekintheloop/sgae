# Relatório de Maturidade - AE

**Data:** 2026-01-05
**Versão do Analisador:** 5.1.0
**Duração:** 17.7s

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Score Geral | **90.0%** |
| Nível de Maturidade | **Otimizado** |
| Status de Saúde | 🟢 Saudável |
| Quality Gate | ✅ PASSED |

---

## Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Total de Arquivos | 304 |
| Total de Linhas | 213,171 |
| Linhas de Código | 157,692 |
| Linhas de Comentário | 30,601 |
| Total de Funções | 3,905 |
| Total de Classes | 11 |

---

## Pontuação por Categoria

| Categoria | Score | Grade | Peso |
|-----------|-------|-------|------|
| Performance GAS | 100.0% | A+ | 6% |
| DevOps/Clasp | 100.0% | A+ | 3% |
| Organização | 100.0% | A+ | 5% |
| Compliance/LGPD | 100.0% | A+ | 5% |
| Acessibilidade WCAG | 100.0% | A+ | 3% |
| Workflow de Atesto | 100.0% | A+ | 4% |
| Integração GAS | 100.0% | A+ | 2% |
| Mobile First/S20 | 100.0% | A+ | 2% |
| Documentação | 97.0% | A+ | 6% |
| Domínios de Negócio | 97.0% | A+ | 6% |
| Confiabilidade | 95.0% | A+ | 5% |
| UX/Design System AE | 95.0% | A+ | 6% |
| Manutenibilidade | 89.0% | A | 6% |
| Arquitetura AE | 84.0% | A- | 10% |
| Qualidade de Código | 82.0% | A- | 10% |
| Testes | 80.0% | A- | 8% |
| Segurança/OWASP | 75.0% | B+ | 10% |
| Escalabilidade | 70.0% | B | 3% |

---

## Pontos Fortes

- ✅ Arquitetura AE: A-
- ✅ Qualidade de Código: A-
- ✅ Documentação: A+
- ✅ Testes: A-
- ✅ Manutenibilidade: A
- ✅ Performance GAS: A+
- ✅ Confiabilidade: A+
- ✅ DevOps/Clasp: A+
- ✅ Organização: A+
- ✅ UX/Design System AE: A+

## Áreas de Melhoria

- Nenhuma área crítica identificada abaixo de 50%

---

## Issues Identificados

**Total:** 0


---

## Plano de Refatoração Prioritário

### 1. [Arquitetura] Refatorar 16 arquivos com mais de 1000 linhas
- **Prioridade:** 🔴 URGENTE
- **Esforço:** Alta
- **Arquivos afetados:** UI_Menu.gs, UI_UX.gs, Infra_Drive.gs, Infra_Integracao.gs, Infra_Manutencao.gs

### 2. [Qualidade de Código] Reduzir complexidade média (atual: 42.2)
- **Prioridade:** 🟡 ALTA
- **Esforço:** Média

### 3. [Testes] Aumentar cobertura de testes (atual: 48.8%)
- **Prioridade:** 🟡 ALTA
- **Esforço:** Média

### 4. [Manutenibilidade] Planejar redução de dívida técnica (244h / 30 dias)
- **Prioridade:** 🟢 MÉDIA
- **Esforço:** Alta
  - todos: 334
  - complex_files: 60
  - large_files: 27

### 5. [Qualidade de Código] Aumentar adoção do padrão IIFE (atual: 42.8%)
- **Prioridade:** 🟢 MÉDIA
- **Esforço:** Baixa

---

## Arquivos para Refatoração (God Classes > 1000 linhas)

| Arquivo | Linhas | Funções | Sugestão |
|---------|--------|---------|----------|
| UI_Menu.gs | 2832 | 101 | Dividir em módulos menores |
| UI_UX.gs | 1950 | 53 | Dividir em módulos menores |
| Infra_Drive.gs | 1732 | 46 | Dividir em módulos menores |
| Infra_Integracao.gs | 1499 | 103 | Extrair funções auxiliares |
| Infra_Manutencao.gs | 1346 | 46 | Extrair funções auxiliares |
| Dominio_Recebimento.gs | 1269 | 8 | Extrair funções auxiliares |
| UI_WebApp.gs | 1191 | 47 | Extrair funções auxiliares |
| Dominio_Nutricao.gs | 1185 | 7 | Extrair funções auxiliares |
| Dominio_Documentos.gs | 1172 | 12 | Extrair funções auxiliares |
| UI_Standards.gs | 1148 | 37 | Extrair funções auxiliares |

---

## Arquivos com Alta Complexidade (> 60)

| Arquivo | Complexidade | Funções |
|---------|--------------|---------|
| Infra_Drive.gs | 192 | 46 |
| Core_CRUD_Frontend_Bridge.gs | 189 | 44 |
| UI_Menu.gs | 170 | 101 |
| UI_UX.gs | 165 | 53 |
| UI_WebApp.gs | 149 | 47 |
| Infra_Manutencao.gs | 146 | 46 |
| Infra_Integracao.gs | 145 | 103 |
| Dominio_Pesquisa.gs | 140 | 32 |
| Dominio_NotasFiscais.gs | 130 | 32 |
| Core_Workflow_Nutricionista.gs | 106 | 19 |

---

## Arquivos com TODOs Pendentes

| Arquivo | TODOs |
|---------|-------|
| Dominio_Recebimento.gs | 33 |
| Dominio_Educacao.gs | 30 |
| Dominio_Nutricao.gs | 17 |
| Setup_Sheets_Builder.gs | 13 |
| Core_Items_Repository.gs | 10 |
| Dominio_Documentos.gs | 10 |
| Test_Integration_Business.gs | 10 |
| Infra_Manutencao.gs | 7 |
| Core_Audit_Service.gs | 6 |
| Core_Nutrition_Validator.gs | 6 |


---

*Gerado por EPMA v5.1.0 - UNIAE CRE Edition*