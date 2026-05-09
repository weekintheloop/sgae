# Arquitetura do Sistema UNIAE CRE

**Versão:** 1.0.0  
**Data:** 2025-12-17  
**Autor:** UNIAE CRE Team

---

## 1. Visão Geral

O sistema UNIAE CRE segue uma arquitetura modular em camadas, projetada para:

- **Separação de Responsabilidades**: Cada módulo tem uma única função
- **Baixo Acoplamento**: Módulos dependem de abstrações, não implementações
- **Alta Coesão**: Código relacionado está agrupado logicamente
- **Testabilidade**: Suporte a injeção de dependência para mocks

---

## 2. Diagrama de Dependências

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA DE APRESENTAÇÃO                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  UI_*.html  │  │ UI_*.gs     │  │ UI_Menu.gs  │  │ UI_WebApp.gs│        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA DE APLICAÇÃO                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Core_CRUD   │  │Core_UseCases│  │Core_Workflow│  │Core_Frontend│        │
│  │             │  │             │  │  _Atesto    │  │   _API      │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA DE DOMÍNIO                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Dominio_   │  │  Dominio_   │  │  Dominio_   │  │  Dominio_   │        │
│  │ NotasFiscais│  │ Fornecedores│  │  Empenhos   │  │  Entregas   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAMADA DE INFRAESTRUTURA                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Core_Sheet   │  │ Core_Cache  │  │ Core_Auth   │  │ Infra_Drive │        │
│  │  Accessor   │  │             │  │             │  │             │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA CORE (Base)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 0_Core_Safe │  │ Core_Logger │  │ Core_Error  │  │ Core_Config │        │
│  │   Globals   │  │             │  │  Enhanced   │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Core_Timezone│  │Core_UX      │  │ Core_       │  │ Core_       │        │
│  │  Manager    │  │  Feedback   │  │ Constants   │  │ Validation  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Ordem de Carregamento

O Google Apps Script carrega arquivos em ordem alfabética. Usamos prefixos para controlar a ordem:

```
1. 0_Core_Safe_Globals.gs    ← Fallbacks e funções globais seguras
2. 0_Core_Utils.gs           ← Utilitários básicos
3. 0_Project_Index.gs        ← Índice do projeto
4. 1_System_Bootstrap.gs     ← Inicialização do sistema
5. Core_*.gs                 ← Módulos core (ordem alfabética)
6. Dominio_*.gs              ← Lógica de domínio
7. Infra_*.gs                ← Infraestrutura
8. UI_*.gs                   ← Interface do usuário
9. Setup_*.gs                ← Configuração
10. Test_*.gs                ← Testes
```

---

## 4. Responsabilidades dos Módulos

### 4.1 Camada Core (Base)

| Módulo | Responsabilidade | Dependências |
|--------|------------------|--------------|
| `0_Core_Safe_Globals.gs` | Fallbacks globais, funções UI seguras | Nenhuma |
| `Core_Logger.gs` | Logging unificado, auditoria | Safe_Globals |
| `Core_Error_Enhanced.gs` | Tratamento de erros, stack trace | Logger, Safe_Globals |
| `Core_Config.gs` | Configurações centralizadas | Nenhuma |
| `Core_Constants.gs` | Constantes do sistema | Nenhuma |
| `Core_Timezone_Manager.gs` | Gestão de fuso horário | Config |
| `Core_UX_Feedback.gs` | Feedback ao usuário | Logger, Safe_Globals |
| `Core_Validation_*.gs` | Validação de dados | Constants |

### 4.2 Camada de Infraestrutura

| Módulo | Responsabilidade | Dependências |
|--------|------------------|--------------|
| `Core_Sheet_Accessor.gs` | Acesso a planilhas | Logger, Schema |
| `Core_Cache.gs` | Cache de dados | Logger |
| `Core_Auth.gs` | Autenticação | Logger, Sheet_Accessor |
| `Core_Repository_Pattern.gs` | Padrão Repository | Sheet_Accessor |
| `Infra_Drive.gs` | Operações no Drive | Logger |
| `Infra_Sheets.gs` | Operações em planilhas | Sheet_Accessor |

### 4.3 Camada de Domínio

| Módulo | Responsabilidade | Dependências |
|--------|------------------|--------------|
| `Dominio_NotasFiscais.gs` | Regras de NF | Repository, Validation |
| `Dominio_Fornecedores.gs` | Regras de fornecedores | Repository, Validation |
| `Dominio_Empenhos.gs` | Regras de empenhos | Repository |
| `Dominio_Entregas.gs` | Regras de entregas | Repository |

### 4.4 Camada de Aplicação

| Módulo | Responsabilidade | Dependências |
|--------|------------------|--------------|
| `Core_CRUD.gs` | Operações CRUD | Sheet_Accessor, UX_Feedback |
| `Core_UseCases.gs` | Casos de uso | Domínio, CRUD |
| `Core_Workflow_Atesto.gs` | Fluxo de atesto | UseCases |
| `Core_Frontend_API.gs` | API para frontend | UseCases |

### 4.5 Camada de Apresentação

| Módulo | Responsabilidade | Dependências |
|--------|------------------|--------------|
| `UI_Menu.gs` | Menu do sistema | Frontend_API |
| `UI_Dashboard.gs` | Dashboard | Frontend_API |
| `UI_WebApp.gs` | Web App | Frontend_API |
| `*.html` | Templates HTML | CSS, JS |

---

## 5. Fluxo de Dados

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Usuário │────▶│    UI    │────▶│ Frontend │────▶│ UseCase  │
│          │     │  (HTML)  │     │   API    │     │          │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                      ┌─────────────────────────────────┘
                      │
                      ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Domínio │◀───▶│   CRUD   │◀───▶│Repository│◀───▶│  Sheet   │
