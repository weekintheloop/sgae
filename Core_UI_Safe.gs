'use strict';

/**
 * CORE_UI_SAFE.gs
 * Funções utilitárias para trabalhar com UI de forma segura
 *
 * Resolve o problema: "Cannot call SpreadsheetApp.getUi() from this context"
 *
 * Estas funções detectam automaticamente se a UI está disponível
 * e se adaptam ao contexto de execução.
 *
 * @version 1.0.0
 * @created 2025-11-27
 */

// ============================================================================
// VERIFICAÇÃO DE CONTEXTO
// ============================================================================
// NOTA: isUiAvailable, getSafeUi e safeAlert estão definidas em 0_Core_Safe_Globals.gs
// Este arquivo contém apenas funções adicionais de UI que não estão no globals

/**
 * Exibe prompt de forma segura
 * Se UI não disponível, retorna valor padrão
 */
function safePrompt(title, message, defaultValue) {
  var ui = getSafeUi();

  if (ui) {
    try {
      var response = ui.prompt(title, message, ui.ButtonSet.OK_CANCEL);

      if (response.getSelectedButton() === ui.Button.OK) {
        return {
          success: true,
          value: response.getResponseText()
        };
      }

      return {
        success: false,
        cancelled: true
      };
    } catch (e) {
      Logger.log('❌ Erro ao exibir prompt: ' + e.message);
    }
  }

  // Fallback: retornar valor padrão
  Logger.log('⚠️ Prompt não disponível, usando valor padrão');
  return {
    success: false,
    value: defaultValue,
    uiNotAvailable: true
  };
}

/**
 * Exibe diálogo modal de forma segura
 */
function safeShowModalDialog(html, title, width, height) {
  var ui = getSafeUi();

  if (ui) {
    try {
      if (width) html.setWidth(width);
      if (height) html.setHeight(height);

      ui.showModalDialog(html, title);
      return { success: true };
    } catch (e) {
      Logger.log('❌ Erro ao exibir diálogo: ' + e.message);
    }
  }

  // Fallback: apenas log
  Logger.log('⚠️ Diálogo não pode ser exibido: ' + title);
  return { success: false, uiNotAvailable: true };
}

/**
 * Exibe sidebar de forma segura
 */
function safeShowSidebar(html, title) {
  var ui = getSafeUi();

  if (ui) {
    try {
      ui.showSidebar(html.setTitle(title));
      return { success: true };
    } catch (e) {
      Logger.log('❌ Erro ao exibir sidebar: ' + e.message);
    }
  }

  // Fallback: apenas log
  Logger.log('⚠️ Sidebar não pode ser exibida: ' + title);
  return { success: false, uiNotAvailable: true };
}

// ============================================================================
// FUNÇÕES DE MENU SEGURAS
// ============================================================================

/**
 * Cria menu de forma segura
 */
function safeCreateMenu(menuName) {
  var ui = getSafeUi();

  if (ui) {
    try {
      return ui.createMenu(menuName);
    } catch (e) {
      Logger.log('❌ Erro ao criar menu: ' + e.message);
    }
  }

  // Fallback: retornar objeto mock
  Logger.log('⚠️ Menu não pode ser criado: ' + menuName);
  return {
    addItem: function() { return this; },
    addSeparator: function() { return this; },
    addSubMenu: function() { return this; },
    addToUi: function() { Logger.log('⚠️ Menu não adicionado (UI não disponível)'); }
  };
}

// ============================================================================
// FUNÇÕES DE CONFIRMAÇÃO SEGURAS
// ============================================================================

/**
 * Solicita confirmação de forma segura
 */
function safeConfirm(title, message) {
  var ui = getSafeUi();

  if (ui) {
    try {
      var response = ui.alert(title, message, ui.ButtonSet.YES_NO);
      return response === ui.Button.YES;
    } catch (e) {
      Logger.log('❌ Erro ao solicitar confirmação: ' + e.message);
    }
  }

  // Fallback: assumir "sim" em contextos sem UI
  Logger.log('⚠️ Confirmação não disponível, assumindo SIM');
  Logger.log('   Título: ' + title);
  Logger.log('   Mensagem: ' + message);
  return true;
}

/**
 * Solicita escolha entre opções de forma segura
 * @param {string} title - Título do diálogo
 * @param {string} message - Mensagem do diálogo
 * @param {Array} options - Array de opções
 * @param {string} defaultOption - Opção padrão
 * @returns {Object} Resultado da escolha
 */
