/**
 * @fileoverview Core Logger - Sistema de Logging Unificado
 * @version 6.0.0
 * @author UNIAE CRE Team
 * @created 2025-12-18
 * 
 * @description
 * Sistema profissional de logging com:
 * - Múltiplos níveis (DEBUG, INFO, WARN, ERROR)
 * - Formatação estruturada
 * - Persistência opcional em planilha
 * - Integração com Stackdriver
 * - Contexto automático (usuário, timestamp)
 * 
 * @requires V8 Runtime
 */

'use strict';

// ============================================================================
// CONFIGURAÇÃO DO LOGGER
// ============================================================================

/**
 * Níveis de log
 * @constant {Object}
 */
var LOG_LEVELS = {
  DEBUG: { value: 0, label: 'DEBUG', emoji: '🔍' },
  INFO: { value: 1, label: 'INFO', emoji: 'ℹ️' },
  WARN: { value: 2, label: 'WARN', emoji: '⚠️' },
  ERROR: { value: 3, label: 'ERROR', emoji: '❌' },
  AUDIT: { value: 4, label: 'AUDIT', emoji: '📋' }
};

/**
 * Configuração do logger
 * @constant {Object}
 */
var LOGGER_CONFIG = {
  /** Nível mínimo para exibição */
  MIN_LEVEL: LOG_LEVELS.INFO.value,
  
  /** Habilita persistência em planilha */
  PERSIST_TO_SHEET: false,
  
  /** Nome da aba de logs */
  LOG_SHEET: 'System_Logs',
  
  /** Máximo de logs em memória */
  MAX_BUFFER_SIZE: 500,
  
  /** Habilita console.log */
  CONSOLE_ENABLED: true,
  
  /** Habilita Logger.log */
  LOGGER_ENABLED: true
};

// ============================================================================
// MÓDULO DE LOGGING
// ============================================================================

/**
 * Sistema de Logging Unificado
 * @namespace AppLogger
 */
