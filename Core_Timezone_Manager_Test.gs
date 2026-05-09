/**
 * @fileoverview Testes de Validação do Módulo de Fuso Horário
 * @version 1.0.0
 * @author UNIAE CRE Team
 * @created 2025-12-17
 * 
 * @description
 * Suite de testes para validar a precisão da conversão de fuso horário,
 * com ênfase na transição de DST (Horário de Verão).
 * 
 * Nota: O Brasil suspendeu o horário de verão em 2019, mas os testes
 * incluem cenários históricos para garantir compatibilidade com dados
 * antigos e possível reativação futura.
 * 
 * @requires Core_Timezone_Manager.gs
 * @requires Core_Logger.gs
 */

'use strict';

// ============================================================================
// FRAMEWORK DE TESTE SIMULADO
// ============================================================================

var TimezoneTestFramework = (function() {
  
  var results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  /**
   * Asserção básica
   * @param {boolean} condition - Condição a verificar
   * @param {string} message - Mensagem do teste
   * @param {Object} [details] - Detalhes adicionais
   */
  function assert(condition, message, details) {
    results.total++;
    
    var testResult = {
      name: message,
      passed: condition,
      timestamp: new Date().toISOString(),
      details: details || null
    };
    
    if (condition) {
      results.passed++;
      AppLogger.info('✅ PASS: ' + message, details);
    } else {
      results.failed++;
      AppLogger.error('❌ FAIL: ' + message, details);
    }
    
    results.tests.push(testResult);
    return condition;
  }
  
  /**
   * Asserção de igualdade
   */
  function assertEqual(actual, expected, message) {
    var condition = actual === expected;
    return assert(condition, message, {
      expected: expected,
      actual: actual
    });
  }
  
  /**
   * Asserção de igualdade aproximada (para datas)
   */
  function assertDateEqual(actual, expected, toleranceMs, message) {
    if (!actual || !expected) {
      return assert(false, message, { actual: actual, expected: expected });
    }
    
    var diff = Math.abs(actual.getTime() - expected.getTime());
    var condition = diff <= (toleranceMs || 1000);
    
    return assert(condition, message, {
      expected: expected.toISOString(),
      actual: actual.toISOString(),
      diffMs: diff
    });
  }
  
  /**
   * Reseta resultados
   */
  function reset() {
    results = { total: 0, passed: 0, failed: 0, tests: [] };
  }
  
  /**
   * Obtém resultados
   */
  function getResults() {
    return results;
  }
  
  /**
   * Gera relatório
   */
  function generateReport() {
    var report = [];
    report.push('# Relatório de Testes de Fuso Horário');
    report.push('');
    report.push('**Data de Execução:** ' + TimezoneManager.getNowFormatted());
    report.push('**Fuso Horário Canônico:** ' + TimezoneManager.getCanonicalTimezone());
    report.push('**Fuso Horário do Script:** ' + TimezoneManager.getScriptTimezone());
    report.push('');
    report.push('## Resumo');
    report.push('');
    report.push('| Métrica | Valor |');
    report.push('|---------|-------|');
    report.push('| Total de Testes | ' + results.total + ' |');
    report.push('| Sucessos | ' + results.passed + ' |');
    report.push('| Falhas | ' + results.failed + ' |');
    report.push('| Taxa de Sucesso | ' + (results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0) + '% |');
    report.push('');
    report.push('## Detalhes dos Testes');
    report.push('');
    
    results.tests.forEach(function(test, index) {
      var status = test.passed ? '✅' : '❌';
      report.push('### ' + (index + 1) + '. ' + status + ' ' + test.name);
      if (test.details) {
        report.push('');
        report.push('```json');
        report.push(JSON.stringify(test.details, null, 2));
        report.push('```');
      }
      report.push('');
    });
    
    return report.join('\n');
  }
  
  return {
    assert: assert,
    assertEqual: assertEqual,
    assertDateEqual: assertDateEqual,
    reset: reset,
    getResults: getResults,
    generateReport: generateReport
  };
})();

// ============================================================================
// TESTES DE FUSO HORÁRIO
// ============================================================================