function safeChoice(title, message, options, defaultOption) {
  // Validar parâmetros
  if (!options || !Array.isArray(options) || options.length === 0) {
    Logger.log('⚠️ safeChoice: opções inválidas ou vazias');
    return {
      success: false,
      value: defaultOption || null,
      index: -1,
      error: 'Opções inválidas ou vazias'
    };
  }

  var ui = getSafeUi();

  if (ui) {
    try {
      var optionsText = '\n\nOpções:\n';
      options.forEach(function(opt, idx) {
        optionsText += (idx + 1) + '. ' + (opt || '(vazio)') + '\n';
      });

      var response = ui.prompt(
        title || 'Escolha',
        (message || 'Selecione uma opção:') + optionsText + '\nDigite o número da opção:',
        ui.ButtonSet.OK_CANCEL
      );

      if (response.getSelectedButton() === ui.Button.OK) {
        var choice = parseInt(response.getResponseText());
        if (choice >= 1 && choice <= options.length) {
          return {
            success: true,
            value: options[choice - 1],
            index: choice - 1
          };
        }
      }

      return {
        success: false,
        cancelled: true
      };
    } catch (e) {
      Logger.log('❌ Erro ao solicitar escolha: ' + e.message);
    }
  }

  // Fallback: retornar opção padrão
  Logger.log('⚠️ Escolha não disponível, usando opção padrão');
  var defaultIndex = defaultOption ? options.indexOf(defaultOption) : 0;
  return {
    success: false,
    value: defaultOption || options[0] || null,
    index: defaultIndex >= 0 ? defaultIndex : 0,
    uiNotAvailable: true
  };
}

// ============================================================================
// FUNÇÕES DE NOTIFICAÇÃO SEGURAS
// ============================================================================

/**
 * Exibe toast de forma segura
 */
function safeToast(message, title, timeoutSeconds) {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      message,
      title || 'Notificação',
      timeoutSeconds || 5
    );
    return { success: true };
  } catch (e) {
    Logger.log('⚠️ Toast não disponível: ' + message);
    return { success: false };
  }
}

// ============================================================================
// WRAPPER PARA FUNÇÕES QUE USAM UI
// ============================================================================

/**
 * Executa função que pode usar UI de forma segura
 * Se UI não disponível, executa callback alternativo
 */
function withSafeUi(uiFunction, fallbackFunction) {
  if (isUiAvailable()) {
    try {
      return uiFunction(getSafeUi());
    } catch (e) {
      Logger.log('❌ Erro na função com UI: ' + e.message);
      if (fallbackFunction) {
        return fallbackFunction(e);
      }
    }
  } else {
    Logger.log('⚠️ UI não disponível, executando fallback');
    if (fallbackFunction) {
      return fallbackFunction(new Error('UI not available'));
    }
  }

  return null;
}

// ============================================================================
// FUNÇÕES DE PROGRESSO SEGURAS
// ============================================================================

/**
 * Exibe progresso de forma segura
 */
function safeShowProgress(message, current, total) {
  var percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  var progressBar = '█'.repeat(Math.floor(percentage / 5)) +
                    '░'.repeat(20 - Math.floor(percentage / 5));

  var fullMessage = message + '\n' +
                    progressBar + ' ' + percentage + '%\n' +
                    current + ' de ' + total;

  // Tentar toast primeiro
  var toastResult = safeToast(fullMessage, 'Progresso', 3);

  if (!toastResult.success) {
    // Fallback: apenas log
    Logger.log('📊 PROGRESSO: ' + message);
    Logger.log('   ' + progressBar + ' ' + percentage + '% (' + current + '/' + total + ')');
  }
}

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

/**
 * Valida entrada do usuário de forma segura
 */
function safeValidateInput(title, message, validator, errorMessage) {
  var maxAttempts = 3;
  var attempts = 0;

  while (attempts < maxAttempts) {
    var result = safePrompt(title, message);

    if (!result.success) {
      return result;
    }

    if (validator(result.value)) {
      return {
        success: true,
        value: result.value
      };
    }

    attempts++;
    safeAlert(
      'Entrada Inválida',
      errorMessage + '\n\nTentativas restantes: ' + (maxAttempts - attempts)
    );
  }

  return {
    success: false,
    error: 'Número máximo de tentativas excedido'
  };
}

// ============================================================================
// FUNÇÕES DE LOG VISUAL
// ============================================================================

/**
 * Exibe mensagem formatada no log
 * @param {string} type - Tipo da mensagem (success, error, warning, info, debug)
 * @param {string} title - Título da mensagem
 * @param {string} message - Mensagem detalhada
 * @param {*} data - Dados adicionais
 */
function logFormatted(type, title, message, data) {
  var icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    debug: '🔍'
  };

  var icon = icons[type] || '📝';
  var safeTitle = (title !== null && title !== undefined) ? String(title).toUpperCase() : 'SEM TÍTULO';

  Logger.log(icon + ' ' + safeTitle);
  if (message !== null && message !== undefined) {
    Logger.log('   ' + String(message));
  }
  if (data !== null && data !== undefined) {
    try {
      Logger.log('   Dados: ' + JSON.stringify(data, null, 2));
    } catch (e) {
      Logger.log('   Dados: [não serializável]');
    }
  }
}

/**
 * Exibe resultado de operação de forma visual
 */
function logResult(operation, success, details) {
  if (success) {
    logFormatted('success', operation, 'Operação concluída com sucesso', details);
  } else {
    logFormatted('error', operation, 'Operação falhou', details);
  }
}

// ============================================================================
// EXPORTAR FUNÇÕES
// ============================================================================

/**
 * Registra módulo de UI segura
 */
function registrarCoreUISafe() {
  Logger.log('✅ Core UI Safe carregado');
  Logger.log('   UI disponível: ' + (isUiAvailable() ? 'SIM' : 'NÃO'));
}

// Executar ao carregar
if (typeof registrarCoreUISafe === 'function') {
  // registrarCoreUISafe(); // Comentado para não executar automaticamente
}
