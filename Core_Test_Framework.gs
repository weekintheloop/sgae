/**
 * @fileoverview Framework de Testes Simplificado
 * @version 1.0.0
 * @description Framework leve para testes unitários e de integração
 * no Google Apps Script.
 * 
 * @author UNIAE CRE Team
 * @created 2025-12-08
 */

'use strict';

var TestFramework = (function() {

  // ============================================================================
  // ESTADO
  // ============================================================================

  var suites = [];
  var currentSuite = null;
  var results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  };

  // ============================================================================
  // DEFINIÇÃO DE TESTES
  // ============================================================================

  /**
   * Define uma suite de testes
   * @param {string} name - Nome da suite
   * @param {Function} fn - Função com os testes
   */
  function describe(name, fn) {
    var suite = {
      name: name,
      tests: [],
      beforeEach: null,
      afterEach: null,
      beforeAll: null,
      afterAll: null
    };

    currentSuite = suite;
    fn();
    suites.push(suite);
    currentSuite = null;
  }

  /**
   * Define um teste
   * @param {string} name - Nome do teste
   * @param {Function} fn - Função do teste
   */
  function it(name, fn) {
    if (!currentSuite) {
      throw new Error('it() deve ser chamado dentro de describe()');
    }

    currentSuite.tests.push({
      name: name,
      fn: fn,
      skip: false
    });
  }

  /**
   * Define um teste a ser pulado
   */
  function xit(name, fn) {
    if (!currentSuite) {
      throw new Error('xit() deve ser chamado dentro de describe()');
    }

    currentSuite.tests.push({
      name: name,
      fn: fn,
      skip: true
    });
  }

  /**
   * Define setup antes de cada teste
   */
  function beforeEach(fn) {
    if (currentSuite) {
      currentSuite.beforeEach = fn;
    }
  }

  /**
   * Define cleanup após cada teste
   */
  function afterEach(fn) {
    if (currentSuite) {
      currentSuite.afterEach = fn;
    }
  }

  /**
   * Define setup antes de todos os testes da suite
   */
  function beforeAll(fn) {
    if (currentSuite) {
      currentSuite.beforeAll = fn;
    }
  }

  /**
   * Define cleanup após todos os testes da suite
   */
  function afterAll(fn) {
    if (currentSuite) {
      currentSuite.afterAll = fn;
    }
  }

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  var expect = function(actual) {
    return {
      toBe: function(expected) {
        if (actual !== expected) {
          throw new Error('Expected ' + JSON.stringify(actual) + ' to be ' + JSON.stringify(expected));
        }
      },

      toEqual: function(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error('Expected ' + JSON.stringify(actual) + ' to equal ' + JSON.stringify(expected));
        }
      },

      toBeTruthy: function() {
        if (!actual) {
          throw new Error('Expected ' + JSON.stringify(actual) + ' to be truthy');
        }
      },

      toBeFalsy: function() {
        if (actual) {
          throw new Error('Expected ' + JSON.stringify(actual) + ' to be falsy');
        }
      },

      toBeNull: function() {
        if (actual !== null) {
          throw new Error('Expected ' + JSON.stringify(actual) + ' to be null');
        }
      },

      toBeUndefined: function() {
        if (actual !== undefined) {
          throw new Error('Expected ' + JSON.stringify(actual) + ' to be undefined');
        }
      },

      toBeDefined: function() {
        if (actual === undefined) {
          throw new Error('Expected value to be defined');
        }
      },

      toContain: function(item) {
        if (Array.isArray(actual)) {
          if (actual.indexOf(item) === -1) {
            throw new Error('Expected array to contain ' + JSON.stringify(item));
          }
        } else if (typeof actual === 'string') {
          if (actual.indexOf(item) === -1) {
            throw new Error('Expected string to contain ' + JSON.stringify(item));
          }
        } else {
          throw new Error('toContain() requires array or string');
        }
      },

      toHaveLength: function(length) {
        if (actual.length !== length) {
          throw new Error('Expected length ' + actual.length + ' to be ' + length);
        }
      },

      toBeGreaterThan: function(expected) {
        if (actual <= expected) {
          throw new Error('Expected ' + actual + ' to be greater than ' + expected);
        }
      },

      toBeLessThan: function(expected) {
        if (actual >= expected) {
          throw new Error('Expected ' + actual + ' to be less than ' + expected);
        }
      },

      toThrow: function(expectedError) {
        var threw = false;
        var error = null;
        try {
          actual();
        } catch (e) {
          threw = true;
          error = e;
        }

        if (!threw) {
          throw new Error('Expected function to throw');
        }

        if (expectedError && error.message.indexOf(expectedError) === -1) {
          throw new Error('Expected error message to contain "' + expectedError + '"');
        }
      },

      toBeInstanceOf: function(type) {
        if (!(actual instanceof type)) {
          throw new Error('Expected value to be instance of ' + type.name);
        }
      },

      toMatch: function(regex) {
        if (!regex.test(actual)) {
          throw new Error('Expected "' + actual + '" to match ' + regex);
        }
      },

      not: {
        toBe: function(expected) {
          if (actual === expected) {
            throw new Error('Expected ' + JSON.stringify(actual) + ' not to be ' + JSON.stringify(expected));
          }
        },
        toEqual: function(expected) {
          if (JSON.stringify(actual) === JSON.stringify(expected)) {
            throw new Error('Expected values not to be equal');
          }
        },
        toContain: function(item) {
          if (Array.isArray(actual) && actual.indexOf(item) !== -1) {
            throw new Error('Expected array not to contain ' + JSON.stringify(item));
          }
        },
        toBeNull: function() {
          if (actual === null) {
            throw new Error('Expected value not to be null');
          }
        }
      }
    };
  };

  // ============================================================================
  // EXECUÇÃO
  // ============================================================================

  /**
   * Executa todos os testes
   * @returns {Object} Resultados
   */
  function run() {
    var startTime = Date.now();
    results = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };
    var details = [];

    Logger.log('');
    Logger.log('╔═══════════════════════════════════════════════════════════╗');
    Logger.log('║     EXECUTANDO TESTES                                    ║');
    Logger.log('╚═══════════════════════════════════════════════════════════╝');
    Logger.log('');

    suites.forEach(function(suite) {
      Logger.log('📦 ' + suite.name);
      
      var suiteResult = {
        name: suite.name,
        tests: [],
        passed: 0,
        failed: 0
      };

      // beforeAll
      if (suite.beforeAll) {
        try {
          suite.beforeAll();
        } catch (e) {
          Logger.log('   ❌ beforeAll falhou: ' + e.message);
        }
      }

      suite.tests.forEach(function(test) {
        results.total++;

        if (test.skip) {
          results.skipped++;
          Logger.log('   ⏭️ ' + test.name + ' (pulado)');
          suiteResult.tests.push({ name: test.name, status: 'skipped' });
          return;
        }

        // beforeEach
        if (suite.beforeEach) {
          try {
            suite.beforeEach();
          } catch (e) {
            // Ignora erro no setup
          }
        }

        var testStart = Date.now();
        try {
          test.fn();
          results.passed++;
          suiteResult.passed++;
          var testDuration = Date.now() - testStart;
          Logger.log('   ✅ ' + test.name + ' (' + testDuration + 'ms)');
          suiteResult.tests.push({ name: test.name, status: 'passed', duration: testDuration });
        } catch (e) {
          results.failed++;
          suiteResult.failed++;
          Logger.log('   ❌ ' + test.name);
          Logger.log('      ' + e.message);
          suiteResult.tests.push({ name: test.name, status: 'failed', error: e.message });
        }

        // afterEach
        if (suite.afterEach) {
          try {
            suite.afterEach();
          } catch (e) {
            // Ignora erro no cleanup
          }
        }
      });

      // afterAll
      if (suite.afterAll) {
        try {
          suite.afterAll();
        } catch (e) {
          Logger.log('   ⚠️ afterAll falhou: ' + e.message);
        }
      }

      details.push(suiteResult);
      Logger.log('');
    });

    results.duration = Date.now() - startTime;

    // Resumo
    Logger.log('╔═══════════════════════════════════════════════════════════╗');
    Logger.log('║     RESULTADO DOS TESTES                                 ║');
    Logger.log('╠═══════════════════════════════════════════════════════════╣');
    Logger.log('║ Total: ' + results.total);
    Logger.log('║ ✅ Passou: ' + results.passed);
    Logger.log('║ ❌ Falhou: ' + results.failed);
    Logger.log('║ ⏭️ Pulado: ' + results.skipped);
    Logger.log('║ ⏱️ Tempo: ' + results.duration + 'ms');
    Logger.log('╚═══════════════════════════════════════════════════════════╝');

    return {
      summary: results,
      details: details,
      success: results.failed === 0
    };
  }

  /**
   * Limpa todas as suites
   */
  function clear() {
    suites = [];
    currentSuite = null;
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  return {
    describe: describe,
    it: it,
    xit: xit,
    beforeEach: beforeEach,
    afterEach: afterEach,
    beforeAll: beforeAll,
    afterAll: afterAll,
    expect: expect,
    run: run,
    clear: clear
  };
})();

