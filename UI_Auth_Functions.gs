/**
 * @fileoverview Funções de UI para Autenticação
 * @version 2.2.0
 * 
 * NOTA: As funções getSafeUi, safeAlert, safePrompt estão definidas em Core_UI_Safe.gs
 * Este arquivo usa essas funções globais para evitar duplicação.
 * 
 * ATUALIZAÇÃO v2.2.0: Agora usa AuthService de Core_Auth_Unified.gs
 * AUTH é um alias para AuthService definido naquele arquivo.
 */

'use strict';

// Helper para obter o serviço de autenticação correto
function _getAuthService() {
  if (typeof AuthService !== 'undefined') return AuthService;
  if (typeof AUTH !== 'undefined') return AUTH;
  return null;
}

/**
 * Wrapper seguro para getSafeUi (usa a função global se disponível)
 */
function _getUiSafe() {
  if (typeof getSafeUi === 'function') {
    return getSafeUi();
  }
  try {
    return SpreadsheetApp.getUi();
  } catch (e) {
    return null;
  }
}

/**
 * Wrapper seguro para safeAlert (usa a função global se disponível)
 */
function _alertSafe(title, message, buttonSet) {
  if (typeof safeAlert === 'function') {
    return safeAlert(title, message, buttonSet);
  }
  var ui = _getUiSafe();
  if (ui) {
    try {
      return ui.alert(title || 'Aviso', message || '', buttonSet || ui.ButtonSet.OK);
    } catch (e) {
      Logger.log('❌ Erro ao exibir alerta: ' + e.message);
    }
  }
  Logger.log('📢 ALERTA: ' + (title || '') + ' - ' + (message || ''));
  return null;
}

/**
 * Wrapper seguro para safePrompt (usa a função global se disponível)
 */
function _promptSafe(title, message, defaultValue) {
  if (typeof safePrompt === 'function') {
    return safePrompt(title, message, defaultValue);
  }
  var ui = _getUiSafe();
  if (ui) {
    try {
      var response = ui.prompt(title || 'Entrada', message || '', ui.ButtonSet.OK_CANCEL);
      if (response.getSelectedButton() === ui.Button.OK) {
        return { success: true, value: response.getResponseText() };
      }
      return { success: false, cancelled: true };
    } catch (e) {
      Logger.log('❌ Erro ao exibir prompt: ' + e.message);
    }
  }
  Logger.log('⚠️ Prompt não disponível');
  return { success: false, value: defaultValue, uiNotAvailable: true };
}


/**
 * Abre tela de login
 */
