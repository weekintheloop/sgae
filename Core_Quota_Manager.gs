/**
 * @fileoverview Gerenciador de Cotas do Google Apps Script
 * @version 5.0.0
 *
 * Controla e monitora os limites de uso do Google Apps Script
 * para evitar erros de cota excedida.
 *
 * LIMITES DA VERSÃO GRATUITA (Consumer/Gmail):
 * - Tempo de execução: 6 minutos por execução
 * - Triggers: 90 minutos/dia total
 * - Emails: 100/dia
 * - Leituras de planilha: 20.000/dia
 * - Escritas de planilha: 20.000/dia
 * - Chamadas UrlFetch: 20.000/dia
 * - Propriedades: 500KB total, 9KB por valor
 * - Cache: 100KB por valor, 25MB total
 *
 * @author UNIAE CRE Team
 * @created 2025-12-04
 */

'use strict';

/**
 * Limites do Google Apps Script (versão gratuita)
 */
var GAS_LIMITS = {
  // Tempo de execução
  EXECUTION_TIME_MS: 360000,        // 6 minutos = 360.000ms
  EXECUTION_WARNING_MS: 300000,     // Aviso aos 5 minutos

  // Triggers
  TRIGGER_TOTAL_MINUTES: 90,        // 90 minutos/dia

  // Emails
  EMAILS_PER_DAY: 100,
  EMAIL_RECIPIENTS_PER_MESSAGE: 50,

  // Operações de planilha
  SPREADSHEET_READS_PER_DAY: 20000,
  SPREADSHEET_WRITES_PER_DAY: 20000,

  // URL Fetch
  URL_FETCH_PER_DAY: 20000,
  URL_FETCH_SIZE_MB: 50,

  // Properties Service
  PROPERTIES_TOTAL_KB: 500,
  PROPERTIES_VALUE_KB: 9,

  // Cache Service
  CACHE_VALUE_KB: 100,
  CACHE_TOTAL_MB: 25,

  // Outros
  SIMULTANEOUS_EXECUTIONS: 30,
  CUSTOM_FUNCTIONS_PER_SHEET: 1000
};

/**
 * Gerenciador de Cotas
 */
