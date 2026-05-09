/**
 * @fileoverview Sistema de Auditoria e Telemetria - Alimentação Escolar CRE-PP
 * @version 1.0.0
 * 
 * Intervenção 4/38: AuditService conforme Prompt 4
 * 
 * Registra todas as alterações sensíveis, especialmente em:
 * - Dados de pagamentos
 * - Aprovação de cardápios
 * - Alterações em contratos e empenhos
 * - Operações de usuários
 * 
 * O log inclui: timestamp, usuário, ação, valor anterior e valor novo,
 * garantindo rastreabilidade total para a CRE-PP.
 * 
 * @author UNIAE CRE Team
 * @created 2025-12-25
 */

'use strict';

// ============================================================================
// AUDIT SERVICE - Serviço de Auditoria Especializado
// ============================================================================

var AuditService = (function() {
  
  // =========================================================================
  // CONFIGURAÇÃO
  // =========================================================================
  
  var CONFIG = {
    SHEET_NAME: 'Auditoria_Log',
    MAX_ROWS: 50000,           // Limite de linhas antes de arquivar
    RETENTION_DAYS: 365,       // Retenção de 1 ano
    BATCH_SIZE: 100,           // Tamanho do lote para escrita
    ENABLE_CONSOLE_LOG: true   // Log também no console
  };
  
  /**
   * Tipos de ação para auditoria
   */
  var ACTION_TYPES = {
    // CRUD Básico
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    
    // Autenticação
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    LOGIN_FAILED: 'LOGIN_FAILED',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    
    // Pagamentos (sensível)
    PAGAMENTO_CRIADO: 'PAGAMENTO_CRIADO',
    PAGAMENTO_APROVADO: 'PAGAMENTO_APROVADO',
    PAGAMENTO_LIQUIDADO: 'PAGAMENTO_LIQUIDADO',
    PAGAMENTO_ESTORNADO: 'PAGAMENTO_ESTORNADO',
    PAGAMENTO_CANCELADO: 'PAGAMENTO_CANCELADO',
    
    // Notas Fiscais (sensível)
    NF_LANCADA: 'NF_LANCADA',
    NF_CONFERIDA: 'NF_CONFERIDA',
    NF_ATESTADA: 'NF_ATESTADA',
    NF_GLOSADA: 'NF_GLOSADA',
    NF_CANCELADA: 'NF_CANCELADA',
    
    // Cardápios
    CARDAPIO_CRIADO: 'CARDAPIO_CRIADO',
    CARDAPIO_APROVADO: 'CARDAPIO_APROVADO',
    CARDAPIO_PUBLICADO: 'CARDAPIO_PUBLICADO',
    CARDAPIO_ALTERADO: 'CARDAPIO_ALTERADO',
    
    // Contratos e Empenhos (sensível)
    EMPENHO_CRIADO: 'EMPENHO_CRIADO',
    EMPENHO_ALTERADO: 'EMPENHO_ALTERADO',
    SALDO_ABATIDO: 'SALDO_ABATIDO',
    CONTRATO_ALTERADO: 'CONTRATO_ALTERADO',
    
    // Fornecedores
    FORNECEDOR_CADASTRADO: 'FORNECEDOR_CADASTRADO',
    FORNECEDOR_BLOQUEADO: 'FORNECEDOR_BLOQUEADO',
    CERTIDAO_VENCIDA: 'CERTIDAO_VENCIDA',
    
    // Sistema
    CONFIG_ALTERADA: 'CONFIG_ALTERADA',
    PERMISSAO_ALTERADA: 'PERMISSAO_ALTERADA',
    BACKUP_REALIZADO: 'BACKUP_REALIZADO',
    ERRO_SISTEMA: 'ERRO_SISTEMA',
    ALERTA_SEGURANCA: 'ALERTA_SEGURANCA'
  };
  
  /**
   * Níveis de severidade
   */
  var SEVERITY = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    CRITICAL: 'CRITICAL',
    SECURITY: 'SECURITY'
  };
  
  /**
   * Entidades sensíveis que requerem auditoria detalhada
   */
  var SENSITIVE_ENTITIES = [
    'Pagamentos',
    'NotasFiscais', 
    'Notas_Fiscais',
    'Empenhos',
    'Contratos_Empenho',
    'Glosas',
    'Usuarios',
    'Configuracoes'
  ];
  
  // =========================================================================
  // BUFFER DE ESCRITA
  // =========================================================================
  
  var _writeBuffer = [];
  var _lastFlush = new Date();
  
  // =========================================================================
  // FUNÇÕES PRIVADAS
  // =========================================================================
  
  /**
   * Obtém ou cria a aba de auditoria
   * @private
   */
  function _getAuditSheet() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return null;
    
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      
      var headers = [
        'ID',
        'Data_Hora',
        'Usuario',
        'Email',
        'Acao',
        'Entidade',
        'Registro_ID',
        'Dados_Anteriores',
        'Dados_Novos',
        'Campos_Alterados',
        'Severidade',
        'IP',
        'Sessao_ID',
        'Duracao_ms',
        'Resultado',
        'Observacoes'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#2E7D32')
        .setFontColor('white')
        .setFontWeight('bold');
      
      sheet.setFrozenRows(1);
      sheet.setTabColor('#C62828');
      
      // Protege a aba
      try {
        var protection = sheet.protect();
        protection.setDescription('Auditoria - Somente leitura');
        protection.setWarningOnly(true);
      } catch (e) {
        // Ignora erro de proteção
      }
    }
    
    return sheet;
  }
  
  /**
   * Gera ID único para o registro de auditoria
   * @private
   */
  function _generateAuditId() {
    var timestamp = Date.now().toString(36);
    var random = Math.random().toString(36).substr(2, 6);
    return 'AUD-' + timestamp + '-' + random;
  }
  
  /**
   * Obtém informações do usuário atual
   * @private
   */
  function _getCurrentUser() {
    try {
      var email = Session.getActiveUser().getEmail();
      var effectiveEmail = Session.getEffectiveUser().getEmail();
      
      // Tenta obter nome do usuário do sistema
      var userName = email;
      if (typeof DatabaseEngine !== 'undefined') {
        var userResult = DatabaseEngine.read('USUARIOS', {
          filters: { email: email },
          limit: 1,
          resolveFK: false
        });
        if (userResult.success && userResult.data.length > 0) {
          userName = userResult.data[0].nome || userResult.data[0].Nome_Completo || email;
        }
      }
      
      return {
        email: email || effectiveEmail || 'sistema',
        nome: userName,
        isSystem: !email
      };
    } catch (e) {
      return {
        email: 'sistema',
        nome: 'Sistema',
        isSystem: true
      };
    }
  }
  
  /**
   * Serializa dados para armazenamento
   * @private
   */
  function _serialize(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    
    try {
      // Remove campos internos
      var cleaned = {};
      for (var key in data) {
        if (key.charAt(0) !== '_') {
          cleaned[key] = data[key];
        }
      }
      return JSON.stringify(cleaned);
    } catch (e) {
      return '[Erro ao serializar]';
    }
  }
  
  /**
   * Identifica campos alterados entre dois objetos
   * @private
   */
  function _getChangedFields(oldData, newData) {
    if (!oldData || !newData) return [];
    
    var changed = [];
    var allKeys = Object.keys(Object.assign({}, oldData, newData));
    
    allKeys.forEach(function(key) {
      if (key.charAt(0) === '_') return; // Ignora campos internos
      
      var oldVal = oldData[key];
      var newVal = newData[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changed.push({
          campo: key,
          de: oldVal,
          para: newVal
        });
      }
    });
    
    return changed;
  }
  
  /**
   * Determina severidade baseada na ação e entidade
   * @private
   */
  function _determineSeverity(action, entity) {
    // Ações críticas
    var criticalActions = [
      'PAGAMENTO_ESTORNADO', 'PAGAMENTO_CANCELADO',
      'NF_CANCELADA', 'NF_GLOSADA',
      'FORNECEDOR_BLOQUEADO', 'ALERTA_SEGURANCA',
      'DELETE'
    ];
    
    if (criticalActions.indexOf(action) !== -1) {
      return SEVERITY.CRITICAL;
    }
    
    // Ações de segurança
    var securityActions = [
      'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PERMISSAO_ALTERADA'
    ];
    
    if (securityActions.indexOf(action) !== -1) {
      return SEVERITY.SECURITY;
    }
    
    // Entidades sensíveis
    if (SENSITIVE_ENTITIES.indexOf(entity) !== -1) {
      return SEVERITY.WARNING;
    }
    
    return SEVERITY.INFO;
  }
  
  /**
   * Escreve buffer no sheet
   * @private
   */
  function _flushBuffer() {
    if (_writeBuffer.length === 0) return;
    
    try {
      var sheet = _getAuditSheet();
      if (!sheet) return;
      
      var rows = _writeBuffer.map(function(entry) {
        return [
          entry.id,
          entry.timestamp,
          entry.usuario,
          entry.email,
          entry.acao,
          entry.entidade,
          entry.registroId,
          entry.dadosAnteriores,
          entry.dadosNovos,
          entry.camposAlterados,
          entry.severidade,
          entry.ip,
          entry.sessaoId,
          entry.duracao,
          entry.resultado,
          entry.observacoes
        ];
      });
      
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
      
      _writeBuffer = [];
      _lastFlush = new Date();
      
    } catch (e) {
      console.error('Erro ao gravar auditoria: ' + e.message);
    }
  }
  
  // =========================================================================
  // API PÚBLICA
  // =========================================================================
  
  return {
    
    /**
     * Expõe tipos de ação
     */
    ACTIONS: ACTION_TYPES,
    
    /**
     * Expõe níveis de severidade
     */
    SEVERITY: SEVERITY,
    
    /**
     * Registra evento de auditoria
     * @param {Object} event - Dados do evento
     * @param {string} event.action - Tipo de ação (de ACTION_TYPES)
     * @param {string} [event.entity] - Entidade afetada
     * @param {string|number} [event.entityId] - ID do registro
     * @param {Object} [event.oldData] - Dados anteriores
     * @param {Object} [event.newData] - Dados novos
     * @param {string} [event.userId] - ID/email do usuário (se diferente do atual)
     * @param {string} [event.result] - Resultado (SUCCESS, FAILURE, ERROR)
     * @param {number} [event.duration] - Duração em ms
     * @param {string} [event.notes] - Observações
     * @returns {Object} Resultado
     */
    log: function(event) {
      try {
        var user = _getCurrentUser();
        var now = new Date();
        var changedFields = _getChangedFields(event.oldData, event.newData);
        
        var entry = {
          id: _generateAuditId(),
          timestamp: now,
          usuario: event.userId || user.nome,
          email: user.email,
          acao: event.action || ACTION_TYPES.READ,
          entidade: event.entity || '',
          registroId: event.entityId || '',
          dadosAnteriores: _serialize(event.oldData),
          dadosNovos: _serialize(event.newData),
          camposAlterados: changedFields.length > 0 ? JSON.stringify(changedFields) : '',
          severidade: event.severity || _determineSeverity(event.action, event.entity),
          ip: '',
          sessaoId: event.sessionId || '',
          duracao: event.duration || 0,
          resultado: event.result || 'SUCCESS',
          observacoes: event.notes || ''
        };
        
        // Adiciona ao buffer
        _writeBuffer.push(entry);
        
        // Log no console se habilitado
        if (CONFIG.ENABLE_CONSOLE_LOG) {
          console.log('[AUDIT] ' + entry.acao + ' | ' + entry.entidade + ' | ' + entry.usuario);
        }
        
        // Flush se buffer cheio ou ação crítica
        if (_writeBuffer.length >= CONFIG.BATCH_SIZE || 
            entry.severidade === SEVERITY.CRITICAL ||
            entry.severidade === SEVERITY.SECURITY) {
          _flushBuffer();
        }
        
        return { success: true, auditId: entry.id };
        
      } catch (e) {
        console.error('Erro ao registrar auditoria: ' + e.message);
        return { success: false, error: e.message };
      }
    },
    
    /**
     * Força escrita do buffer
     */
    flush: function() {
      _flushBuffer();
    },
    
    // -----------------------------------------------------------------------
    // MÉTODOS ESPECIALIZADOS PARA PAGAMENTOS
    // -----------------------------------------------------------------------
    
    /**
     * Registra criação de pagamento
     */
    logPagamentoCriado: function(pagamento, nfId) {
      return this.log({
        action: ACTION_TYPES.PAGAMENTO_CRIADO,
        entity: 'Pagamentos',
        entityId: pagamento.ID,
        newData: pagamento,
        notes: 'NF: ' + nfId + ' | Valor: R$ ' + (pagamento.Valor_Liquido || pagamento.Valor_Bruto)
      });
    },
    
    /**
     * Registra aprovação de pagamento
     */
    logPagamentoAprovado: function(pagamentoId, aprovador, valorAprovado) {
      return this.log({
        action: ACTION_TYPES.PAGAMENTO_APROVADO,
        entity: 'Pagamentos',
        entityId: pagamentoId,
        newData: { Status: 'APROVADO', Aprovador: aprovador, Valor: valorAprovado },
        notes: 'Aprovado por ' + aprovador + ' | Valor: R$ ' + valorAprovado
      });
    },
    
    /**
     * Registra liquidação de pagamento
     */
    logPagamentoLiquidado: function(pagamentoId, dadosLiquidacao) {
      return this.log({
        action: ACTION_TYPES.PAGAMENTO_LIQUIDADO,
        entity: 'Pagamentos',
        entityId: pagamentoId,
        newData: dadosLiquidacao,
        notes: 'OB: ' + (dadosLiquidacao.Numero_OB || 'N/A')
      });
    },
    
    /**
     * Registra estorno de pagamento (crítico)
     */
    logPagamentoEstornado: function(pagamentoId, motivo, dadosOriginais) {
      return this.log({
        action: ACTION_TYPES.PAGAMENTO_ESTORNADO,
        entity: 'Pagamentos',
        entityId: pagamentoId,
        oldData: dadosOriginais,
        newData: { Status: 'ESTORNADO', Motivo: motivo },
        severity: SEVERITY.CRITICAL,
        notes: 'ESTORNO: ' + motivo
      });
    },
    
    // -----------------------------------------------------------------------
    // MÉTODOS ESPECIALIZADOS PARA NOTAS FISCAIS
    // -----------------------------------------------------------------------
    
    /**
     * Registra lançamento de NF
     */
    logNFLancada: function(nf) {
      return this.log({
        action: ACTION_TYPES.NF_LANCADA,
        entity: 'NotasFiscais',
        entityId: nf.ID || nf.Numero_NF,
        newData: nf,
        notes: 'NF ' + nf.Numero_NF + ' | Fornecedor: ' + nf.Fornecedor + ' | Valor: R$ ' + nf.Valor_Total
      });
    },
    
    /**
     * Registra atesto de NF
     */
    logNFAtestada: function(nfId, atestador, processo) {
      return this.log({
        action: ACTION_TYPES.NF_ATESTADA,
        entity: 'NotasFiscais',
        entityId: nfId,
        newData: { Status: 'ATESTADA', Atestador: atestador, Processo: processo },
        notes: 'Atestada por ' + atestador + ' | Processo: ' + processo
      });
    },
    
    /**
     * Registra glosa em NF
     */
    logNFGlosada: function(nfId, valorGlosa, motivo, dadosOriginais) {
      return this.log({
        action: ACTION_TYPES.NF_GLOSADA,
        entity: 'NotasFiscais',
        entityId: nfId,
        oldData: dadosOriginais,
        newData: { Valor_Glosado: valorGlosa, Motivo_Glosa: motivo },
        severity: SEVERITY.WARNING,
        notes: 'Glosa de R$ ' + valorGlosa + ' | Motivo: ' + motivo
      });
    },
    
    // -----------------------------------------------------------------------
    // MÉTODOS ESPECIALIZADOS PARA CARDÁPIOS
    // -----------------------------------------------------------------------
    
    /**
     * Registra criação de cardápio
     */
    logCardapioCriado: function(cardapio) {
      return this.log({
        action: ACTION_TYPES.CARDAPIO_CRIADO,
        entity: 'Cardapios_Base',
        entityId: cardapio.ID,
        newData: cardapio,
        notes: 'Cardápio: ' + cardapio.Nome_Cardapio
      });
    },
    
    /**
     * Registra aprovação de cardápio
     */
    logCardapioAprovado: function(cardapioId, nutricionista, crn) {
      return this.log({
        action: ACTION_TYPES.CARDAPIO_APROVADO,
        entity: 'Cardapios_Base',
        entityId: cardapioId,
        newData: { Status: 'APROVADO', Nutricionista: nutricionista, CRN: crn },
        notes: 'Aprovado por ' + nutricionista + ' (CRN: ' + crn + ')'
      });
    },
    
    /**
     * Registra publicação de cardápio
     */
    logCardapioPublicado: function(cardapioId, semana) {
      return this.log({
        action: ACTION_TYPES.CARDAPIO_PUBLICADO,
        entity: 'Cardapios_Semanais',
        entityId: cardapioId,
        newData: { Status: 'PUBLICADO', Semana: semana },
        notes: 'Publicado para semana ' + semana
      });
    },
    
    // -----------------------------------------------------------------------
    // MÉTODOS ESPECIALIZADOS PARA EMPENHOS
    // -----------------------------------------------------------------------
    
    /**
     * Registra abatimento de saldo de empenho
     */
    logSaldoAbatido: function(empenhoId, valorAbatido, saldoAnterior, saldoNovo, nfId) {
      return this.log({
        action: ACTION_TYPES.SALDO_ABATIDO,
        entity: 'Empenhos',
        entityId: empenhoId,
        oldData: { Saldo: saldoAnterior },
        newData: { Saldo: saldoNovo, Valor_Abatido: valorAbatido },
        notes: 'Abatido R$ ' + valorAbatido + ' | NF: ' + nfId + ' | Saldo: R$ ' + saldoAnterior + ' → R$ ' + saldoNovo
      });
    },
    
    // -----------------------------------------------------------------------
    // MÉTODOS PARA AUTENTICAÇÃO
    // -----------------------------------------------------------------------
    
    /**
     * Registra login bem-sucedido
     */
    logLogin: function(email, metadata) {
      return this.log({
        action: ACTION_TYPES.LOGIN,
        entity: 'Sessoes',
        userId: email,
        newData: metadata,
        notes: 'Login: ' + email
      });
    },
    
    /**
     * Registra tentativa de login falha
     */
    logLoginFailed: function(email, motivo) {
      return this.log({
        action: ACTION_TYPES.LOGIN_FAILED,
        entity: 'Sessoes',
        userId: email,
        severity: SEVERITY.SECURITY,
        result: 'FAILURE',
        notes: 'Falha de login: ' + email + ' | Motivo: ' + motivo
      });
    },
    
    // -----------------------------------------------------------------------
    // MÉTODOS PARA CRUD GENÉRICO
    // -----------------------------------------------------------------------
    
    /**
     * Registra operação CREATE
     */
    logCreate: function(entity, entityId, data) {
      return this.log({
        action: ACTION_TYPES.CREATE,
        entity: entity,
        entityId: entityId,
        newData: data
      });
    },
    
    /**
     * Registra operação UPDATE
     */
    logUpdate: function(entity, entityId, oldData, newData) {
      return this.log({
        action: ACTION_TYPES.UPDATE,
        entity: entity,
        entityId: entityId,
        oldData: oldData,
        newData: newData
      });
    },
    
    /**
     * Registra operação DELETE
     */
    logDelete: function(entity, entityId, oldData) {
      return this.log({
        action: ACTION_TYPES.DELETE,
        entity: entity,
        entityId: entityId,
        oldData: oldData,
        severity: SEVERITY.WARNING
      });
    },
    
    // -----------------------------------------------------------------------
    // CONSULTAS E RELATÓRIOS
    // -----------------------------------------------------------------------
    
    /**
     * Busca registros de auditoria
     * @param {Object} filters - Filtros
     * @returns {Object} Resultado
     */
    search: function(filters) {
      filters = filters || {};
      
      try {
        var sheet = _getAuditSheet();
        if (!sheet) return { success: false, error: 'Aba de auditoria não encontrada' };
        
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        
        var results = [];
        
        for (var i = 1; i < data.length; i++) {
          var row = {};
          headers.forEach(function(h, idx) {
            row[h] = data[i][idx];
          });
          
          var match = true;
          
          if (filters.action && row.Acao !== filters.action) match = false;
          if (filters.entity && row.Entidade !== filters.entity) match = false;
          if (filters.user && row.Email !== filters.user) match = false;
          if (filters.severity && row.Severidade !== filters.severity) match = false;
          if (filters.entityId && String(row.Registro_ID) !== String(filters.entityId)) match = false;
          
          if (filters.startDate) {
            var rowDate = new Date(row.Data_Hora);
            if (rowDate < new Date(filters.startDate)) match = false;
          }
          
          if (filters.endDate) {
            var rowDate2 = new Date(row.Data_Hora);
            if (rowDate2 > new Date(filters.endDate)) match = false;
          }
          
          if (match) {
            results.push(row);
          }
        }
        
        // Ordena por data decrescente
        results.sort(function(a, b) {
          return new Date(b.Data_Hora) - new Date(a.Data_Hora);
        });
        
        // Aplica limite
        if (filters.limit) {
          results = results.slice(0, filters.limit);
        }
        
        return { success: true, data: results, total: results.length };
        
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    
    /**
     * Obtém histórico de um registro específico
     * @param {string} entity - Entidade
     * @param {string|number} entityId - ID do registro
     * @returns {Object} Histórico
     */
    getHistory: function(entity, entityId) {
      return this.search({
        entity: entity,
        entityId: entityId
      });
    },
    
    /**
     * Gera relatório de auditoria
     * @param {Object} options - Opções
     * @returns {Object} Relatório
     */
    generateReport: function(options) {
      options = options || {};
      
      var searchResult = this.search(options);
      if (!searchResult.success) return searchResult;
      
      var records = searchResult.data;
      
      var report = {
        periodo: {
          inicio: options.startDate || 'início',
          fim: options.endDate || 'agora'
        },
        totalRegistros: records.length,
        porAcao: {},
        porEntidade: {},
        porUsuario: {},
        porSeveridade: {},
        acoesCriticas: []
      };
      
      records.forEach(function(r) {
        // Por ação
        report.porAcao[r.Acao] = (report.porAcao[r.Acao] || 0) + 1;
        
        // Por entidade
        if (r.Entidade) {
          report.porEntidade[r.Entidade] = (report.porEntidade[r.Entidade] || 0) + 1;
        }
        
        // Por usuário
        report.porUsuario[r.Email] = (report.porUsuario[r.Email] || 0) + 1;
        
        // Por severidade
        report.porSeveridade[r.Severidade] = (report.porSeveridade[r.Severidade] || 0) + 1;
        
        // Ações críticas
        if (r.Severidade === SEVERITY.CRITICAL || r.Severidade === SEVERITY.SECURITY) {
          report.acoesCriticas.push({
            data: r.Data_Hora,
            acao: r.Acao,
            usuario: r.Email,
            entidade: r.Entidade,
            observacoes: r.Observacoes
          });
        }
      });
      
      return { success: true, report: report };
    }
  };
})();


