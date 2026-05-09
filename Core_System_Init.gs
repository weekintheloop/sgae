/**
 * @fileoverview Inicialização Centralizada do Sistema
 * @version 6.0.0
 * @description Ponto de entrada único para inicialização do sistema,
 * garantindo ordem correta de carregamento e configuração.
 * 
 * @author UNIAE CRE Team
 * @created 2025-12-08
 */

'use strict';

/**
 * Estado global de inicialização
 */
var SystemInit = (function() {

  var state = {
    initialized: false,
    startTime: null,
    modules: {},
    errors: [],
    warnings: []
  };

  // ============================================================================
  // INICIALIZAÇÃO PRINCIPAL
  // ============================================================================

  /**
   * Inicializa o sistema completo
   * @param {Object} [options] - Opções de inicialização
   * @returns {Object} Resultado da inicialização
   */
  function initialize(options) {
    options = options || {};

    if (state.initialized && !options.force) {
      return {
        success: true,
        message: 'Sistema já inicializado',
        state: getState()
      };
    }

    state.startTime = Date.now();
    state.errors = [];
    state.warnings = [];
    state.modules = {};

    Logger.log('');
    Logger.log('╔═══════════════════════════════════════════════════════════╗');
    Logger.log('║     INICIALIZANDO SISTEMA UNIAE CRE v6.0.0               ║');
    Logger.log('╠═══════════════════════════════════════════════════════════╣');
    Logger.log('║ ' + new Date().toISOString() + '                    ║');
    Logger.log('╚═══════════════════════════════════════════════════════════╝');
    Logger.log('');

    // Fase 1: Módulos Fundamentais
    Logger.log('📦 FASE 1: Módulos Fundamentais');
    initModule('SafeGlobals', function() {
      return typeof safeGet === 'function' && typeof AppLogger !== 'undefined';
    });
    initModule('Schema', function() {
      return typeof SCHEMA !== 'undefined';
    });
    initModule('Config', function() {
      return typeof SYSTEM_CONFIG !== 'undefined';
    });
    initModule('Constants', function() {
      return typeof CONSTANTS !== 'undefined';
    });

    // Fase 2: Infraestrutura
    Logger.log('');
    Logger.log('📦 FASE 2: Infraestrutura');
    initModule('Cache', function() {
      return typeof getCachedSheet === 'function';
    });
    initModule('Logger', function() {
      return typeof AppLogger !== 'undefined' && typeof AppLogger.info === 'function';
    });
    initModule('ErrorHandler', function() {
      return typeof ErrorHandler !== 'undefined';
    });
    initModule('QuotaManager', function() {
      if (typeof QuotaManager !== 'undefined') {
        QuotaManager.startTimer();
        return true;
      }
      return false;
    });

    // Fase 3: Serviços Core
    Logger.log('');
    Logger.log('📦 FASE 3: Serviços Core');
    initModule('ValidationUtils', function() {
      return typeof ValidationUtils !== 'undefined';
    });
    initModule('CRUD', function() {
      return typeof CRUD !== 'undefined';
    });
    initModule('BatchOperations', function() {
      return typeof BatchOperations !== 'undefined';
    });
    initModule('Auth', function() {
      return typeof AUTH !== 'undefined';
    });

    // Fase 4: Módulos Avançados
    Logger.log('');
    Logger.log('📦 FASE 4: Módulos Avançados');
    initModule('RetryStrategy', function() {
      return typeof RetryStrategy !== 'undefined';
    });
    initModule('Transaction', function() {
      return typeof Transaction !== 'undefined';
    });
    initModule('DataIntegrity', function() {
      return typeof DataIntegrity !== 'undefined';
    });
    initModule('Metrics', function() {
      if (typeof Metrics !== 'undefined') {
        Metrics.recordSystemMetrics();
        return true;
      }
      return false;
    });

    // Fase 5: Comunicação e Eventos
    Logger.log('');
    Logger.log('📦 FASE 5: Comunicação e Eventos');
    initModule('EventBus', function() {
      if (typeof EventBus !== 'undefined') {
        // Verifica se registerSystemHandlers existe antes de chamar
        if (typeof EventBus.registerSystemHandlers === 'function') {
          try {
            EventBus.registerSystemHandlers();
          } catch (e) {
            Logger.log('   ⚠️ EventBus.registerSystemHandlers: ' + e.message);
          }
        }
        return true;
      }
      return false;
    });
    initModule('ApiResponse', function() {
      return typeof ApiResponse !== 'undefined';
    });
    initModule('ServiceContainer', function() {
      if (typeof ServiceContainer !== 'undefined') {
        // registerDefaultServices() já é chamado automaticamente ao carregar Core_Service_Container.gs
        return true;
      }
      return false;
    });

    // Fase 6: Feature Flags e Rate Limiting
    Logger.log('');
    Logger.log('📦 FASE 6: Controle e Segurança');
    initModule('FeatureFlags', function() {
      return typeof FeatureFlags !== 'undefined';
    });
    initModule('RateLimiter', function() {
      return typeof RateLimiter !== 'undefined';
    });

    // Fase 7: Migrations (opcional)
    if (options.runMigrations) {
      Logger.log('');
      Logger.log('📦 FASE 7: Migrations');
      initModule('Migrations', function() {
        if (typeof Migrations !== 'undefined') {
          var status = Migrations.status();
          if (!status.isUpToDate) {
            Logger.log('   ⚠️ ' + status.pendingCount + ' migrations pendentes');
            if (options.autoMigrate) {
              var result = Migrations.migrate();
              return result.success;
            }
          }
          return true;
        }
        return false;
      });
    }

    // Calcula resultado
    var elapsed = Date.now() - state.startTime;
    var loadedCount = Object.values(state.modules).filter(function(v) { return v; }).length;
    var totalCount = Object.keys(state.modules).length;
    var successRate = Math.round((loadedCount / totalCount) * 100);

    state.initialized = state.errors.length === 0 || successRate >= 70;

    // Emite evento de inicialização (com verificação segura)
    if (typeof EventBus !== 'undefined' && typeof EventBus.publish === 'function') {
      try {
        EventBus.publish('system:startup', {
          success: state.initialized,
          modules: loadedCount,
          elapsed: elapsed
        });
      } catch (e) {
        // Silencia erro se EventBus não estiver pronto
        Logger.log('   ⚠️ EventBus não disponível para evento de startup');
      }
    }

    // Log final
    Logger.log('');
    Logger.log('╔═══════════════════════════════════════════════════════════╗');
    Logger.log('║     RESULTADO DA INICIALIZAÇÃO                           ║');
    Logger.log('╠═══════════════════════════════════════════════════════════╣');
    Logger.log('║ Módulos: ' + loadedCount + '/' + totalCount + ' (' + successRate + '%)');
    Logger.log('║ Tempo: ' + elapsed + 'ms');
    Logger.log('║ Status: ' + (state.initialized ? '✅ SUCESSO' : '❌ FALHA'));
    
    if (state.errors.length > 0) {
      Logger.log('║ Erros: ' + state.errors.length);
    }
    if (state.warnings.length > 0) {
      Logger.log('║ Avisos: ' + state.warnings.length);
    }
    
    Logger.log('╚═══════════════════════════════════════════════════════════╝');

    return {
      success: state.initialized,
      modules: loadedCount,
      total: totalCount,
      elapsed: elapsed,
      errors: state.errors,
      warnings: state.warnings
    };
  }

  /**
   * Inicializa um módulo específico
   * @private
   */
  function initModule(name, checkFn) {
    try {
      var loaded = checkFn();
      state.modules[name] = loaded;

      if (loaded) {
        Logger.log('   ✅ ' + name);
      } else {
        Logger.log('   ⚠️ ' + name + ' (não disponível)');
        state.warnings.push(name + ' não carregado');
      }

      return loaded;
    } catch (e) {
      state.modules[name] = false;
      state.errors.push(name + ': ' + e.message);
      Logger.log('   ❌ ' + name + ' - ' + e.message);
      return false;
    }
  }

  /**
   * Obtém estado atual
   * @returns {Object}
   */
  function getState() {
    return {
      initialized: state.initialized,
      startTime: state.startTime,
      modules: Object.assign({}, state.modules),
      errors: state.errors.slice(),
      warnings: state.warnings.slice()
    };
  }

  /**
   * Verifica se sistema está pronto
   * @returns {boolean}
   */
  function isReady() {
    return state.initialized;
  }

  /**
   * Reseta estado (para testes)
   */
  function reset() {
    state = {
      initialized: false,
      startTime: null,
      modules: {},
      errors: [],
      warnings: []
    };
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  return {
    initialize: initialize,
    getState: getState,
    isReady: isReady,
    reset: reset
  };
})();

// ============================================================================
// FUNÇÕES GLOBAIS
// ============================================================================

/**
 * Inicializa o sistema (chamada principal)
 */
function initSystem(options) {
  return SystemInit.initialize(options);
}

/**
 * Verifica se sistema está pronto
 */
function isSystemReady() {
  return SystemInit.isReady();
}

/**
 * Inicialização rápida (sem logs detalhados)
 */
function quickInit() {
  return SystemInit.initialize({ silent: true });
}

/**
 * Inicialização completa com migrations
 */
function fullInit() {
  return SystemInit.initialize({ 
    runMigrations: true,
    autoMigrate: false 
  });
}

// Log de carregamento
Logger.log('✅ Core_System_Init.gs carregado');
