/**
 * @fileoverview Camada de Compatibilidade - UNIAE CRE
 * @version 5.0.0
 *
 * Garante compatibilidade com código legado mapeando funções antigas para novas.
 * Este arquivo deve ser carregado após todos os módulos principais.
 */

'use strict';

// ============================================================================
// ALIASES DE AUTENTICAÇÃO
// Agora delegam para AuthService (Core_Auth_Unified.gs)
// ============================================================================

/** @deprecated Use AuthService.login() ou api_auth_login() */
function login(email, senha) {
  if (typeof AuthService !== 'undefined') return AuthService.login(email, senha);
  if (typeof authLogin === 'function') return authLogin(email, senha);
  return { success: false, error: 'Sistema de autenticação não disponível' };
}

/** @deprecated Use AuthService.logout() ou api_auth_logout() */
function logout() {
  if (typeof AuthService !== 'undefined') return AuthService.logout();
  if (typeof authLogout === 'function') return authLogout();
  return { success: false, error: 'Sistema de autenticação não disponível' };
}

/** @deprecated Use AuthService.getSession() */
function getCurrentUser() {
  if (typeof AuthService !== 'undefined') return AuthService.getSession();
  if (typeof authGetCurrentUser === 'function') return authGetCurrentUser();
  return null;
}

/** @deprecated Use AuthService.hasPermission() */
function checkPermission(permission) {
  if (typeof AuthService !== 'undefined') {
    var session = AuthService.getSession();
    return AuthService.hasPermission(session, permission);
  }
  if (typeof authCheckPermission === 'function') return authCheckPermission(permission);
  return false;
}

/** @deprecated Use AuthService.listUsers() */
function listUsers() {
  if (typeof AuthService !== 'undefined') return AuthService.listUsers();
  if (typeof authListUsers === 'function') return authListUsers();
  return [];
}

// ============================================================================
// ALIASES DE CRUD
// ============================================================================

/** @deprecated Use getSheetByName() do Core_Sheet_Accessor */
// function getSheet(sheetName) {
//   if (typeof getSheetByName === 'function') {
//     return getSheetByName(sheetName);
//   }
//   try {
//     var ss = SpreadsheetApp.getActiveSpreadsheet();
//     return ss ? ss.getSheetByName(sheetName) : null;
//   } catch (e) {
//     return null;
//   }
// }

/** @deprecated Use readSheetOptimized() */
function lerDados(sheetName) {
  if (typeof readSheetOptimized === 'function') {
    return readSheetOptimized(sheetName);
  }
  var sheet = getSheet(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  return data.length > 1 ? data.slice(1) : [];
}

/** @deprecated Use writeRowsOptimized() */
function escreverDados(sheetName, dados) {
  if (typeof writeRowsOptimized === 'function') {
    return writeRowsOptimized(sheetName, dados);
  }
  var sheet = getSheet(sheetName);
  if (!sheet || !dados || !dados.length) return false;
  sheet.getRange(sheet.getLastRow() + 1, 1, dados.length, dados[0].length).setValues(dados);
  return true;
}

// ============================================================================
// ALIASES DE VALIDAÇÃO
// ============================================================================

/** @deprecated Use validateEmail() do Core_Validation_Utils */
function validarEmailLegado(email) {
  return typeof validateEmail === 'function' ? validateEmail(email) :
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** @deprecated Use validateCNPJ() do Core_Validation_Utils */
function validarCNPJLegado(cnpj) {
  return typeof validateCNPJ === 'function' ? validateCNPJ(cnpj) : true;
}

/** @deprecated Use validateCPF() do Core_Validation_Utils */
function validarCPFLegado(cpf) {
  return typeof validateCPF === 'function' ? validateCPF(cpf) : true;
}

// ============================================================================
// ALIASES DE UI
// ============================================================================

/** @deprecated Use getSafeUi() */
function getUiSafe() {
  return typeof getSafeUi === 'function' ? getSafeUi() : null;
}

/** @deprecated Use safeAlert() */
function alertaSafe(message) {
  if (typeof safeAlert === 'function') {
    return safeAlert(message);
  }
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log('Alert: ' + message);
  }
}

/** @deprecated Use safeToast() */
function toastSafe(message, title, timeout) {
  if (typeof safeToast === 'function') {
    return safeToast(message, title, timeout);
  }
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title || 'Info', timeout || 3);
  } catch (e) {
    Logger.log('Toast: ' + (title || '') + ' - ' + message);
  }
}

// ============================================================================
// ALIASES DE LOGGING
// ============================================================================

/** @deprecated Use AppLogger.log() */
function logInfo(message, context) {
  if (typeof AppLogger !== 'undefined' && AppLogger.log) {
    return AppLogger.log(message, context);
  }
  Logger.log('[INFO] ' + message);
}

/** @deprecated Use AppLogger.error() */
function logError(message, error) {
  if (typeof AppLogger !== 'undefined' && AppLogger.error) {
    return AppLogger.error(message, error);
  }
  Logger.log('[ERROR] ' + message + (error ? ': ' + error : ''));
}

/** @deprecated Use AppLogger.warn() */
function logWarning(message) {
  if (typeof AppLogger !== 'undefined' && AppLogger.warn) {
    return AppLogger.warn(message);
  }
  Logger.log('[WARN] ' + message);
}

// ============================================================================
// ALIASES DE CACHE
// ============================================================================

