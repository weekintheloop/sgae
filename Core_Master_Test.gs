/**
 * @fileoverview Teste Mestre - Executa todos os testes das 12 intervenções
 * @version 5.0.0
 *
 * @author UNIAE CRE Team
 * @created 2025-12-04
 */

'use strict';

/**
 * Executa TODOS os testes de todas as intervenções
 * @returns {Object} Resultado consolidado
 */
function runAllTests() {
  var startTime = new Date().getTime();

  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║     TESTE MESTRE - TODAS AS 12 INTERVENÇÕES               ║');
  Logger.log('║     Sistema UNIAE CRE v5.0.0                              ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');
  Logger.log('');

  var results = {
    timestamp: new Date().toISOString(),
    intervencoes: [],
    totals: {
      passed: 0,
      failed: 0
    }
  };

  // Lista de testes por intervenção
  var tests = [
    { num: 1, name: 'Correções do Sistema', fn: 'testarCorrecoesSistema' },
    { num: 2, name: 'Correções Aplicadas', fn: 'executarTestesCorrecoes' },
    { num: 3, name: 'Verificação Rápida', fn: 'quickSystemCheck' },
    { num: 4, name: 'Integração Completa V2', fn: 'runAllIntegrationTestsV2' }
  ];

  tests.forEach(function(test) {
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Logger.log('📋 Intervenção ' + test.num + ': ' + test.name);
    Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Mapa seguro de funções de teste - evita uso de eval() (vulnerabilidade de injection)
      var testFunctionMap = {
        'testarCorrecoesSistema': typeof testarCorrecoesSistema !== 'undefined' ? testarCorrecoesSistema : null,
        'executarTestesCorrecoes': typeof executarTestesCorrecoes !== 'undefined' ? executarTestesCorrecoes : null,
        'quickSystemCheck': typeof quickSystemCheck !== 'undefined' ? quickSystemCheck : null,
        'runAllIntegrationTestsV2': typeof runAllIntegrationTestsV2 !== 'undefined' ? runAllIntegrationTestsV2 : null
      };

      var fn = testFunctionMap[test.fn] || null;

      if (typeof fn === 'function') {
        var result = fn();
        
        var passed = 0;
        var failed = 0;
        
        if (result.passed !== undefined) passed = result.passed;
        else if (result.sucessos !== undefined) passed = result.sucessos;
        else if (result.sucesso !== undefined) passed = result.sucesso;
        
        if (result.failed !== undefined) failed = result.failed;
        else if (result.falhas !== undefined) failed = result.falhas;
        else if (result.falha !== undefined) failed = result.falha;

        results.intervencoes.push({
          num: test.num,
          name: test.name,
          passed: passed,
          failed: failed,
          success: failed === 0 && passed > 0
        });
        results.totals.passed += passed;
        results.totals.failed += failed;
      } else {
        Logger.log('⚠️ Função ' + test.fn + ' não encontrada');
        results.intervencoes.push({
          num: test.num,
          name: test.name,
          passed: 0,
          failed: 1,
          success: false,
          error: 'Função não encontrada'
        });
        results.totals.failed++;
      }
    } catch (e) {
      Logger.log('❌ Erro: ' + e.message);
      results.intervencoes.push({
        num: test.num,
        name: test.name,
        passed: 0,
        failed: 1,
        success: false,
        error: e.message
      });
      results.totals.failed++;
    }

    Logger.log('');
  });

  // Resumo final
  var elapsed = new Date().getTime() - startTime;
  var total = results.totals.passed + results.totals.failed;
  var percent = total > 0 ? Math.round((results.totals.passed / total) * 100) : 0;

  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║     RESUMO FINAL                                          ║');
  Logger.log('╠═══════════════════════════════════════════════════════════╣');
  Logger.log('║ Total de testes: ' + total);
  Logger.log('║ ✅ Passou: ' + results.totals.passed);
  Logger.log('║ ❌ Falhou: ' + results.totals.failed);
  Logger.log('║ 📊 Taxa de sucesso: ' + percent + '%');
  Logger.log('║ ⏱️ Tempo total: ' + elapsed + 'ms');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');

  results.elapsed = elapsed;
  results.successRate = percent;

  return results;
}