/**
 * Executa todos os testes de fuso horário
 * @returns {Object} Resultados dos testes
 */
function runAllTimezoneTests() {
  TimezoneTestFramework.reset();
  
  AppLogger.info('========================================');
  AppLogger.info('Iniciando Testes de Fuso Horário');
  AppLogger.info('========================================');
  
  // Executa suites de teste
  testBasicFormatting();
  testDateParsing();
  testDateConversions();
  testDSTDetection();
  testDateOperations();
  testEdgeCases();
  
  // Obtém resultados
  var results = TimezoneTestFramework.getResults();
  
  AppLogger.info('========================================');
  AppLogger.info('Testes Concluídos: ' + results.passed + '/' + results.total + ' passaram');
  AppLogger.info('========================================');
  
  // Exibe resumo via UI se disponível
  if (typeof safeAlert === 'function') {
    var message = 'Testes de Fuso Horário Concluídos\n\n';
    message += 'Total: ' + results.total + '\n';
    message += 'Sucessos: ' + results.passed + '\n';
    message += 'Falhas: ' + results.failed + '\n\n';
    message += 'Taxa de Sucesso: ' + Math.round((results.passed / results.total) * 100) + '%';
    
    safeAlert('Resultado dos Testes', message);
  }
  
  return results;
}

/**
 * Testes de formatação básica
 */
function testBasicFormatting() {
  AppLogger.info('--- Testes de Formatação Básica ---');
  
  var testDate = new Date(2025, 11, 17, 14, 30, 45); // 17/12/2025 14:30:45
  
  // Teste 1: Formato brasileiro completo
  var formatted = TimezoneManager.formatDateForUser(testDate, 'DATETIME_BR');
  TimezoneTestFramework.assertEqual(
    formatted,
    '17/12/2025 14:30:45',
    'Formato DATETIME_BR'
  );
  
  // Teste 2: Apenas data
  var dateOnly = TimezoneManager.formatDateForUser(testDate, 'DATE_BR');
  TimezoneTestFramework.assertEqual(
    dateOnly,
    '17/12/2025',
    'Formato DATE_BR'
  );
  
  // Teste 3: Apenas hora
  var timeOnly = TimezoneManager.formatDateForUser(testDate, 'TIME_SHORT');
  TimezoneTestFramework.assertEqual(
    timeOnly,
    '14:30',
    'Formato TIME_SHORT'
  );
  
  // Teste 4: Formato ISO
  var isoFormat = TimezoneManager.formatDateForUser(testDate, 'ISO_DATE');
  TimezoneTestFramework.assertEqual(
    isoFormat,
    '2025-12-17',
    'Formato ISO_DATE'
  );
  
  // Teste 5: Data nula
  var nullDate = TimezoneManager.formatDateForUser(null);
  TimezoneTestFramework.assertEqual(
    nullDate,
    '',
    'Data nula retorna string vazia'
  );
}

/**
 * Testes de parsing de data
 */
function testDateParsing() {
  AppLogger.info('--- Testes de Parsing de Data ---');
  
  // Teste 1: Formato brasileiro
  var parsed1 = TimezoneManager.parseDateFromUser('17/12/2025');
  TimezoneTestFramework.assert(
    parsed1 !== null && parsed1.getDate() === 17 && parsed1.getMonth() === 11 && parsed1.getFullYear() === 2025,
    'Parse formato brasileiro dd/MM/yyyy',
    { input: '17/12/2025', result: parsed1 ? parsed1.toISOString() : null }
  );
  
  // Teste 2: Formato brasileiro com hora
  var parsed2 = TimezoneManager.parseDateFromUser('17/12/2025 14:30');
  TimezoneTestFramework.assert(
    parsed2 !== null && parsed2.getHours() === 14 && parsed2.getMinutes() === 30,
    'Parse formato brasileiro com hora',
    { input: '17/12/2025 14:30', result: parsed2 ? parsed2.toISOString() : null }
  );
  
  // Teste 3: Formato ISO
  var parsed3 = TimezoneManager.parseDateFromUser('2025-12-17');
  TimezoneTestFramework.assert(
    parsed3 !== null && parsed3.getDate() === 17,
    'Parse formato ISO yyyy-MM-dd',
    { input: '2025-12-17', result: parsed3 ? parsed3.toISOString() : null }
  );
  
  // Teste 4: String inválida
  var parsed4 = TimezoneManager.parseDateFromUser('invalid');
  TimezoneTestFramework.assertEqual(
    parsed4,
    null,
    'String inválida retorna null'
  );
  
  // Teste 5: String vazia
  var parsed5 = TimezoneManager.parseDateFromUser('');
  TimezoneTestFramework.assertEqual(
    parsed5,
    null,
    'String vazia retorna null'
  );
}