// ============================================================================
// TELEMETRIA - Métricas e Monitoramento
// ============================================================================

var Telemetry = (function() {
  
  var _metrics = {};
  var _startTimes = {};
  
  return {
    
    /**
     * Incrementa contador
     * @param {string} name - Nome da métrica
     * @param {number} [value=1] - Valor a incrementar
     * @param {Object} [tags] - Tags adicionais
     */
    increment: function(name, value, tags) {
      value = value || 1;
      var key = name + (tags ? '_' + JSON.stringify(tags) : '');
      _metrics[key] = (_metrics[key] || 0) + value;
    },
    
    /**
     * Define valor de gauge
     * @param {string} name - Nome da métrica
     * @param {number} value - Valor
     */
    gauge: function(name, value) {
      _metrics['gauge_' + name] = value;
    },
    
    /**
     * Inicia timer
     * @param {string} name - Nome do timer
     * @returns {string} ID do timer
     */
    startTimer: function(name) {
      var id = name + '_' + Date.now();
      _startTimes[id] = Date.now();
      return id;
    },
    
    /**
     * Para timer e registra duração
     * @param {string} timerId - ID do timer
     * @returns {number} Duração em ms
     */
    stopTimer: function(timerId) {
      var start = _startTimes[timerId];
      if (!start) return 0;
      
      var duration = Date.now() - start;
      delete _startTimes[timerId];
      
      var name = timerId.split('_')[0];
      this.recordDuration(name, duration);
      
      return duration;
    },
    
    /**
     * Registra duração
     * @param {string} name - Nome da operação
     * @param {number} duration - Duração em ms
     */
    recordDuration: function(name, duration) {
      var key = 'duration_' + name;
      if (!_metrics[key]) {
        _metrics[key] = { count: 0, total: 0, min: Infinity, max: 0 };
      }
      
      _metrics[key].count++;
      _metrics[key].total += duration;
      _metrics[key].min = Math.min(_metrics[key].min, duration);
      _metrics[key].max = Math.max(_metrics[key].max, duration);
    },
    
    /**
     * Obtém todas as métricas
     * @returns {Object}
     */
    getMetrics: function() {
      var result = {};
      
      for (var key in _metrics) {
        if (key.indexOf('duration_') === 0) {
          var m = _metrics[key];
          result[key] = {
            count: m.count,
            total: m.total,
            avg: m.count > 0 ? Math.round(m.total / m.count) : 0,
            min: m.min === Infinity ? 0 : m.min,
            max: m.max
          };
        } else {
          result[key] = _metrics[key];
        }
      }
      
      return result;
    },
    
    /**
     * Reseta métricas
     */
    reset: function() {
      _metrics = {};
      _startTimes = {};
    },
    
    /**
     * Wrapper para medir duração de função
     * @param {string} name - Nome da operação
     * @param {Function} fn - Função a executar
     * @returns {*} Resultado da função
     */
    measure: function(name, fn) {
      var timerId = this.startTimer(name);
      try {
        var result = fn();
        this.stopTimer(timerId);
        this.increment(name + '_success');
        return result;
      } catch (e) {
        this.stopTimer(timerId);
        this.increment(name + '_error');
        throw e;
      }
    }
  };
})();