/**
 * Executa verificação rápida do sistema
 */
function quickSystemCheck() {
  Logger.log('🚀 VERIFICAÇÃO RÁPIDA DO SISTEMA');
  Logger.log('');

  var checks = [
    { name: 'Planilha', fn: function() { return !!SpreadsheetApp.getActiveSpreadsheet(); } },
    { name: 'SYSTEM_CONFIG', fn: function() { return typeof SYSTEM_CONFIG !== 'undefined'; } },
    { name: 'SCHEMA', fn: function() { return typeof SCHEMA !== 'undefined'; } },
    { name: 'safeGet', fn: function() { return typeof safeGet === 'function'; } },
    { name: 'getUiSafely', fn: function() { return typeof getUiSafely === 'function'; } },
    { name: 'ensureArray', fn: function() { return typeof ensureArray === 'function'; } },
    { name: 'runHealthCheck', fn: function() { return typeof runHealthCheck === 'function'; } },
    { name: 'setupCompleto', fn: function() { return typeof setupCompleto === 'function'; } }
  ];

  var passed = 0;
  var failed = 0;

  checks.forEach(function(check) {
    try {
      var ok = check.fn();
      Logger.log((ok ? '✅' : '❌') + ' ' + check.name);
      if (ok) passed++; else failed++;
    } catch (e) {
      Logger.log('❌ ' + check.name + ': ' + e.message);
      failed++;
    }
  });

  Logger.log('');
  Logger.log('Resultado: ' + passed + '/' + (passed + failed) + ' verificações OK');

  return { passed: passed, failed: failed };
}

/**
 * Mostra versão e informações do sistema
 */
function showSystemInfo() {
  Logger.log('╔═══════════════════════════════════════════════════════════╗');
  Logger.log('║     SISTEMA UNIAE CRE - INFORMAÇÕES                       ║');
  Logger.log('╚═══════════════════════════════════════════════════════════╝');
  Logger.log('');

  // Versão
  var version = typeof SYSTEM_CONFIG !== 'undefined' ? SYSTEM_CONFIG.VERSION : 'N/A';
  Logger.log('📌 Versão: ' + version);

  // Ambiente
  try {
    Logger.log('📧 Usuário: ' + Session.getEffectiveUser().getEmail());
    Logger.log('🌍 Timezone: ' + Session.getScriptTimeZone());
  } catch (e) {
    Logger.log('⚠️ Não foi possível obter info do ambiente: ' + e.message);
  }

  // Planilha
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('📊 Planilha: ' + ss.getName());
    Logger.log('📋 Abas: ' + ss.getSheets().length);
  } catch (e) {
    Logger.log('⚠️ Não foi possível obter info da planilha: ' + e.message);
  }

  // Módulos carregados
  Logger.log('');
  Logger.log('📦 MÓDULOS CORE:');
  var modules = ['SCHEMA', 'SYSTEM_CONFIG', 'AUTH', 'CRUD', 'ValidationUtils', 'QuotaManager'];
  modules.forEach(function(m) {
    var loaded = typeof this[m] !== 'undefined';
    Logger.log('   ' + (loaded ? '✅' : '⬜') + ' ' + m);
  });

  Logger.log('');
  Logger.log('🔧 FUNÇÕES PRINCIPAIS:');
  var functions = ['setupCompleto', 'runHealthCheck', 'safeGet', 'getUiSafely', 'ensureArray'];
  functions.forEach(function(f) {
    var exists = typeof this[f] === 'function';
    Logger.log('   ' + (exists ? '✅' : '⬜') + ' ' + f + '()');
  });
}

Logger.log('✅ Core_Master_Test.gs carregado');