function openLogin() {
  try {
    var ui = getSafeUi();
    if (!ui) {
      Logger.log('⚠️ openLogin chamado em contexto sem UI');
      return { success: false, error: 'Função disponível apenas no contexto do Google Sheets' };
    }
    
    var html = HtmlService.createHtmlOutputFromFile('UI_Login')
      .setWidth(450)
      .setHeight(650)
      .setTitle('Login - UNIAE');
    
    ui.showModalDialog(html, 'Login');
  } catch (e) {
    Logger.log('❌ Erro em openLogin: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Verifica se usuário está logado
 */
function checkAuth() {
  var auth = _getAuthService();
  if (!auth) return { authenticated: false, session: null };
  
  var session = auth.getSession();
  return {
    authenticated: !!session,
    session: session
  };
}

/**
 * Mostra informações do usuário logado
 */
function showUserInfo() {
  try {
    var ui = getSafeUi();
    if (!ui) {
      Logger.log('showUserInfo chamado em contexto sem UI');
      return { success: false, error: 'Função disponível apenas no contexto do Google Sheets' };
    }
    
    var auth = _getAuthService();
    if (!auth) {
      ui.alert('Erro', 'Sistema de autenticação não disponível.', ui.ButtonSet.OK);
      return;
    }
    
    var session = auth.getSession();
    
    if (!session) {
      ui.alert('Não autenticado', 
        'Você não está logado. Faça login primeiro.', 
        ui.ButtonSet.OK);
      return;
    }
    
    var message = 'Usuário Logado\n\n';
    message += 'Nome: ' + session.nome + '\n';
    message += 'Email: ' + session.email + '\n';
    message += 'Tipo: ' + session.tipo + '\n';
    if (session.instituicao) {
      message += 'Instituição: ' + session.instituicao + '\n';
    }
    message += '\nPermissões:\n';
    
    // Verifica formato das permissões (pode ser array ou objeto)
    var perms = session.permissions;
    if (Array.isArray(perms)) {
      message += '- Admin: ' + (perms.indexOf('*') !== -1 || session.admin ? 'Sim' : 'Não') + '\n';
      message += '- Permissões: ' + perms.join(', ');
    } else if (perms && typeof perms === 'object') {
      message += '- Leitura: ' + (perms.read && perms.read.indexOf('*') !== -1 ? 'Total' : 'Limitada') + '\n';
      message += '- Escrita: ' + (perms.write && perms.write.indexOf('*') !== -1 ? 'Total' : 'Limitada') + '\n';
      message += '- Admin: ' + (perms.admin ? 'Sim' : 'Não');
    } else {
      message += '- Admin: ' + (session.admin ? 'Sim' : 'Não');
    }
    
    ui.alert('Informações do Usuário', message, ui.ButtonSet.OK);
  } catch (e) {
    Logger.log('showUserInfo erro: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Abre tela de alterar senha
 */
function openChangePassword() {
  try {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
    
    if (!session) {
      safeAlert('Não autenticado', 
        'Você precisa estar logado para alterar a senha.');
      return;
    }
    
    var ui = getSafeUi();
    if (!ui) {
      Logger.log('⚠️ openChangePassword chamado em contexto sem UI');
      return { success: false, error: 'Função disponível apenas no contexto do Google Sheets' };
    }
    
    var html = HtmlService.createHtmlOutputFromFile('UI_Change_Password')
      .setWidth(450)
      .setHeight(500)
      .setTitle('Alterar Senha');
    
    ui.showModalDialog(html, 'Alterar Senha');
  } catch (e) {
    Logger.log('❌ Erro em openChangePassword: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Logout
 */
function doLogout() {
  try {
    var auth = _getAuthService();
    var ui = getSafeUi();
    
    if (!ui) {
      // Se não há UI, apenas faz logout silenciosamente
      if (auth) auth.logout();
      Logger.log('✅ Logout realizado (sem UI)');
      return { success: true };
    }
    
    var response = ui.alert('Logout', 
      'Deseja realmente sair?', 
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      if (auth) auth.logout();
      ui.alert('Logout', 'Você saiu do sistema.', ui.ButtonSet.OK);
    }
  } catch (e) {
    Logger.log('❌ Erro em doLogout: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Adiciona menu de autenticação
 */
function addAuthMenu() {
  try {
    var ui = getSafeUi();
    if (!ui) {
      Logger.log('⚠️ Menu de autenticação não pode ser adicionado neste contexto');
      return;
    }
    
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
  
    if (session) {
      // Usuário logado
      var nomeExibicao = session.nome ? session.nome.split(' ')[0] : 'Usuário';
      ui.createMenu('👤 ' + nomeExibicao)
        .addItem('ℹ️ Meu Perfil', 'showUserInfo')
        .addItem('🔒 Alterar Senha', 'openChangePassword')
        .addSeparator()
        .addItem('🚪 Sair', 'doLogout')
        .addToUi();
    } else {
      // Usuário não logado
      ui.createMenu('🔐 Login')
        .addItem('Entrar', 'openLogin')
        .addToUi();
    }
  } catch (e) {
    Logger.log('⚠️ Menu de autenticação não pode ser adicionado: ' + e.message);
  }
}

/**
 * Middleware de autenticação para APIs
 * @deprecated Use requireAuth() de Core_API_Unified.gs para novas implementações
 */
function requireAuth_UI(fn) {
  return function() {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;

    if (!session) {
      return {
        success: false,
        error: 'Autenticação necessária',
        code: 'AUTH_REQUIRED'
      };
    }

    return fn.apply(this, arguments);
  };
}

/**
 * Middleware de permissão
 * @deprecated Use requirePermission() de Core_API_Unified.gs para novas implementações
 */
function requirePermission_UI(action, resource) {
  return function(fn) {
    return function() {
      var auth = _getAuthService();
      var session = auth ? auth.getSession() : null;
      
      if (!session) {
        return {
          success: false,
          error: 'Autenticação necessária',
          code: 'AUTH_REQUIRED'
        };
      }
      
      if (auth && !auth.hasPermission(session, action, resource)) {
        return {
          success: false,
          error: 'Permissão negada',
          code: 'PERMISSION_DENIED'
        };
      }
      
      return fn.apply(this, arguments);
    };
  };
}

/**
 * Registra ação de auditoria
 */
function logAuditAction(action, table, recordId, oldData, newData) {
  try {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
    var user = session ? session.email : 'Sistema';
    
    var auditData = {
      Data_Hora: new Date(),
      Usuario: user,
      Acao: action,
      Tabela: table,
      Registro_ID: recordId,
      Dados_Anteriores: oldData ? JSON.stringify(oldData) : '',
      Dados_Novos: newData ? JSON.stringify(newData) : '',
      IP: Session.getTemporaryActiveUserKey(),
      Observacoes: ''
    };
    
    CRUD.create('Auditoria_Log', auditData);
  } catch (e) {
    AppLogger.warn('Erro ao registrar auditoria', e);
  }
}

/**
 * APIs protegidas com autenticação
 */

// Notas Fiscais
function api_notas_create_auth(data) {
  return requireAuth(function() {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
    
    if (!session || (auth && !auth.hasPermission(session, 'write', 'Notas_Fiscais'))) {
      return { success: false, error: 'Permissão negada' };
    }
    
    // Validar dados
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Dados inválidos' };
    }
    
    data.Usuario_Registro = session.email;
    data.Data_Registro = new Date();
    
    // Verificar se função existe
    if (typeof api_notas_create === 'function') {
      var result = api_notas_create(data);
      if (result && result.success) {
        logAuditAction('CREATE', 'Notas_Fiscais', result.id, null, data);
      }
      return result;
    } else if (typeof CRUD !== 'undefined' && typeof CRUD.create === 'function') {
      var result = CRUD.create('Notas_Fiscais', data);
      if (result && result.success) {
        logAuditAction('CREATE', 'Notas_Fiscais', result.id, null, data);
      }
      return result;
    }
    
    return { success: false, error: 'Função api_notas_create não disponível' };
  })();
}

function api_notas_list_auth(filters) {
  return requireAuth(function() {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
    
    if (!session || (auth && !auth.hasPermission(session, 'read', 'Notas_Fiscais'))) {
      return { success: false, error: 'Permissão negada' };
    }
    
    // Verificar se função existe
    if (typeof api_notas_list === 'function') {
      return api_notas_list(filters);
    } else if (typeof CRUD !== 'undefined' && typeof CRUD.read === 'function') {
      return CRUD.read('Notas_Fiscais', { filters: filters });
    }
    
    return { success: false, error: 'Função api_notas_list não disponível' };
  })();
}

function api_notas_update_auth(rowIndex, data) {
  return requireAuth(function() {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
    
    if (!session || (auth && !auth.hasPermission(session, 'write', 'Notas_Fiscais'))) {
      return { success: false, error: 'Permissão negada' };
    }
    
    // Validar parâmetros
    if (!rowIndex || !data) {
      return { success: false, error: 'Parâmetros inválidos' };
    }
    
    // Busca dados antigos para auditoria
    var oldData = null;
    if (typeof CRUD !== 'undefined' && typeof CRUD.findById === 'function') {
      var findResult = CRUD.findById('Notas_Fiscais', rowIndex);
      oldData = findResult && findResult.data ? findResult.data : null;
    }
    
    // Verificar se função existe
    if (typeof api_notas_update === 'function') {
      var result = api_notas_update(rowIndex, data);
      if (result && result.success) {
        logAuditAction('UPDATE', 'Notas_Fiscais', rowIndex, oldData, data);
      }
      return result;
    } else if (typeof CRUD !== 'undefined' && typeof CRUD.update === 'function') {
      var result = CRUD.update('Notas_Fiscais', rowIndex, data);
      if (result && result.success) {
        logAuditAction('UPDATE', 'Notas_Fiscais', rowIndex, oldData, data);
      }
      return result;
    }
    
    return { success: false, error: 'Função api_notas_update não disponível' };
  })();
}

function api_notas_delete_auth(rowIndex) {
  return requireAuth(function() {
    var auth = _getAuthService();
    var session = auth ? auth.getSession() : null;
    
    if (!session || (auth && !auth.hasPermission(session, 'delete', 'Notas_Fiscais'))) {
      return { success: false, error: 'Permissão negada' };
    }
    
    // Validar parâmetro
    if (!rowIndex) {
      return { success: false, error: 'ID do registro não informado' };
    }
    
    // Busca dados antigos para auditoria
    var oldData = null;
    if (typeof CRUD !== 'undefined' && typeof CRUD.findById === 'function') {
      var findResult = CRUD.findById('Notas_Fiscais', rowIndex);
      oldData = findResult && findResult.data ? findResult.data : null;
    }
    
    // Verificar se função existe
    if (typeof api_notas_delete === 'function') {
      var result = api_notas_delete(rowIndex);
      if (result && result.success) {
        logAuditAction('DELETE', 'Notas_Fiscais', rowIndex, oldData, null);
      }
      return result;
    } else if (typeof CRUD !== 'undefined' && typeof CRUD.delete === 'function') {
      var result = CRUD.delete('Notas_Fiscais', rowIndex);
      if (result && result.success) {
        logAuditAction('DELETE', 'Notas_Fiscais', rowIndex, oldData, null);
      }
      return result;
    }
    
    return { success: false, error: 'Função api_notas_delete não disponível' };
  })();
}

/**
 * Registra novo usuário (Público ou Admin)
 * 
 * Tipos permitidos no cadastro público:
 * - FORNECEDOR
 * - REPRESENTANTE  
 * - NUTRICIONISTA
 * 
 * Tipos restritos (apenas admin pode criar):
 * - ADMIN
 * - ANALISTA
 * - FISCAL
 * - GESTOR
 */
function registerUser(userData) {
  try {
    var auth = _getAuthService();
    if (!auth) {
      return { success: false, error: 'Serviço de autenticação indisponível' };
    }
    
    // Tipos permitidos no cadastro público (sem login)
    var tiposPublicos = ['FORNECEDOR', 'REPRESENTANTE', 'NUTRICIONISTA'];
    
    // Normaliza o tipo para uppercase
    var tipoSolicitado = userData.tipo ? String(userData.tipo).toUpperCase() : 'FORNECEDOR';
    
    // Se houver sessão, verifica se é admin para permitir criar qualquer tipo
    var session = auth.getSession();
    if (session) {
      if (!auth.isAdmin(session)) {
        // Usuário logado mas não admin: só pode criar tipos públicos
        if (tiposPublicos.indexOf(tipoSolicitado) === -1) {
           return { success: false, error: 'Permissão negada para criar este tipo de usuário' };
        }
      }
      // Admin pode criar qualquer tipo
    } else {
      // Cadastro público: apenas tipos permitidos
      if (tiposPublicos.indexOf(tipoSolicitado) === -1) {
        Logger.log('registerUser: Tipo ' + tipoSolicitado + ' não permitido em cadastro público. Usando FORNECEDOR.');
        tipoSolicitado = 'FORNECEDOR';
      }
    }
    
    // Garante que o tipo está correto antes de passar para o register
    userData.tipo = tipoSolicitado;
    
    Logger.log('registerUser: Registrando usuário ' + userData.email + ' com tipo ' + userData.tipo);
    
    return auth.register(userData);
  } catch (e) {
    Logger.log('Erro em registerUser: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Recupera senha
 * @deprecated Use AuthService.recoverPassword() diretamente
 */
function recoverPassword_UI(email) {
  try {
    var auth = _getAuthService();
    if (!auth) {
      return { success: false, error: 'Serviço de autenticação indisponível' };
    }
    return auth.recoverPassword(email);
  } catch (e) {
    Logger.log('Erro em recoverPassword: ' + e.message);
    return { success: false, error: e.message };
  }
}


// ============================================================================
// FUNÇÕES GLOBAIS PARA FRONTEND (google.script.run)
// ============================================================================

/**
 * Recupera senha - Função global para frontend
 * @param {string} email - Email do usuário
 * @returns {Object} Resultado da operação
 */
function recoverPassword(email) {
  return recoverPassword_UI(email);
}

/**
 * Registra usuário - Alias global para frontend
 * @param {Object} userData - Dados do usuário
 * @returns {Object} Resultado do cadastro
 */
function registrarUsuario(userData) {
  return registerUser(userData);
}

// Log de carregamento
Logger.log('✅ UI_Auth_Functions.gs carregado');