// ============================================================================
// FUNÇÕES GLOBAIS DE CONVENIÊNCIA
// ============================================================================

/**
 * Registra evento de auditoria
 * @param {string} action - Tipo de ação
 * @param {string} entity - Entidade
 * @param {*} entityId - ID
 * @param {Object} [oldData] - Dados anteriores
 * @param {Object} [newData] - Dados novos
 */
function audit(action, entity, entityId, oldData, newData) {
  return AuditService.log({
    action: action,
    entity: entity,
    entityId: entityId,
    oldData: oldData,
    newData: newData
  });
}

/**
 * Registra auditoria de pagamento
 */
function auditPagamento(tipo, pagamentoId, dados, dadosAnteriores) {
  switch (tipo) {
    case 'criado':
      return AuditService.logPagamentoCriado(dados, dados.Nota_Fiscal_ID);
    case 'aprovado':
      return AuditService.logPagamentoAprovado(pagamentoId, dados.aprovador, dados.valor);
    case 'liquidado':
      return AuditService.logPagamentoLiquidado(pagamentoId, dados);
    case 'estornado':
      return AuditService.logPagamentoEstornado(pagamentoId, dados.motivo, dadosAnteriores);
    default:
      return AuditService.log({
        action: 'PAGAMENTO_' + tipo.toUpperCase(),
        entity: 'Pagamentos',
        entityId: pagamentoId,
        oldData: dadosAnteriores,
        newData: dados
      });
  }
}

