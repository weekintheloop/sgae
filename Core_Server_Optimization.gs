/**
 * @fileoverview Funções Server-Side para Dashboard de Otimização
 * @version 4.0.0
 * 
 * Dependências:
 * - Core_UI_Safe.gs (getSafeUi, safeAlert, safePrompt)
 * - Core_Cache_Advanced.gs (AdvancedCache)
 * - Core_Performance_Monitor.gs (PerformanceMonitor)
 */

'use strict';

// Usa funções de Core_UI_Safe.gs (getSafeUi, safeAlert, safePrompt)


/**
 * Abre o dashboard de otimização
 */
function openOptimizationDashboard() {
  try {
    var ui = SpreadsheetApp.getUi();
    var html = HtmlService.createHtmlOutputFromFile('Dashboard_Optimization')
      .setWidth(1200)
      .setHeight(800)
      .setTitle('Dashboard de Otimização');
    
    ui.showModalDialog(html, 'Dashboard de Otimização');
  } catch (e) {
    console.log('⚠️ Dashboard não pode ser aberto neste contexto');
    console.log('Execute esta função a partir do menu da planilha');
    return null;
  }
}

/**
 * Obtém dados para o dashboard (versão otimizada)
 * @deprecated Use getDashboardMetricsUnificado() de Core_CRUD_Frontend_Bridge.gs
 */
function getDashboardData_Optimized() {
  try {
    var report = OptimizedAPI.getPerformanceReport();
    var health = OptimizedAPI.healthCheck();
    var metrics = OptimizedAPI.getMetrics();
    
    return {
      metrics: {
        cache: {
          hitRate: metrics.cache.hitRate,
          hits: metrics.cache.hits,
          misses: metrics.cache.misses,
          memorySize: metrics.cache.memorySize
        },
        performance: {
          total: report.operations.total,
          slow: report.operations.slow,
          avgDuration: report.operations.avgDuration,
          maxDuration: report.operations.maxDuration
        },
        queries: {
          totalIndices: metrics.queries.indices,
          suggestions: metrics.queries.suggestions.length
        }
      },
      health: health,
      performance: {
        total: report.operations.total,
        slow: report.operations.slow,
        avgDuration: report.operations.avgDuration,
        maxDuration: report.operations.maxDuration
      },
      cache: {
        hitRate: metrics.cache.hitRate,
        hits: metrics.cache.hits,
        misses: metrics.cache.misses,
        memorySize: metrics.cache.memorySize
      },
      queries: {
        totalIndices: metrics.queries.indices,
        suggestions: metrics.queries.suggestions.length
      },
      recommendations: report.recommendations || [],
      bottlenecks: report.bottlenecks || []
    };
  } catch (e) {
    AppLogger.error('Erro ao obter dados do dashboard', e);
    throw new Error('Erro ao carregar dados: ' + e.message);
  }
}

/**
 * Executa manutenção
 */
function runMaintenance() {
  try {
    return OptimizedAPI.maintenance();
  } catch (e) {
    AppLogger.error('Erro ao executar manutenção', e);
    throw new Error('Erro na manutenção: ' + e.message);
  }
}

/**
 * Limpa todo o cache
 */
function clearAllCache() {
  try {
    AdvancedCache.clear();
    return { success: true };
  } catch (e) {
    AppLogger.error('Erro ao limpar cache', e);
    throw new Error('Erro ao limpar cache: ' + e.message);
  }
}

/**
 * Adiciona item ao menu
 */
function addOptimizationMenuItems() {
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🚀 Otimização')
    .addItem('📊 Dashboard', 'openOptimizationDashboard')
    .addSeparator()
    .addItem('🔄 Inicializar Sistema', 'initializeOptimizedSystem')
    .addItem('🧹 Executar Manutenção', 'runMaintenanceFromMenu')
    .addItem('🗑️ Limpar Cache', 'clearCacheFromMenu')
    .addSeparator()
    .addItem('🧪 Executar Testes', 'runOptimizationTests')
    .addItem('📈 Comparar Performance', 'test_PerformanceComparison')
    .addItem('💪 Teste de Stress', 'test_StressTest')
    .addSeparator()
    .addSubMenu(ui.createMenu('📚 Exemplos')
      .addItem('1. Listar com Cache', 'exemplo1_ListarNotasComCache')
      .addItem('2. Importação em Lote', 'exemplo2_ImportacaoEmLote')
      .addItem('3. Busca Otimizada', 'exemplo3_BuscaOtimizada')
      .addItem('8. Analisar Performance', 'exemplo8_AnalisarPerformance')
      .addItem('9. Relatório Completo', 'exemplo9_RelatorioCompleto')
      .addItem('10. Health Check', 'exemplo10_HealthCheck'))
    .addToUi();
}

/**
 * Executa manutenção via menu
 */
function runMaintenanceFromMenu() {
  try {
    var result = OptimizedAPI.maintenance();
    
    try {
      var ui = SpreadsheetApp.getUi();
      var message = 'Manutenção executada com sucesso!\n\n';
      message += 'Índices limpos: ' + result.indicesCleaned + '\n';
      message += 'Rate limiters limpos: ' + (result.rateLimiterCleaned ? 'Sim' : 'Não');
      
      if (result.metricsCleared) {
        message += '\nMétricas antigas limpas';
      }
      
      ui.alert('Manutenção', message, ui.ButtonSet.OK);
    } catch (uiError) {
      // UI não disponível, apenas logar
      console.log('Manutenção executada: ' + JSON.stringify(result));
    }
  } catch (e) {
    console.error('Erro ao executar manutenção: ' + e.message);
  }
}

/**
 * Limpa cache via menu
 */
function clearCacheFromMenu() {
  try {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert('Limpar Cache', 
      'Tem certeza que deseja limpar todo o cache?', 
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      AdvancedCache.clear();
      ui.alert('Sucesso', 'Cache limpo com sucesso!', ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('Erro', 'Erro ao limpar cache: ' + e.message, 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Função de compatibilidade - não usar como trigger
 * Use onOpen() de Code.gs como trigger principal
 * @private
 */
function _serverOpt_onOpenCompat() {
  if (typeof onOpenWithSetup === 'function') {
    onOpenWithSetup();
  }
}