var AppLogger = (function() {
  
  // --------------------------------------------------------------------------
  // ESTADO INTERNO
  // --------------------------------------------------------------------------
  
  /** @type {Array} Buffer de logs */
  var _buffer = [];
  
  /** @type {Object} Configuração atual */
  var _config = Object.assign({}, LOGGER_CONFIG);
  
  /** @type {Object} Contadores por nível */
  var _counters = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    audit: 0
  };
  
  /** @type {string|null} Contexto global atual */
  var _context = null;
  
  // --------------------------------------------------------------------------
  // HELPERS PRIVADOS
  // --------------------------------------------------------------------------
  
  /**
   * Obtém timestamp formatado
   * @private
   * @returns {string} Timestamp
   */
  function _getTimestamp() {
    var now = new Date();
    return Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss.SSS');
  }
  
  /**
   * Obtém usuário atual
   * @private
   * @returns {string} Email do usuário
   */
  function _getUser() {
    try {
      return Session.getActiveUser().getEmail() || 'system';
    } catch (e) {
      return 'system';
    }
  }
  
  /**
   * Formata mensagem de log
   * @private
   * @param {Object} level - Nível do log
   * @param {string} message - Mensagem
   * @param {*} [data] - Dados adicionais
   * @returns {string} Mensagem formatada
   */
  function _formatMessage(level, message, data) {
    var parts = [
      '[' + _getTimestamp() + ']',
      level.emoji,
      level.label + ':',
      (_context ? '[' + _context + '] ' : '') + message
    ];
    
    if (data !== undefined) {
      if (data instanceof Error) {
        parts.push('| Error: ' + data.message);
        if (data.stack) {
          parts.push('\n' + data.stack);
        }
      } else if (typeof data === 'object') {
        try {
          parts.push('| ' + JSON.stringify(data));
        } catch (e) {
          parts.push('| [Object]');
        }
      } else {
        parts.push('| ' + String(data));
      }
    }
    
    return parts.join(' ');
  }
  
  /**
   * Cria entrada de log estruturada
   * @private
   * @param {Object} level - Nível
   * @param {string} message - Mensagem
   * @param {*} data - Dados
   * @returns {Object} Entrada de log
   */
  function _createEntry(level, message, data) {
    return {
      timestamp: new Date().toISOString(),
      level: level.label,
      message: (_context ? '[' + _context + '] ' : '') + message,
      data: data instanceof Error ? { message: data.message, stack: data.stack } : data,
      user: _getUser(),
      context: _context
    };
  }
  
  /**
   * Adiciona ao buffer
   * @private
   * @param {Object} entry - Entrada de log
   */
  function _addToBuffer(entry) {
    _buffer.push(entry);
    
    if (_buffer.length > _config.MAX_BUFFER_SIZE) {
      _buffer.shift();
    }
  }
  
  /**
   * Persiste log na planilha
   * @private
   * @param {Object} entry - Entrada de log
   */
  function _persistToSheet(entry) {
    if (!_config.PERSIST_TO_SHEET) return;
    
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(_config.LOG_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(_config.LOG_SHEET);
        sheet.appendRow(['Timestamp', 'Level', 'Message', 'Data', 'User']);
        sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#e8e8e8');
      }
      
      var dataStr = '';
      if (entry.data) {
        try {
          dataStr = JSON.stringify(entry.data);
        } catch (e) {
          dataStr = String(entry.data);
        }
      }
      
      sheet.appendRow([
        entry.timestamp,
        entry.level,
        entry.message,
        dataStr,
        entry.user
      ]);
      
    } catch (e) {
      console.error('Falha ao persistir log: ' + e.message);
    }
  }
  
  /**
   * Executa log
   * @private
   * @param {Object} level - Nível
   * @param {string} message - Mensagem
   * @param {*} [data] - Dados
   */
  function _log(level, message, data) {
    // Verifica nível mínimo
    if (level.value < _config.MIN_LEVEL) return;
    
    // Incrementa contador
    _counters[level.label.toLowerCase()]++;
    
    // Formata mensagem
    var formatted = _formatMessage(level, message, data);
    
    // Console
    if (_config.CONSOLE_ENABLED) {
      // Usa Logger.log ao invés de console para compatibilidade com produção
      Logger.log(formatted);
    }
    
    // Logger nativo
    if (_config.LOGGER_ENABLED) {
      Logger.log(formatted);
    }
    
    // Buffer e persistência
    var entry = _createEntry(level, message, data);
    _addToBuffer(entry);
    
    if (level.value >= LOG_LEVELS.WARN.value) {
      _persistToSheet(entry);
    }
  }
  
  // --------------------------------------------------------------------------
  // API PÚBLICA
  // --------------------------------------------------------------------------
  
  return {
    /** Níveis de log */
    LEVELS: LOG_LEVELS,
    
    /**
     * Define o nível mínimo de log
     * @param {string} level - Nível (DEBUG, INFO, WARN, ERROR)
     */
    setLevel: function(level) {
      if (level && LOG_LEVELS[level]) {
        _config.MIN_LEVEL = LOG_LEVELS[level].value;
      }
    },

    /**
     * Define o contexto global do logger
     * @param {string} context - Nome do contexto
     */
    setContext: function(context) {
      _context = context;
    },
    
    /**
     * Registra métricas de performance
     * @param {string} operation - Nome da operação
     * @param {number} durationMs - Duração em ms
     * @param {Object} [meta] - Metadados
     */
    performance: function(operation, durationMs, meta) {
      var data = Object.assign({ duration: durationMs }, meta || {});
      var emoji = durationMs < 100 ? '⚡' : durationMs < 500 ? '🔄' : '🐢';
      _log(LOG_LEVELS.INFO, emoji + ' PERFORMANCE: ' + operation + ' (' + durationMs + 'ms)', data);
    },
    
    /**
     * Timer helper para medir performance
     * @param {string} operation - Nome da operação
     * @returns {Function} Função para finalizar e logar
     */
    startTimer: function(operation) {
      var start = Date.now();
      var self = this;
      return function(meta) {
        var duration = Date.now() - start;
        self.performance(operation, duration, meta);
        return duration;
      };
    },
    
    /** Alias para withContext */
    createContext: function(context) {
      return this.withContext(context);
    },
    
    /**
     * Log de debug
     * @param {string} message - Mensagem
     * @param {*} [data] - Dados adicionais
     */
    debug: function(message, data) {
      _log(LOG_LEVELS.DEBUG, message, data);
    },
    
    /**
     * Log de informação
     * @param {string} message - Mensagem
     * @param {*} [data] - Dados adicionais
     */
    info: function(message, data) {
      _log(LOG_LEVELS.INFO, message, data);
    },
    
    /**
     * Log de aviso
     * @param {string} message - Mensagem
     * @param {*} [data] - Dados adicionais
     */
    warn: function(message, data) {
      _log(LOG_LEVELS.WARN, message, data);
    },
    
    /**
     * Log de erro
     * @param {string} message - Mensagem
     * @param {Error|*} [error] - Erro ou dados
     */
    error: function(message, error) {
      _log(LOG_LEVELS.ERROR, message, error);
    },
    
    /**
     * Log de auditoria
     * @param {string} action - Ação realizada
     * @param {Object} [details] - Detalhes
     */
    audit: function(action, details) {
      var entry = _createEntry(LOG_LEVELS.AUDIT, action, details);
      _addToBuffer(entry);
      _persistToSheet(entry);
      
      if (_config.CONSOLE_ENABLED) {
        Logger.log(_formatMessage(LOG_LEVELS.AUDIT, action, details));
      }
      
      _counters.audit++;
    },
    
    /**
     * Log genérico (compatibilidade)
     * @param {string} message - Mensagem
     * @param {*} [data] - Dados
     */
    log: function(message, data) {
      _log(LOG_LEVELS.INFO, message, data);
    },
    
    /**
     * Obtém logs do buffer
     * @param {Object} [options] - Opções de filtro
     * @param {string} [options.level] - Filtrar por nível
     * @param {number} [options.limit=50] - Limite de resultados
     * @returns {Array} Logs filtrados
     */
    getLogs: function(options) {
      options = options || {};
      var limit = options.limit || 50;
      var level = options.level ? options.level.toUpperCase() : null;
      
      var logs = _buffer;
      
      if (level) {
        logs = logs.filter(function(entry) {
          return entry.level === level;
        });
      }
      
      return logs.slice(-limit).reverse();
    },
    
    /**
     * Obtém estatísticas
     * @returns {Object} Estatísticas de logging
     */
    getStats: function() {
      return {
        bufferSize: _buffer.length,
        counters: Object.assign({}, _counters),
        config: {
          minLevel: _config.MIN_LEVEL,
          persistToSheet: _config.PERSIST_TO_SHEET
        }
      };
    },
    
    /**
     * Limpa buffer de logs
     */
    clearBuffer: function() {
      _buffer = [];
    },
    
    /**
     * Configura o logger
     * @param {Object} options - Opções
     */
    configure: function(options) {
      if (options.minLevel !== undefined) {
        _config.MIN_LEVEL = options.minLevel;
      }
      if (options.persistToSheet !== undefined) {
        _config.PERSIST_TO_SHEET = options.persistToSheet;
      }
      if (options.logSheet) {
        _config.LOG_SHEET = options.logSheet;
      }
      if (options.consoleEnabled !== undefined) {
        _config.CONSOLE_ENABLED = options.consoleEnabled;
      }
    },
    
    /**
     * Cria logger com contexto
     * @param {string} context - Nome do contexto/módulo
     * @returns {Object} Logger contextualizado
     */
    withContext: function(context) {
      var self = this;
      return {
        debug: function(msg, data) { self.debug('[' + context + '] ' + msg, data); },
        info: function(msg, data) { self.info('[' + context + '] ' + msg, data); },
        warn: function(msg, data) { self.warn('[' + context + '] ' + msg, data); },
        error: function(msg, data) { self.error('[' + context + '] ' + msg, data); },
        audit: function(action, details) { 
          details = details || {};
          details.context = context;
          self.audit(action, details); 
        }
      };
    }
  };
})();

// ============================================================================
// ALIAS GLOBAL PARA COMPATIBILIDADE
// ============================================================================

/**
 * @deprecated Use AppLogger
 */
var UnifiedLogger = AppLogger;

// ============================================================================
// REGISTRO DO MÓDULO
// ============================================================================

Logger.log('✅ Core_Logger carregado - AppLogger disponível');
