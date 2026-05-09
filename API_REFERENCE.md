# API Reference - UNIAE CRE System

**Versão:** 1.0.0  
**Data:** 2025-12-17  
**Gerado de:** Comentários JSDoc

---

## Índice

1. [CRUD](#1-crud)
2. [UXFeedback](#2-uxfeedback)
3. [TimezoneManager](#3-timezonemanager)
4. [EnhancedErrorHandler](#4-enhancederrorhandler)
5. [ServiceContainer](#5-servicecontainer)
6. [AppLogger](#6-applogger)
7. [Utils](#7-utils)
8. [Sheet Accessor](#8-sheet-accessor)
9. [Validation](#9-validation)
10. [Global Functions](#10-global-functions)

---

## 1. CRUD

Operações de Create, Read, Update, Delete em planilhas.

### CRUD.create(sheetName, data, options)

Cria um novo registro na planilha especificada.

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `sheetName` | `string` | Sim | Nome da planilha destino |
| `data` | `Object` | Sim | Dados do registro |
| `options` | `Object` | Não | Opções de criação |
| `options.silent` | `boolean` | Não | Se true, não exibe alertas (padrão: false) |

**Retorno:** `Object`

```javascript
{
  success: boolean,      // Se a operação foi bem-sucedida
  id: number,           // ID (linha) do registro criado
  data: Object,         // Dados do registro
  transactionId: string, // ID para rastreamento
  duration: number      // Duração em ms
}
```

**Exemplo:**

```javascript
var result = CRUD.create('Fornecedores', {
  nome: 'Empresa XYZ',
  cnpj: '12.345.678/0001-90',
  email: 'contato@xyz.com'
});

if (result.success) {
  Logger.log('Criado com ID: ' + result.id);
}
```

---

### CRUD.read(sheetName, options)

Lê registros com filtros e paginação.

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `sheetName` | `string` | Sim | Nome da planilha |
| `options.filters` | `Object` | Não | Filtros a aplicar |
| `options.limit` | `number` | Não | Limite de registros (padrão: 100) |
| `options.offset` | `number` | Não | Offset para paginação |
| `options.orderBy` | `Object` | Não | Ordenação {field, direction} |
| `options.cache` | `boolean` | Não | Usar cache (padrão: true) |

**Retorno:** `Object`

```javascript
{
  success: boolean,
  data: Array<Object>,  // Registros encontrados
  total: number,        // Total de registros
  limit: number,
  offset: number,
  hasMore: boolean      // Se há mais páginas
}
```

**Exemplo:**

```javascript
var result = CRUD.read('Notas_Fiscais', {
  filters: { status: 'Pendente' },
  limit: 50,
  orderBy: { field: 'data', direction: 'desc' }
});

result.data.forEach(function(nf) {
  Logger.log(nf.numero + ': ' + nf.valor);
});
```

---

### CRUD.update(sheetName, rowIndex, data, options)

Atualiza um registro existente.

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `sheetName` | `string` | Sim | Nome da planilha |
| `rowIndex` | `number` | Sim | Índice da linha (1-based) |
| `data` | `Object` | Sim | Dados a atualizar |
| `options.silent` | `boolean` | Não | Não exibir alertas |

**Exemplo:**

```javascript
CRUD.update('Fornecedores', 5, {
  status: 'Inativo',
  dataAtualizacao: new Date()
});
```

---

### CRUD.delete(sheetName, rowIndex, hard, options)

Deleta um registro (soft ou hard delete).

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `sheetName` | `string` | Sim | Nome da planilha |
| `rowIndex` | `number` | Sim | Índice da linha |
| `hard` | `boolean` | Não | Se true, deleta permanentemente |

---

### CRUD.bulkImport(sheetName, records, options)

Importa múltiplos registros com indicador de progresso.

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `sheetName` | `string` | Sim | Nome da planilha |
| `records` | `Array<Object>` | Sim | Registros a importar |
| `options.validator` | `Function` | Não | Função de validação |
| `options.stopOnError` | `boolean` | Não | Parar no primeiro erro |
| `options.batchSize` | `number` | Não | Tamanho do lote (padrão: 10) |

**Exemplo:**

```javascript
var result = CRUD.bulkImport('Produtos', [
  { nome: 'Arroz', preco: 5.99 },
  { nome: 'Feijão', preco: 7.99 }
], {
  validator: function(r) { return r.nome && r.preco > 0; }
});

Logger.log('Importados: ' + result.data.succeeded);
```

---

## 2. UXFeedback

Sistema de feedback ao usuário para operações longas.

### UXFeedback.executeSafeOperation(operationName, callback, options)

Executa operação com ciclo completo de feedback.

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `operationName` | `string` | Sim | Nome descritivo da operação |
| `callback` | `Function` | Sim | Função a executar |
| `options.silent` | `boolean` | Não | Não exibir alertas |
| `options.showProgress` | `boolean` | Não | Mostrar progresso (padrão: true) |
| `options.successMessage` | `string` | Não | Mensagem de sucesso customizada |
| `options.context` | `Object` | Não | Contexto para logging |

**Retorno:** `Object`

```javascript
{
  success: boolean,
  data: *,              // Retorno do callback
  transactionId: string,
  duration: number,
  durationFormatted: string
}
```

**Exemplo:**

```javascript
var result = UXFeedback.executeSafeOperation(
  'Processamento de Relatório',
  function() {
    var dados = carregarDados();
    UXFeedback.updateProgress(50, 'Dados carregados');
    
    var relatorio = gerarRelatorio(dados);
    return { paginas: relatorio.length };
  },
  {
    successMessage: 'Relatório gerado com sucesso!'
  }
);
```

---

### UXFeedback.executeBatchOperation(operationName, items, processor, options)

Processa itens em lote com indicador de progresso.

**Exemplo:**

```javascript
var result = UXFeedback.executeBatchOperation(
  'Validação de CNPJs',
  listaCNPJs,
  function(cnpj, index) {
    return validarCNPJ(cnpj) ? { success: true } : { success: false };
  },
  { batchSize: 20 }
);
```

---

### UXFeedback.updateProgress(percent, message)

Atualiza indicador de progresso manualmente.

**Parâmetros:**

| Nome | Tipo | Descrição |
|------|------|-----------|
| `percent` | `number` | Percentual (0-100) |
| `message` | `string` | Mensagem de status |

---

## 3. TimezoneManager

Gestão de fuso horário e formatação de datas.

### TimezoneManager.formatDateForUser(date, format)

Formata data para exibição no fuso horário canônico.

**Parâmetros:**

| Nome | Tipo | Descrição |
|------|------|-----------|
| `date` | `Date\|string` | Data a formatar |
| `format` | `string` | Formato (chave ou string) |

**Formatos Disponíveis:**

| Chave | Formato | Exemplo |
|-------|---------|---------|
| `DATETIME_BR` | `dd/MM/yyyy HH:mm:ss` | 17/12/2025 14:30:45 |
| `DATE_BR` | `dd/MM/yyyy` | 17/12/2025 |
| `TIME_SHORT` | `HH:mm` | 14:30 |
| `ISO_DATE` | `yyyy-MM-dd` | 2025-12-17 |

**Exemplo:**

```javascript
var agora = TimezoneManager.formatDateForUser(new Date(), 'DATETIME_BR');
// "17/12/2025 14:30:45"
```

---

### TimezoneManager.parseDateFromUser(dateString)

Analisa string de data inserida pelo usuário.

**Exemplo:**

```javascript
var date = TimezoneManager.parseDateFromUser('17/12/2025 14:30');
// Date object
```

---

### TimezoneManager.isDSTActive(date)

Verifica se horário de verão está ativo.

---

### TimezoneManager.addTime(date, amount, unit)

Adiciona tempo a uma data.

**Exemplo:**

```javascript
var amanha = TimezoneManager.addTime(new Date(), 1, 'days');
var proximoMes = TimezoneManager.addTime(new Date(), 1, 'months');
```

---

## 4. EnhancedErrorHandler

Tratamento centralizado de erros.

### EnhancedErrorHandler.handle(error, context, options)

Trata erro de forma centralizada.

**Parâmetros:**

| Nome | Tipo | Descrição |
|------|------|-----------|
| `error` | `Error\|string` | Erro a tratar |
| `context` | `string` | Contexto da operação |
| `options.silent` | `boolean` | Não exibir alerta |
| `options.rethrow` | `boolean` | Re-lançar após tratamento |
| `options.persist` | `boolean` | Persistir no log |

**Exemplo:**

```javascript
try {
  operacaoArriscada();
} catch (error) {
  return EnhancedErrorHandler.handle(error, 'Processamento de NF', {
    metadata: { notaId: 'NF-001' }
  });
}
```

---

### EnhancedErrorHandler.tryCatch(fn, context, options)

Wrapper try/catch com tratamento automático.

**Exemplo:**

```javascript
var result = EnhancedErrorHandler.tryCatch(function() {
  return processarDados(dados);
}, 'Processamento');
```

---

### Classes de Erro

```javascript
// Erro de validação
throw new ValidationError('CNPJ inválido', { field: 'cnpj' });

// Erro de negócio
throw new BusinessError('Nota já atestada', { notaId: 'NF-001' });

// Erro de permissão
throw new PermissionError('Acesso negado');
```

---

## 5. ServiceContainer

Container de injeção de dependência.

### ServiceContainer.register(name, factory, options)

Registra um serviço.

**Exemplo:**

```javascript
ServiceContainer.register('meuServico', function(container) {
  return new MeuServico(container.get('logger'));
}, { singleton: true });
```

---

### ServiceContainer.get(name)

Obtém instância de um serviço.

**Exemplo:**

```javascript
var logger = ServiceContainer.get('logger');
logger.info('Mensagem');
```

---

### ServiceContainer.mock(name, mock)

Registra mock para testes.

**Exemplo:**

```javascript
ServiceContainer.enableTestMode();
ServiceContainer.mock('logger', {
  info: function(msg) { testLogs.push(msg); }
});
```

---

## 6. AppLogger

Sistema de logging unificado.

### AppLogger.info(message, metadata)

Log de informação.

### AppLogger.warn(message, metadata)

Log de aviso.

### AppLogger.error(message, error)

Log de erro com stack trace.

### AppLogger.debug(message, metadata)

Log de debug (silencioso em produção).

### AppLogger.audit(action, details)

Log de auditoria (persistido).

**Exemplo:**

```javascript
AppLogger.info('Operação concluída', { registros: 150 });
AppLogger.error('Falha no processamento', error);
AppLogger.audit('LOGIN', { usuario: 'joao@example.com' });
```

---

## 7. Utils

Funções utilitárias.

### Utils.format.cnpj(cnpj)

Formata CNPJ.

```javascript
Utils.format.cnpj('12345678000190');
// "12.345.678/0001-90"
```

### Utils.format.currency(value)

Formata valor monetário.

```javascript
Utils.format.currency(1234.56);
// "R$ 1.234,56"
```

### Utils.string.isEmpty(value)

Verifica se valor está vazio.

### Utils.date.daysDiff(date1, date2)

Calcula diferença em dias.

---

## 8. Sheet Accessor

Acesso a planilhas.

### getSheet(sheetName, createIfMissing)

Obtém referência a uma aba.

### getSheetHeaders(sheetName)

Obtém headers de uma aba.

### getSheetData(sheetName, options)

Obtém dados como array de objetos.

### appendToSheet(sheetName, data)

Adiciona linha à aba.

---

## 9. Validation

Funções de validação.

### validarCNPJ(cnpj)

Valida CNPJ brasileiro.

### validarEmail(email)

Valida formato de email.

### validarCPF(cpf)

Valida CPF brasileiro.

---

## 10. Global Functions

Funções globais de conveniência.

### executeSafeOperation(name, callback, options)

Alias para `UXFeedback.executeSafeOperation`.

### handleCriticalError(error, context, options)

Alias para `EnhancedErrorHandler.handle`.

### formatDateForUser(date, format)

Alias para `TimezoneManager.formatDateForUser`.

### getService(name)

Alias para `ServiceContainer.get`.

### safeAlert(title, message)

Exibe alerta de forma segura (funciona em triggers).

### getSafeUi()

Obtém UI de forma segura (retorna null se indisponível).

---

**Fim da Referência de API**