var QuotaManager = (function() {

  var startTime = null;
  var operationCounts = {
    reads: 0,
    writes: 0,
    emails: 0,
    urlFetch: 0
  };

  // ============================================================================
  // CONTROLE DE TEMPO DE EXECUÇÃO
  // ============================================================================

  /**
   * Inicia o monitoramento de tempo
   */
  function startTimer() {
    startTime = new Date().getTime();
    return startTime;
  }

  /**
   * Obtém tempo decorrido em ms
   * @returns {number}
   */
  function getElapsedTime() {
    if (!startTime) return 0;
    return new Date().getTime() - startTime;
  }

  /**
   * Obtém tempo restante em ms
   * @returns {number}
   */
  function getRemainingTime() {
    return GAS_LIMITS.EXECUTION_TIME_MS - getElapsedTime();
  }

  /**
   * Verifica se está próximo do limite de tempo
   * @param {number} [bufferMs=60000] - Buffer de segurança em ms (padrão 1 min)
   * @returns {boolean}
   */
  function isNearTimeLimit(bufferMs) {
    bufferMs = bufferMs || 60000;
    return getRemainingTime() < bufferMs;
  }

  /**
   * Verifica se deve parar a execução
   * @returns {boolean}
   */
  function shouldStop() {
    return isNearTimeLimit(30000); // Para com 30s de margem
  }

  /**
   * Lança erro se tempo excedido
   * @param {string} [operation] - Nome da operação
   */
  function checkTimeLimit(operation) {
    if (shouldStop()) {
      var msg = 'Tempo de execução próximo do limite';
      if (operation) msg += ' durante: ' + operation;
      throw new Error(msg + '. Tempo restante: ' + Math.round(getRemainingTime() / 1000) + 's');
    }
  }

  // ============================================================================
  // CONTROLE DE OPERAÇÕES
  // ============================================================================

  /**
   * Registra operação de leitura
   * @param {number} [count=1] - Número de operações
   */
  function trackRead(count) {
    operationCounts.reads += (count || 1);
  }

  /**
   * Registra operação de escrita
   * @param {number} [count=1] - Número de operações
   */
  function trackWrite(count) {
    operationCounts.writes += (count || 1);
  }

  /**
   * Registra envio de email
   */
  function trackEmail() {
    operationCounts.emails++;
  }

  /**
   * Registra chamada URL Fetch
   */
  function trackUrlFetch() {
    operationCounts.urlFetch++;
  }

  /**
   * Obtém contadores de operações
   * @returns {Object}
   */
  function getOperationCounts() {
    return Object.assign({}, operationCounts);
  }

  /**
   * Reseta contadores
   */
  function resetCounters() {
    operationCounts = { reads: 0, writes: 0, emails: 0, urlFetch: 0 };
    startTime = null;
  }

  // ============================================================================
  // CONTROLE DE COTA DIÁRIA
  // ============================================================================

  /**
   * Obtém uso diário do cache
   * @returns {Object}
   */
  function getDailyUsage() {
    try {
      var cache = CacheService.getScriptCache();
      var today = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
      var key = 'quota_usage_' + today;
      var data = cache.get(key);

      if (data) {
        return JSON.parse(data);
      }

      return {
        date: today,
        reads: 0,
        writes: 0,
        emails: 0,
        urlFetch: 0,
        executions: 0,
        totalTimeMs: 0
      };
    } catch (e) {
      return { date: '', reads: 0, writes: 0, emails: 0, urlFetch: 0, executions: 0, totalTimeMs: 0 };
    }
  }

  /**
   * Salva uso diário no cache
   * @param {Object} usage - Dados de uso
   */
  function saveDailyUsage(usage) {
    try {
      var cache = CacheService.getScriptCache();
      var today = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
      var key = 'quota_usage_' + today;
      cache.put(key, JSON.stringify(usage), 86400); // 24 horas
    } catch (e) {
      // Ignora erros de cache
    }
  }

  /**
   * Atualiza uso diário
   */
  function updateDailyUsage() {
    var usage = getDailyUsage();
    usage.reads += operationCounts.reads;
    usage.writes += operationCounts.writes;
    usage.emails += operationCounts.emails;
    usage.urlFetch += operationCounts.urlFetch;
    usage.executions++;
    usage.totalTimeMs += getElapsedTime();
    saveDailyUsage(usage);
    return usage;
  }

  /**
   * Verifica se cota diária está próxima do limite
   * @param {string} type - Tipo de operação (reads, writes, emails, urlFetch)
   * @param {number} [threshold=0.9] - Percentual do limite (padrão 90%)
   * @returns {boolean}
   */
  function isNearDailyLimit(type, threshold) {
    threshold = threshold || 0.9;
    var usage = getDailyUsage();
    var limits = {
      reads: GAS_LIMITS.SPREADSHEET_READS_PER_DAY,
      writes: GAS_LIMITS.SPREADSHEET_WRITES_PER_DAY,
      emails: GAS_LIMITS.EMAILS_PER_DAY,
      urlFetch: GAS_LIMITS.URL_FETCH_PER_DAY
    };

    var limit = limits[type];
    if (!limit) return false;

    return (usage[type] || 0) >= limit * threshold;
  }

  // ============================================================================
  // COTA DE EMAIL
  // ============================================================================

  /**
   * Obtém cota de email restante
   * @returns {number}
   */
  function getRemainingEmailQuota() {
    try {
      return MailApp.getRemainingDailyQuota();
    } catch (e) {
      return -1;
    }
  }

  /**
   * Verifica se pode enviar email
   * @param {number} [count=1] - Número de emails a enviar
   * @returns {boolean}
   */
  function canSendEmail(count) {
    count = count || 1;
    var remaining = getRemainingEmailQuota();
    return remaining >= count;
  }

  // ============================================================================
  // RELATÓRIO DE USO
  // ============================================================================

  /**
   * Gera relatório de uso de cotas
   * @returns {Object}
   */
  function generateReport() {
    var usage = getDailyUsage();
    var elapsed = getElapsedTime();
    var remaining = getRemainingTime();
    var emailQuota = getRemainingEmailQuota();

    return {
      timestamp: new Date().toISOString(),

      // Execução atual
      currentExecution: {
        elapsedMs: elapsed,
        elapsedFormatted: formatTime(elapsed),
        remainingMs: remaining,
        remainingFormatted: formatTime(remaining),
        percentUsed: Math.round((elapsed / GAS_LIMITS.EXECUTION_TIME_MS) * 100)
      },

      // Operações da execução atual
      currentOperations: getOperationCounts(),

      // Uso diário
      dailyUsage: {
        reads: {
          used: usage.reads,
          limit: GAS_LIMITS.SPREADSHEET_READS_PER_DAY,
          percent: Math.round((usage.reads / GAS_LIMITS.SPREADSHEET_READS_PER_DAY) * 100)
        },
        writes: {
          used: usage.writes,
          limit: GAS_LIMITS.SPREADSHEET_WRITES_PER_DAY,
          percent: Math.round((usage.writes / GAS_LIMITS.SPREADSHEET_WRITES_PER_DAY) * 100)
        },
        emails: {
          used: GAS_LIMITS.EMAILS_PER_DAY - emailQuota,
          remaining: emailQuota,
          limit: GAS_LIMITS.EMAILS_PER_DAY,
          percent: Math.round(((GAS_LIMITS.EMAILS_PER_DAY - emailQuota) / GAS_LIMITS.EMAILS_PER_DAY) * 100)
        },
        executions: usage.executions,
        totalTimeMs: usage.totalTimeMs
      },

      // Alertas
      alerts: generateAlerts(usage, elapsed, emailQuota)
    };
  }

  /**
   * Gera alertas baseado no uso
   * @private
   */
  function generateAlerts(usage, elapsed, emailQuota) {
    var alerts = [];

    // Tempo de execução
    if (elapsed > GAS_LIMITS.EXECUTION_WARNING_MS) {
      alerts.push({
        type: 'WARNING',
        message: 'Tempo de execução acima de 5 minutos'
      });
    }

    // Leituras
    if (usage.reads > GAS_LIMITS.SPREADSHEET_READS_PER_DAY * 0.8) {
      alerts.push({
        type: usage.reads > GAS_LIMITS.SPREADSHEET_READS_PER_DAY * 0.95 ? 'CRITICAL' : 'WARNING',
        message: 'Cota de leituras em ' + Math.round((usage.reads / GAS_LIMITS.SPREADSHEET_READS_PER_DAY) * 100) + '%'
      });
    }

    // Escritas
    if (usage.writes > GAS_LIMITS.SPREADSHEET_WRITES_PER_DAY * 0.8) {
      alerts.push({
        type: usage.writes > GAS_LIMITS.SPREADSHEET_WRITES_PER_DAY * 0.95 ? 'CRITICAL' : 'WARNING',
        message: 'Cota de escritas em ' + Math.round((usage.writes / GAS_LIMITS.SPREADSHEET_WRITES_PER_DAY) * 100) + '%'
      });
    }

    // Emails
    if (emailQuota < 10) {
      alerts.push({
        type: emailQuota < 5 ? 'CRITICAL' : 'WARNING',
        message: 'Apenas ' + emailQuota + ' emails restantes hoje'
      });
    }

    return alerts;
  }

  /**
   * Formata tempo em ms para string legível
   * @private
   */
  function formatTime(ms) {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return Math.round(ms / 1000) + 's';
    var minutes = Math.floor(ms / 60000);
    var seconds = Math.round((ms % 60000) / 1000);
    return minutes + 'm ' + seconds + 's';
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  return {
    // Constantes
    LIMITS: GAS_LIMITS,

    // Tempo
    startTimer: startTimer,
    getElapsedTime: getElapsedTime,
    getRemainingTime: getRemainingTime,
    isNearTimeLimit: isNearTimeLimit,
    shouldStop: shouldStop,
    checkTimeLimit: checkTimeLimit,

    // Operações
    trackRead: trackRead,
    trackWrite: trackWrite,
    trackEmail: trackEmail,
    trackUrlFetch: trackUrlFetch,
    getOperationCounts: getOperationCounts,
    resetCounters: resetCounters,

    // Uso diário
    getDailyUsage: getDailyUsage,
    updateDailyUsage: updateDailyUsage,
    isNearDailyLimit: isNearDailyLimit,

    // Email
    getRemainingEmailQuota: getRemainingEmailQuota,
    canSendEmail: canSendEmail,

    // Relatório
    generateReport: generateReport
  };
})();

// ============================================================================
// FUNÇÕES GLOBAIS DE CONVENIÊNCIA
// ============================================================================

/**
 * Inicia monitoramento de cota para uma execução
 */
function initQuotaMonitoring() {
  QuotaManager.startTimer();
  QuotaManager.resetCounters();
}

/**
 * Finaliza monitoramento e atualiza uso diário
 * @returns {Object} Relatório de uso
 */
function finalizeQuotaMonitoring() {
  var report = QuotaManager.generateReport();
  QuotaManager.updateDailyUsage();
  return report;
}

/**
 * Verifica se deve continuar processamento
 * @param {string} [operation] - Nome da operação atual
 * @returns {boolean}
 */
function canContinueProcessing(operation) {
  if (QuotaManager.shouldStop()) {
    Logger.log('⚠️ Parando processamento: tempo limite próximo' + (operation ? ' em ' + operation : ''));
    return false;
  }
  return true;
}

/**
 * Executa função com controle de cota
 * @param {Function} fn - Função a executar
 * @param {string} name - Nome da função
 * @returns {Object} Resultado
 */
function executeWithQuotaControl(fn, name) {
  initQuotaMonitoring();

  try {
    var result = fn();
    var report = finalizeQuotaMonitoring();

    // Log se houver alertas
    if (report.alerts && report.alerts.length > 0) {
      report.alerts.forEach(function(alert) {
        Logger.log('[' + alert.type + '] ' + alert.message);
      });
    }

    return {
      success: true,
      result: result,
      quotaReport: report
    };

  } catch (e) {
    var report = finalizeQuotaMonitoring();
    Logger.log('[ERROR] Erro em ' + name + ': ' + e.message);

    return {
      success: false,
      error: e.message,
      quotaReport: report
    };
  }
}

// ============================================================================
// FUNÇÕES DE DIAGNÓSTICO
// ============================================================================

/**
 * Exibe relatório de cotas no log
 */
function exibirRelatorioCotas() {
  initQuotaMonitoring();

  // Simula algumas operações
  Utilities.sleep(100);

  var report = QuotaManager.generateReport();

  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('   RELATÓRIO DE COTAS - GOOGLE APPS SCRIPT');
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('');
  Logger.log('📊 LIMITES DA VERSÃO GRATUITA:');
  Logger.log('   • Tempo de execução: 6 minutos');
  Logger.log('   • Leituras/dia: 20.000');
  Logger.log('   • Escritas/dia: 20.000');
  Logger.log('   • Emails/dia: 100');
  Logger.log('   • URL Fetch/dia: 20.000');
  Logger.log('');
  Logger.log('📈 USO ATUAL:');
  Logger.log('   • Tempo decorrido: ' + report.currentExecution.elapsedFormatted);
  Logger.log('   • Tempo restante: ' + report.currentExecution.remainingFormatted);
  Logger.log('');
  Logger.log('📧 EMAILS:');
  Logger.log('   • Restantes hoje: ' + report.dailyUsage.emails.remaining);
  Logger.log('   • Usados: ' + report.dailyUsage.emails.used + '/' + report.dailyUsage.emails.limit);
  Logger.log('');

  if (report.alerts.length > 0) {
    Logger.log('⚠️ ALERTAS:');
    report.alerts.forEach(function(alert) {
      Logger.log('   • [' + alert.type + '] ' + alert.message);
    });
  } else {
    Logger.log('✅ Nenhum alerta de cota');
  }

  Logger.log('');
  Logger.log('═══════════════════════════════════════════════════════════');

  return report;
}

/**
 * Testa limites de tempo
 */
function testarLimiteTempo() {
  Logger.log('=== TESTE DE LIMITE DE TEMPO ===');

  initQuotaMonitoring();

  Logger.log('Tempo inicial: ' + QuotaManager.getElapsedTime() + 'ms');
  Logger.log('Tempo restante: ' + QuotaManager.getRemainingTime() + 'ms');
  Logger.log('Deve parar: ' + QuotaManager.shouldStop());

  // Simula processamento
  for (var i = 0; i < 5; i++) {
    Utilities.sleep(1000);
    Logger.log('Após ' + (i + 1) + 's: ' + QuotaManager.getElapsedTime() + 'ms');

    if (!canContinueProcessing('teste')) {
      Logger.log('Processamento interrompido!');
      break;
    }
  }

  Logger.log('=== FIM DO TESTE ===');
}

// Registro do módulo
Logger.log('✅ Core_Quota_Manager carregado');