/**
 * Registra auditoria de NF
 */
function auditNF(tipo, nfId, dados, dadosAnteriores) {
  switch (tipo) {
    case 'lancada':
      return AuditService.logNFLancada(dados);
    case 'atestada':
      return AuditService.logNFAtestada(nfId, dados.atestador, dados.processo);
    case 'glosada':
      return AuditService.logNFGlosada(nfId, dados.valor, dados.motivo, dadosAnteriores);
    default:
      return AuditService.log({
        action: 'NF_' + tipo.toUpperCase(),
        entity: 'NotasFiscais',
        entityId: nfId,
        oldData: dadosAnteriores,
        newData: dados
      });
  }
}

/**
 * Registra auditoria de cardápio
 */
function auditCardapio(tipo, cardapioId, dados) {
  switch (tipo) {
    case 'criado':
      return AuditService.logCardapioCriado(dados);
    case 'aprovado':
      return AuditService.logCardapioAprovado(cardapioId, dados.nutricionista, dados.crn);
    case 'publicado':
      return AuditService.logCardapioPublicado(cardapioId, dados.semana);
    default:
      return AuditService.log({
        action: 'CARDAPIO_' + tipo.toUpperCase(),
        entity: 'Cardapios_Base',
        entityId: cardapioId,
        newData: dados
      });
  }
}