/** @deprecated Use CACHE.get() */
function getCacheValue(key) {
  if (typeof CACHE !== 'undefined' && CACHE.get) {
    return CACHE.get(key);
  }
  try {
    return CacheService.getScriptCache().get(key);
  } catch (e) {
    return null;
  }
}

/** @deprecated Use CACHE.set() */
function setCacheValue(key, value, ttl) {
  if (typeof CACHE !== 'undefined' && CACHE.set) {
    return CACHE.set(key, value, ttl);
  }
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(value), ttl || 600);
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// ALIASES DE FORMATAÇÃO
// ============================================================================

/** @deprecated Use formatCurrency() */
function formatarMoedaLegado(valor) {
  if (typeof formatCurrency === 'function') {
    return formatCurrency(valor);
  }
  return 'R$ ' + (valor || 0).toFixed(2).replace('.', ',');
}

/** @deprecated Use formatDate() */
function formatarDataLegado(data) {
  if (typeof formatDate === 'function') {
    return formatDate(data);
  }
  if (!data) return '';
  var d = new Date(data);
  return d.toLocaleDateString('pt-BR');
}

// ============================================================================
// ALIASES DE NOTAS FISCAIS
// ============================================================================

/** @deprecated Use api_listarNotasFiscais() */
function listarNotas(filtros) {
  return typeof api_listarNotasFiscais === 'function' ? api_listarNotasFiscais(filtros) : [];
}

/** @deprecated Use api_buscarNF() */
function buscarNota(numero) {
  return typeof api_buscarNF === 'function' ? api_buscarNF(numero) : null;
}

/** @deprecated Use api_criarNF() */
function criarNota(dados) {
  return typeof api_criarNF === 'function' ? api_criarNF(dados) : null;
}

// ============================================================================
// ALIASES DE PROCESSO SEI
// ============================================================================

/** @deprecated Use api_criarProcessoSEI() */
function criarProcesso(dados) {
  return typeof api_criarProcessoSEI === 'function' ? api_criarProcessoSEI(dados) : null;
}

/** @deprecated Use api_buscarProcessoSEI() */
function buscarProcesso(numero) {
  return typeof api_buscarProcessoSEI === 'function' ? api_buscarProcessoSEI(numero) : null;
}

/** @deprecated Use api_listarProcessos() */
function listarProcessos(filtros) {
  return typeof api_listarProcessos === 'function' ? api_listarProcessos(filtros) : [];
}

// ============================================================================
// ALIASES DE EMAIL
// ============================================================================

/** @deprecated Use enviarEmail() do Core_Email_Config */
function enviarEmailLegado(destinatario, assunto, corpo) {
  if (typeof enviarEmail === 'function') {
    return enviarEmail(destinatario, assunto, corpo);
  }
  try {
    MailApp.sendEmail(destinatario, assunto, corpo);
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS LEGADAS
// ============================================================================

/** @deprecated Use generateUUID() */
function gerarId() {
  if (typeof generateUUID === 'function') {
    return generateUUID();
  }
  return Utilities.getUuid();
}

/** @deprecated Use safeGet() */
function obterValorSeguro(obj, caminho, padrao) {
  if (typeof safeGet === 'function') {
    return safeGet(obj, caminho, padrao);
  }
  if (!obj) return padrao;
  var partes = caminho.split('.');
  var atual = obj;
  for (var i = 0; i < partes.length; i++) {
    if (atual === null || atual === undefined) return padrao;
    atual = atual[partes[i]];
  }
  return atual !== undefined ? atual : padrao;
}

// ============================================================================
// REGISTRO DE COMPATIBILIDADE
// ============================================================================

/**
 * Verifica se todas as funções de compatibilidade estão funcionando
 * @returns {Object} Status de cada alias
 */
function verificarCompatibilidade() {
  var status = {
    timestamp: new Date().toISOString(),
    aliases: {
      auth: {
        login: typeof login === 'function',
        logout: typeof logout === 'function',
        getCurrentUser: typeof getCurrentUser === 'function',
        checkPermission: typeof checkPermission === 'function',
        listUsers: typeof listUsers === 'function'
      },
      crud: {
        getSheet: typeof getSheet === 'function',
        lerDados: typeof lerDados === 'function',
        escreverDados: typeof escreverDados === 'function'
      },
      validacao: {
        validarEmailLegado: typeof validarEmailLegado === 'function',
        validarCNPJLegado: typeof validarCNPJLegado === 'function',
        validarCPFLegado: typeof validarCPFLegado === 'function'
      },
      ui: {
        getUiSafe: typeof getUiSafe === 'function',
        alertaSafe: typeof alertaSafe === 'function',
        toastSafe: typeof toastSafe === 'function'
      },
      logging: {
        logInfo: typeof logInfo === 'function',
        logError: typeof logError === 'function',
        logWarning: typeof logWarning === 'function'
      },
      cache: {
        getCacheValue: typeof getCacheValue === 'function',
        setCacheValue: typeof setCacheValue === 'function'
      }
    }
  };

  // Contar aliases funcionando
  var total = 0;
  var funcionando = 0;

  for (var categoria in status.aliases) {
    for (var alias in status.aliases[categoria]) {
      total++;
      if (status.aliases[categoria][alias]) funcionando++;
    }
  }

  status.resumo = {
    total: total,
    funcionando: funcionando,
    percentual: Math.round((funcionando / total) * 100) + '%'
  };

  return status;
}

// Log de carregamento
Logger.log('✅ Core_Compatibility_Layer.gs carregado - Aliases de compatibilidade disponíveis');