/**
 * Testes de conversão de data
 */
function testDateConversions() {
  AppLogger.info('--- Testes de Conversão de Data ---');
  
  var localDate = new Date(2025, 11, 17, 12, 0, 0); // Meio-dia local
  
  // Teste 1: Conversão para UTC
  var utcDate = TimezoneManager.dateToUTC(localDate);
  TimezoneTestFramework.assert(
    utcDate !== null,
    'Conversão para UTC não retorna null',
    { local: localDate.toISOString(), utc: utcDate ? utcDate.toISOString() : null }
  );
  
  // Teste 2: Validação de data
  TimezoneTestFramework.assertEqual(
    TimezoneManager.isValidDate(new Date()),
    true,
    'Data válida retorna true'
  );
  
  TimezoneTestFramework.assertEqual(
    TimezoneManager.isValidDate(new Date('invalid')),
    false,
    'Data inválida retorna false'
  );
  
  // Teste 3: toDate com diferentes inputs
  TimezoneTestFramework.assert(
    TimezoneManager.toDate('2025-12-17') !== null,
    'toDate com string ISO'
  );
  
  TimezoneTestFramework.assert(
    TimezoneManager.toDate(1734444000000) !== null,
    'toDate com timestamp'
  );
}

/**
 * Testes de detecção de DST (Horário de Verão)
 */
function testDSTDetection() {
  AppLogger.info('--- Testes de Detecção de DST ---');
  
  // Nota: Brasil suspendeu DST em 2019
  // Testamos com datas históricas
  
  // Teste 1: Data atual (sem DST desde 2019)
  var now = new Date();
  var dstInfo = TimezoneManager.getDSTInfo(now);
  
  TimezoneTestFramework.assert(
    typeof dstInfo.isDST === 'boolean',
    'getDSTInfo retorna isDST como boolean',
    dstInfo
  );
  
  TimezoneTestFramework.assert(
    typeof dstInfo.offsetHours === 'number',
    'getDSTInfo retorna offsetHours como number',
    { offsetHours: dstInfo.offsetHours }
  );
  
  // Teste 2: Verificar offset de Brasília (UTC-3)
  var expectedOffset = -3; // Brasília sem DST
  TimezoneTestFramework.assert(
    dstInfo.offsetHours === expectedOffset || dstInfo.offsetHours === -2, // -2 se DST ativo
    'Offset de Brasília é -3 (ou -2 com DST)',
    { expected: expectedOffset, actual: dstInfo.offsetHours }
  );
  
  // Teste 3: Data histórica com DST (dezembro 2018)
  var historicDate = new Date(2018, 11, 15, 12, 0, 0);
  var historicDST = TimezoneManager.isDSTActive(historicDate);
  
  TimezoneTestFramework.assert(
    typeof historicDST === 'boolean',
    'isDSTActive retorna boolean para data histórica',
    { date: '2018-12-15', isDST: historicDST }
  );
  
  // Teste 4: Função getCurrentOffsetHours
  var currentOffset = TimezoneManager.getCurrentOffsetHours();
  TimezoneTestFramework.assert(
    currentOffset === -3 || currentOffset === -2,
    'getCurrentOffsetHours retorna offset válido para Brasil',
    { offset: currentOffset }
  );
}

/**
 * Testes de operações com datas
 */