│  (Regras)│     │          │     │          │     │ Accessor │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                                                        ▼
                                                  ┌──────────┐
                                                  │ Planilha │
                                                  │ (Dados)  │
                                                  └──────────┘
```

---

## 6. Padrão de Injeção de Dependência

Para facilitar testes, os módulos suportam injeção de dependência:

### 6.1 Exemplo: CRUD com Injeção

```javascript
var CRUD = (function() {
  
  // Dependências padrão
  var _sheetAccessor = null;
  var _logger = null;
  
  /**
   * Configura dependências (para testes)
   * @param {Object} deps - Dependências
   * @param {Object} deps.sheetAccessor - Accessor de planilhas
   * @param {Object} deps.logger - Logger
   */
  function configure(deps) {
    if (deps.sheetAccessor) _sheetAccessor = deps.sheetAccessor;
    if (deps.logger) _logger = deps.logger;
  }
  
  /**
   * Obtém sheet accessor (com fallback para global)
   * @private
   */
  function getSheetAccessor() {
    if (_sheetAccessor) return _sheetAccessor;
    
    // Fallback para implementação global
    return {
      getSheet: typeof getSheet === 'function' ? getSheet : null,
      getSheetHeaders: typeof getSheetHeaders === 'function' ? getSheetHeaders : null
    };
  }
  
  /**
   * Obtém logger (com fallback)
   * @private
   */
  function getLogger() {
    if (_logger) return _logger;
    return typeof AppLogger !== 'undefined' ? AppLogger : console;
  }
  
  return {
    configure: configure,
    
    create: function(sheetName, data) {
      var accessor = getSheetAccessor();
      var logger = getLogger();
      
      // Usa accessor injetado ou global
      var sheet = accessor.getSheet(sheetName);
      // ... resto da implementação
    }
  };
})();
```

### 6.2 Uso em Testes

```javascript
function testCRUDCreate() {
  // Mock do sheet accessor
  var mockSheetAccessor = {
    getSheet: function(name) {
      return {
        appendRow: function(row) { /* mock */ },
        getLastRow: function() { return 10; }
      };
    },
    getSheetHeaders: function(name) {
      return ['id', 'nome', 'valor'];
    }
  };
  
  // Mock do logger
  var mockLogger = {
    log: function(msg) { /* captura para verificação */ },
    error: function(msg, err) { /* captura */ }
  };
  
  // Injeta mocks
  CRUD.configure({
    sheetAccessor: mockSheetAccessor,
    logger: mockLogger
  });
  
  // Executa teste
  var result = CRUD.create('TestSheet', { nome: 'Teste', valor: 100 });
  
  // Verifica resultado
  assert(result.success === true, 'Create deve retornar success');
  
  // Limpa configuração
  CRUD.configure({
    sheetAccessor: null,
    logger: null
  });
}
```

---

## 7. Container de Serviços

O sistema usa um container simples para gerenciar dependências:

```javascript
// Core_Service_Container.gs

var ServiceContainer = (function() {
  var _services = {};
  var _singletons = {};
  
  return {
    /**
     * Registra um serviço
     * @param {string} name - Nome do serviço
     * @param {Function} factory - Factory function
     * @param {boolean} [singleton=false] - Se é singleton
     */
    register: function(name, factory, singleton) {
      _services[name] = {
        factory: factory,
        singleton: singleton || false
      };
    },
    
    /**
     * Obtém um serviço
     * @param {string} name - Nome do serviço
     * @returns {*} Instância do serviço
     */
    get: function(name) {
      var service = _services[name];
      if (!service) {
        throw new Error('Serviço não registrado: ' + name);
      }
      
      if (service.singleton) {
        if (!_singletons[name]) {
          _singletons[name] = service.factory(this);
        }
        return _singletons[name];
      }
      
      return service.factory(this);
    },
    
    /**
     * Verifica se serviço existe
     */
    has: function(name) {
      return !!_services[name];
    },
    
    /**
     * Lista serviços registrados
     */
    list: function() {
      return Object.keys(_services);
    }
  };
})();

// Registro de serviços padrão
ServiceContainer.register('logger', function() {
  return AppLogger;
}, true);

ServiceContainer.register('sheetAccessor', function() {
  return {
    getSheet: getSheet,
    getSheetHeaders: getSheetHeaders,
    getSheetData: getSheetData
  };
}, true);

ServiceContainer.register('errorHandler', function() {
  return EnhancedErrorHandler;
}, true);
```

---

## 8. Regras de Dependência

### 8.1 Permitido

```
✅ Core → (nada)
✅ Infraestrutura → Core
✅ Domínio → Core, Infraestrutura
✅ Aplicação → Core, Infraestrutura, Domínio
✅ Apresentação → Aplicação
```

### 8.2 Proibido

```
❌ Core → Infraestrutura, Domínio, Aplicação, Apresentação
❌ Infraestrutura → Domínio, Aplicação, Apresentação
❌ Domínio → Aplicação, Apresentação
❌ Aplicação → Apresentação
❌ Dependências circulares
```

---

## 9. Checklist de Novo Módulo

Ao criar um novo módulo:

- [ ] Identificar a camada correta (Core, Infra, Domínio, App, UI)
- [ ] Usar prefixo apropriado no nome do arquivo
- [ ] Documentar dependências no cabeçalho JSDoc (`@requires`)
- [ ] Seguir padrão IIFE para encapsulamento
- [ ] Suportar injeção de dependência para testes
- [ ] Registrar no ServiceContainer se for serviço
- [ ] Adicionar ao diagrama de dependências
- [ ] Criar testes unitários

---

## 10. Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)
- [Google Apps Script Best Practices](https://developers.google.com/apps-script/best_practices)

---

**Fim do Documento**