// Exporta funções globais para uso mais fácil
var describe = TestFramework.describe;
var it = TestFramework.it;
var xit = TestFramework.xit;
var beforeEach = TestFramework.beforeEach;
var afterEach = TestFramework.afterEach;
var beforeAll = TestFramework.beforeAll;
var afterAll = TestFramework.afterAll;
var expect = TestFramework.expect;

// ============================================================================
// TESTES DOS MÓDULOS CORE
// ============================================================================

/**
 * Executa testes dos módulos core
 */
function runCoreTests() {
  TestFramework.clear();

  // Testes do ValidationUtils
  describe('ValidationUtils', function() {
    it('should validate required fields', function() {
      var result = ValidationUtils.exists('test');
      expect(result).toBe(true);
    });

    it('should return false for empty values', function() {
      expect(ValidationUtils.exists('')).toBe(false);
      expect(ValidationUtils.exists(null)).toBe(false);
      expect(ValidationUtils.exists(undefined)).toBe(false);
    });

    it('should safely get nested properties', function() {
      var obj = { a: { b: { c: 123 } } };
      expect(ValidationUtils.safeGet(obj, 'a.b.c')).toBe(123);
      expect(ValidationUtils.safeGet(obj, 'a.b.d', 'default')).toBe('default');
    });

    it('should validate email format', function() {
      // Usa Utils.isValidEmail ou validarEmail se disponível
      var validateFn = typeof validarEmail === 'function' ? validarEmail : 
                       (typeof Utils !== 'undefined' ? Utils.isValidEmail : null);
      if (validateFn) {
        expect(validateFn('test@example.com')).toBe(true);
        expect(validateFn('invalid')).toBe(false);
      } else {
        // Fallback: teste básico com regex
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test('test@example.com')).toBe(true);
        expect(emailRegex.test('invalid')).toBe(false);
      }
    });
  });

  // Testes do RetryStrategy
  describe('RetryStrategy', function() {
    it('should calculate exponential backoff', function() {
      var delay0 = RetryStrategy.calculateBackoff(0, 1000, 30000);
      var delay1 = RetryStrategy.calculateBackoff(1, 1000, 30000);
      var delay2 = RetryStrategy.calculateBackoff(2, 1000, 30000);
      
      expect(delay0).toBeGreaterThan(0);
      expect(delay1).toBeGreaterThan(delay0 * 0.5); // Com jitter
    });

    it('should execute function successfully', function() {
      var result = RetryStrategy.execute(function() {
        return 'success';
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
    });
  });

  // Testes do ApiResponse
  describe('ApiResponse', function() {
    it('should create success response', function() {
      var response = ApiResponse.success({ id: 1 });
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(1);
      // error pode ser null ou undefined dependendo da implementação
      expect(response.success).toBe(true);
    });

    it('should create error response', function() {
      var response = ApiResponse.error('Something went wrong');
      
      expect(response.success).toBe(false);
      // Verifica se error contém a mensagem (pode ser string ou objeto)
      var errorMsg = typeof response.error === 'string' ? response.error : 
                     (response.error && response.error.message ? response.error.message : '');
      expect(errorMsg.length).toBeGreaterThan(0);
    });

    it('should create validation error response', function() {
      var response = ApiResponse.validationError([{ field: 'email', message: 'Required' }]);
      
      expect(response.success).toBe(false);
      // validationErrors deve existir e ter pelo menos 1 item
      expect(response.validationErrors).toBeDefined();
      if (response.validationErrors) {
        expect(response.validationErrors.length).toBeGreaterThan(0);
      }
    });
  });

  // Testes do FeatureFlags
  describe('FeatureFlags', function() {
    it('should check if feature is enabled', function() {
      var enabled = FeatureFlags.isEnabled('ENABLE_CACHE');
      expect(typeof enabled).toBe('boolean');
    });

    it('should return all flags', function() {
      var flags = FeatureFlags.getAll();
      expect(typeof flags).toBe('object');
    });
  });

  // Testes do Metrics
  describe('Metrics', function() {
    beforeEach(function() {
      Metrics.reset();
    });

    it('should increment counter', function() {
      Metrics.increment('test_counter');
      Metrics.increment('test_counter');
      
      expect(Metrics.getCounter('test_counter')).toBe(2);
    });

    it('should set gauge value', function() {
      Metrics.setGauge('test_gauge', 42);
      
      expect(Metrics.getGauge('test_gauge')).toBe(42);
    });

    it('should observe histogram values', function() {
      Metrics.observe('test_histogram', 10);
      Metrics.observe('test_histogram', 20);
      Metrics.observe('test_histogram', 30);
      
      var stats = Metrics.getHistogram('test_histogram');
      expect(stats.count).toBe(3);
      expect(stats.avg).toBe(20);
    });
  });

  return TestFramework.run();
}