/**
 * Busca histórico de auditoria de um registro
 */
function getAuditHistory(entity, entityId) {
  return AuditService.getHistory(entity, entityId);
}

/**
 * Gera relatório de auditoria
 */
function generateAuditReport(startDate, endDate) {
  return AuditService.generateReport({
    startDate: startDate,
    endDate: endDate
  });
}

/**
 * Exibe relatório de auditoria na UI
 */
function exibirRelatorioAuditoria() {
  var ui = SpreadsheetApp.getUi();
  
  // Últimos 30 dias
  var endDate = new Date();
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  var result = AuditService.generateReport({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  if (!result.success) {
    ui.alert('Erro', result.error, ui.ButtonSet.OK);
    return;
  }
  
  var report = result.report;
  
  var html = '<style>' +
    'body { font-family: Arial, sans-serif; padding: 16px; }' +
    'h2 { color: #2E7D32; }' +
    'h3 { color: #1565C0; margin-top: 20px; }' +
    '.stat { background: #E8F5E9; padding: 12px; border-radius: 8px; margin: 8px 0; }' +
    '.critical { background: #FFEBEE; border-left: 4px solid #C62828; padding: 8px; margin: 4px 0; }' +
    'table { border-collapse: collapse; width: 100%; margin-top: 8px; }' +
    'th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 12px; }' +
    'th { background: #2E7D32; color: white; }' +
    '</style>';
  
  html += '<h2>📊 Relatório de Auditoria</h2>';
  html += '<p>Período: ' + report.periodo.inicio.substring(0, 10) + ' a ' + report.periodo.fim.substring(0, 10) + '</p>';
  
  html += '<div class="stat"><strong>Total de Registros:</strong> ' + report.totalRegistros + '</div>';
  
  // Por Severidade
  html += '<h3>Por Severidade</h3><table><tr><th>Severidade</th><th>Quantidade</th></tr>';
  for (var sev in report.porSeveridade) {
    html += '<tr><td>' + sev + '</td><td>' + report.porSeveridade[sev] + '</td></tr>';
  }
  html += '</table>';
  
  // Por Ação (top 10)
  html += '<h3>Por Ação (Top 10)</h3><table><tr><th>Ação</th><th>Quantidade</th></tr>';
  var acoes = Object.keys(report.porAcao).sort(function(a, b) {
    return report.porAcao[b] - report.porAcao[a];
  }).slice(0, 10);
  acoes.forEach(function(acao) {
    html += '<tr><td>' + acao + '</td><td>' + report.porAcao[acao] + '</td></tr>';
  });
  html += '</table>';
  
  // Ações Críticas
  if (report.acoesCriticas.length > 0) {
    html += '<h3>⚠️ Ações Críticas</h3>';
    report.acoesCriticas.slice(0, 10).forEach(function(ac) {
      html += '<div class="critical">';
      html += '<strong>' + ac.acao + '</strong> - ' + ac.usuario + '<br>';
      html += '<small>' + ac.data + ' | ' + ac.entidade + '</small>';
      if (ac.observacoes) html += '<br><em>' + ac.observacoes + '</em>';
      html += '</div>';
    });
  }
  
  var htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(500)
    .setTitle('Relatório de Auditoria');
  
  ui.showModalDialog(htmlOutput, 'Relatório de Auditoria');
}

/**
 * Força gravação do buffer de auditoria
 */
function flushAuditBuffer() {
  AuditService.flush();
}

// ============================================================================
// REGISTRO DO MÓDULO
// ============================================================================

Logger.log('✅ Core_Audit_Service carregado - AuditService e Telemetry disponíveis');