function testDateOperations() {
  AppLogger.info('--- Testes de Operações com Datas ---');
  
  var baseDate = new Date(2025, 11, 17, 12, 0, 0);
  
  // Teste 1: Adicionar dias
  var plus5Days = TimezoneManager.addTime(baseDate, 5, 'days');
  TimezoneTestFramework.assertEqual(
    plus5Days.getDate(),
    22,
    'Adicionar 5 dias'
  );
  
  // Teste 2: Adicionar meses
  var plus2Months = TimezoneManager.addTime(baseDate, 2, 'months');
  TimezoneTestFramework.assertEqual(
    plus2Months.getMonth(),
    1, // Fevereiro (0-indexed)
    'Adicionar 2 meses'
  );
  
  // Teste 3: Diferença em dias
  var date1 = new Date(2025, 11, 17);
  var date2 = new Date(2025, 11, 27);
  var diffDays = TimezoneManager.dateDiff(date1, date2, 'days');
  TimezoneTestFramework.assertEqual(
    diffDays,
    10,
    'Diferença de 10 dias'
  );
  
  // Teste 4: Início do dia
  var startOfDay = TimezoneManager.startOfDay(baseDate);
  TimezoneTestFramework.assert(
    startOfDay.getHours() === 0 && startOfDay.getMinutes() === 0,
    'startOfDay retorna 00:00:00'
  );
  
  // Teste 5: Fim do dia
  var endOfDay = TimezoneManager.endOfDay(baseDate);
  TimezoneTestFramework.assert(
    endOfDay.getHours() === 23 && endOfDay.getMinutes() === 59,
    'endOfDay retorna 23:59:59'
  );
  
  // Teste 6: Data no intervalo
  var inRange = TimezoneManager.isDateInRange(
    new Date(2025, 11, 20),
    new Date(2025, 11, 15),
    new Date(2025, 11, 25)
  );
  TimezoneTestFramework.assertEqual(
    inRange,
    true,
    'Data dentro do intervalo'
  );
}

/**
 * Testes de casos extremos
 */
function testEdgeCases() {
  AppLogger.info('--- Testes de Casos Extremos ---');
  
  // Teste 1: Primeiro dia do ano
  var firstDay = new Date(2025, 0, 1, 0, 0, 0);
  var formattedFirst = TimezoneManager.formatDateForUser(firstDay, 'DATE_BR');
  TimezoneTestFramework.assertEqual(
    formattedFirst,
    '01/01/2025',
    'Primeiro dia do ano'
  );
  
  // Teste 2: Último dia do ano
  var lastDay = new Date(2025, 11, 31, 23, 59, 59);
  var formattedLast = TimezoneManager.formatDateForUser(lastDay, 'DATE_BR');
  TimezoneTestFramework.assertEqual(
    formattedLast,
    '31/12/2025',
    'Último dia do ano'
  );
  
  // Teste 3: Ano bissexto (29 de fevereiro)
  var leapDay = new Date(2024, 1, 29);
  TimezoneTestFramework.assert(
    TimezoneManager.isValidDate(leapDay) && leapDay.getDate() === 29,
    '29 de fevereiro em ano bissexto'
  );
  
  // Teste 4: Nome do mês
  TimezoneTestFramework.assertEqual(
    TimezoneManager.getMonthName(11),
    'Dezembro',
    'Nome do mês dezembro'
  );
  
  // Teste 5: Nome do dia da semana
  var wednesday = new Date(2025, 11, 17); // Quarta-feira
  TimezoneTestFramework.assertEqual(
    TimezoneManager.getWeekdayName(wednesday),
    'Quarta-feira',
    'Nome do dia da semana'
  );
  
  // Teste 6: Formato relativo
  var today = new Date();
  var relativeToday = TimezoneManager.formatRelative(today);
  TimezoneTestFramework.assert(
    relativeToday.indexOf('Hoje') === 0,
    'Formato relativo para hoje',
    { result: relativeToday }
  );
}

/**
 * Gera relatório de testes em Markdown
 * @returns {string} Relatório em formato Markdown
 */
function generateTimezoneTestReport() {
  // Executa testes primeiro
  runAllTimezoneTests();
  
  // Gera relatório
  return TimezoneTestFramework.generateReport();
}

// ============================================================================
// REGISTRO DO MÓDULO
// ============================================================================

Logger.log('✅ Core_Timezone_Manager_Test carregado - Testes de fuso horário disponíveis');
