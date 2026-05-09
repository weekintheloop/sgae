/**
 * @fileoverview Configuração e Funções de Email
 * @version 5.0.0
 *
 * Gerencia envio de emails e notificações do sistema.
 * Email principal: notasppc2015@gmail.com
 *
 * IMPORTANTE: Para funcionar, o email deve ser configurado como
 * remetente autorizado nas configurações do Google Apps Script.
 *
 * @author UNIAE CRE Team
 * @created 2025-12-04
 */

'use strict';

/**
 * Configurações de Email
 */
var EMAIL_CONFIG = {
  // Email principal do projeto
  EMAIL_PRINCIPAL: 'notasppc2015@gmail.com',

  // Nome do remetente
  NOME_REMETENTE: 'Sistema UNIAE CRE - Alimentação Escolar',

  // Emails de cópia (CC) para notificações importantes
  EMAILS_COPIA: [],

  // Templates de assunto
  ASSUNTOS: {
    NOVA_NF: '[UNIAE] Nova Nota Fiscal Recebida',
    NF_ATESTADA: '[UNIAE] Nota Fiscal Atestada',
    RECUSA_REGISTRADA: '[UNIAE] Recusa de Produto Registrada',
    PROCESSO_SEI: '[UNIAE] Processo SEI Vinculado',
    ALERTA_VENCIMENTO: '[UNIAE] ⚠️ Alerta de Vencimento',
    LEMBRETE_ATESTO: '[UNIAE] Lembrete: Notas Pendentes de Atesto',
    USUARIO_CRIADO: '[UNIAE] Bem-vindo ao Sistema',
    SENHA_ALTERADA: '[UNIAE] Senha Alterada com Sucesso'
  },

  // Limites do Google Apps Script (versão gratuita)
  LIMITES: {
    EMAILS_POR_DIA: 100,        // Limite diário
    DESTINATARIOS_POR_EMAIL: 50 // Máximo de destinatários por email
  }
};

// ============================================================================
// FUNÇÕES DE ENVIO DE EMAIL
// ============================================================================

/**
 * Envia email usando o sistema
 * @param {Object} options - Opções do email
 * @param {string} options.to - Destinatário(s)
 * @param {string} options.subject - Assunto
 * @param {string} options.body - Corpo do email (texto)
 * @param {string} [options.htmlBody] - Corpo do email (HTML)
 * @param {Array} [options.cc] - Cópia
 * @param {Array} [options.attachments] - Anexos
 * @returns {Object} Resultado do envio
 */
function enviarEmail(options) {
  try {
    if (!options || !options.to || !options.subject) {
      return { success: false, error: 'Destinatário e assunto são obrigatórios' };
    }

    // Verifica cota diária
    var cotaUsada = _verificarCotaEmail();
    if (cotaUsada >= EMAIL_CONFIG.LIMITES.EMAILS_POR_DIA) {
      AppLogger.warn('Cota diária de emails atingida');
      return { success: false, error: 'Cota diária de emails atingida' };
    }

    // Prepara opções do email
    var emailOptions = {
      to: options.to,
      subject: options.subject,
      body: options.body || '',
      name: EMAIL_CONFIG.NOME_REMETENTE
    };

    // Adiciona HTML se fornecido
    if (options.htmlBody) {
      emailOptions.htmlBody = options.htmlBody;
    }

    // Adiciona CC se fornecido
    if (options.cc && options.cc.length > 0) {
      emailOptions.cc = Array.isArray(options.cc) ? options.cc.join(',') : options.cc;
    }

    // Adiciona anexos se fornecidos
    if (options.attachments && options.attachments.length > 0) {
      emailOptions.attachments = options.attachments;
    }

    // Envia o email
    MailApp.sendEmail(emailOptions);

    // Registra envio
    _registrarEnvioEmail(options.to, options.subject);

    AppLogger.log('Email enviado para: ' + options.to);

    return { success: true, message: 'Email enviado com sucesso' };

  } catch (e) {
    AppLogger.error('Erro ao enviar email', e);
    return { success: false, error: e.message };
  }
}

/**
 * Envia notificação de nova nota fiscal
 * @param {Object} notaFiscal - Dados da nota fiscal
 * @param {string} destinatario - Email do destinatário
 */
function notificarNovaNF(notaFiscal, destinatario) {
  var html = _gerarTemplateEmail('nova_nf', {
    numeroNF: notaFiscal.Numero_NF || notaFiscal.numero,
    fornecedor: notaFiscal.Fornecedor || notaFiscal.fornecedor,
    valor: formatarMoeda(notaFiscal.Valor_Total || notaFiscal.valor),
    dataRecebimento: formatDate(notaFiscal.Data_Recebimento || new Date(), 'dd/MM/yyyy')
  });

  return enviarEmail({
    to: destinatario,
    subject: EMAIL_CONFIG.ASSUNTOS.NOVA_NF + ' - NF ' + (notaFiscal.Numero_NF || notaFiscal.numero),
    body: 'Nova nota fiscal recebida. Acesse o sistema para mais detalhes.',
    htmlBody: html
  });
}

/**
 * Envia notificação de processo SEI vinculado
 * @param {Object} processo - Dados do processo
 * @param {string} destinatario - Email do destinatário
 */
function notificarProcessoSEI(processo, destinatario) {
  var html = _gerarTemplateEmail('processo_sei', {
    numeroProcesso: processo.Numero_Processo_SEI || processo.numero,
    dataAbertura: formatDate(processo.Data_Abertura || new Date(), 'dd/MM/yyyy'),
    valorTotal: formatarMoeda(processo.Valor_Total || 0),
    responsavel: processo.Responsavel_UNIAE || 'Não definido'
  });

  return enviarEmail({
    to: destinatario,
    subject: EMAIL_CONFIG.ASSUNTOS.PROCESSO_SEI + ' - ' + (processo.Numero_Processo_SEI || processo.numero),
    body: 'Processo SEI vinculado ao sistema. Acesse para mais detalhes.',
    htmlBody: html
  });
}

/**
 * Envia lembrete de notas pendentes
 * @param {Array} notasPendentes - Lista de notas pendentes
 * @param {string} destinatario - Email do destinatário
 */
function enviarLembretePendentes(notasPendentes, destinatario) {
  if (!notasPendentes || notasPendentes.length === 0) {
    return { success: false, error: 'Nenhuma nota pendente' };
  }

  var html = _gerarTemplateEmail('lembrete_pendentes', {
    quantidade: notasPendentes.length,
    notas: notasPendentes.slice(0, 10), // Limita a 10 para não ficar muito grande
    temMais: notasPendentes.length > 10
  });

  return enviarEmail({
    to: destinatario,
    subject: EMAIL_CONFIG.ASSUNTOS.LEMBRETE_ATESTO + ' (' + notasPendentes.length + ' notas)',
    body: 'Você tem ' + notasPendentes.length + ' notas fiscais pendentes de atesto.',
    htmlBody: html
  });
}

/**
 * Envia email de boas-vindas para novo usuário
 * @param {Object} usuario - Dados do usuário
 */
function enviarBoasVindas(usuario) {
  var html = _gerarTemplateEmail('boas_vindas', {
    nome: usuario.nome || usuario.Nome || 'Usuário',
    email: usuario.email || usuario.Email,
    tipo: usuario.tipo || usuario.Tipo_Usuario || 'Usuário'
  });

  return enviarEmail({
    to: usuario.email || usuario.Email,
    subject: EMAIL_CONFIG.ASSUNTOS.USUARIO_CRIADO,
    body: 'Bem-vindo ao Sistema UNIAE CRE de Alimentação Escolar!',
    htmlBody: html
  });
}

// ============================================================================
// TEMPLATES DE EMAIL
// ============================================================================

/**
 * Gera HTML do email baseado em template
 * @private
 */
function _gerarTemplateEmail(tipo, dados) {
  var header = _getEmailHeader();
  var footer = _getEmailFooter();
  var content = '';

  switch (tipo) {
    case 'nova_nf':
      content = _templateNovaNF(dados);
      break;
    case 'processo_sei':
      content = _templateProcessoSEI(dados);
      break;
    case 'lembrete_pendentes':
      content = _templateLembretePendentes(dados);
      break;
    case 'boas_vindas':
      content = _templateBoasVindas(dados);
      break;
    default:
      content = '<p>' + JSON.stringify(dados) + '</p>';
  }

  return header + content + footer;
}

function _getEmailHeader() {
  return '<!DOCTYPE html>' +
    '<html><head><meta charset="UTF-8"></head>' +
    '<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">' +
    '<div style="background: #4285f4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">' +
    '<h1 style="margin: 0; font-size: 24px;">🍎 UNIAE CRE</h1>' +
    '<p style="margin: 5px 0 0 0; opacity: 0.9;">Sistema de Alimentação Escolar</p>' +
    '</div>' +
    '<div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">';
}

function _getEmailFooter() {
  return '</div>' +
    '<div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">' +
    '<p style="margin: 0;">Este é um email automático do Sistema UNIAE CRE.</p>' +
    '<p style="margin: 5px 0 0 0;">Em caso de dúvidas, entre em contato: ' + EMAIL_CONFIG.EMAIL_PRINCIPAL + '</p>' +
    '</div>' +
    '</body></html>';
}

function _templateNovaNF(dados) {
  return '<h2 style="color: #333; margin-top: 0;">📄 Nova Nota Fiscal Recebida</h2>' +
    '<table style="width: 100%; border-collapse: collapse;">' +
    '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Número NF:</strong></td>' +
    '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (dados.numeroNF || '-') + '</td></tr>' +
    '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Fornecedor:</strong></td>' +
    '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (dados.fornecedor || '-') + '</td></tr>' +
    '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Valor Total:</strong></td>' +
    '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (dados.valor || '-') + '</td></tr>' +
    '<tr><td style="padding: 10px;"><strong>Data Recebimento:</strong></td>' +
    '<td style="padding: 10px;">' + (dados.dataRecebimento || '-') + '</td></tr>' +
    '</table>' +
    '<p style="margin-top: 20px;"><a href="#" style="background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Acessar Sistema</a></p>';
}

function _templateProcessoSEI(dados) {
  return '<h2 style="color: #333; margin-top: 0;">📋 Processo SEI Vinculado</h2>' +
    '<div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0;">' +
    '<strong>Número do Processo:</strong><br>' +
    '<span style="font-size: 18px; color: #2e7d32;">' + (dados.numeroProcesso || '-') + '</span>' +
    '</div>' +
    '<table style="width: 100%; border-collapse: collapse;">' +
    '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Data Abertura:</strong></td>' +
    '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (dados.dataAbertura || '-') + '</td></tr>' +
    '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Valor Total:</strong></td>' +
    '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (dados.valorTotal || '-') + '</td></tr>' +
    '<tr><td style="padding: 10px;"><strong>Responsável:</strong></td>' +
    '<td style="padding: 10px;">' + (dados.responsavel || '-') + '</td></tr>' +
    '</table>';
}

function _templateLembretePendentes(dados) {
  var html = '<h2 style="color: #333; margin-top: 0;">⏰ Lembrete: Notas Pendentes</h2>' +
    '<div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 15px 0;">' +
    '<strong>Você tem ' + dados.quantidade + ' nota(s) fiscal(is) pendente(s) de atesto.</strong>' +
    '</div>';

  if (dados.notas && dados.notas.length > 0) {
    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">' +
      '<tr style="background: #f5f5f5;"><th style="padding: 10px; text-align: left;">NF</th>' +
      '<th style="padding: 10px; text-align: left;">Fornecedor</th>' +
      '<th style="padding: 10px; text-align: right;">Valor</th></tr>';

    dados.notas.forEach(function(nf) {
      html += '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (nf.Numero_NF || '-') + '</td>' +
        '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + (nf.Fornecedor || '-') + '</td>' +
        '<td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">' + formatarMoeda(nf.Valor_Total) + '</td></tr>';
    });

    html += '</table>';

    if (dados.temMais) {
      html += '<p style="color: #666; font-style: italic;">... e mais ' + (dados.quantidade - 10) + ' nota(s)</p>';
    }
  }

  return html;
}

function _templateBoasVindas(dados) {
  return '<h2 style="color: #333; margin-top: 0;">👋 Bem-vindo(a), ' + dados.nome + '!</h2>' +
    '<p>Sua conta foi criada com sucesso no Sistema UNIAE CRE de Alimentação Escolar.</p>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">' +
    '<tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>' +
    '<td style="padding: 10px; border-bottom: 1px solid #ddd;">' + dados.email + '</td></tr>' +
    '<tr><td style="padding: 10px;"><strong>Perfil:</strong></td>' +
    '<td style="padding: 10px;">' + dados.tipo + '</td></tr>' +
    '</table>' +
    '<p>Acesse o sistema para começar a utilizar as funcionalidades disponíveis para seu perfil.</p>' +
    '<p style="margin-top: 20px;"><a href="#" style="background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Acessar Sistema</a></p>';
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Verifica cota de emails usada hoje
 * @private
 */
function _verificarCotaEmail() {
  try {
    var remaining = MailApp.getRemainingDailyQuota();
    return EMAIL_CONFIG.LIMITES.EMAILS_POR_DIA - remaining;
  } catch (e) {
    return 0;
  }
}

/**
 * Registra envio de email para auditoria
 * @private
 */
function _registrarEnvioEmail(destinatario, assunto) {
  try {
    if (typeof registrarAuditoria === 'function') {
      registrarAuditoria('EMAIL_ENVIADO', 'System', {
        destinatario: destinatario,
        assunto: assunto,
        timestamp: new Date().toISOString()
      });
    }
  } catch (e) {
    // Ignora erros de auditoria
  }
}

/**
 * Obtém cota restante de emails
 */
function obterCotaEmailRestante() {
  try {
    return MailApp.getRemainingDailyQuota();
  } catch (e) {
    return -1;
  }
}

/**
 * Testa configuração de email
 */
function testarConfigEmail() {
  Logger.log('=== TESTE DE CONFIGURAÇÃO DE EMAIL ===');
  Logger.log('');
  Logger.log('Email principal: ' + EMAIL_CONFIG.EMAIL_PRINCIPAL);
  Logger.log('Nome remetente: ' + EMAIL_CONFIG.NOME_REMETENTE);
  Logger.log('Cota restante: ' + obterCotaEmailRestante() + ' emails');
  Logger.log('');
  Logger.log('Para enviar emails, o script deve ter permissão de envio.');
  Logger.log('O email será enviado como: ' + Session.getEffectiveUser().getEmail());
  Logger.log('');
  Logger.log('=== FIM DO TESTE ===');
}

// Registro do módulo
if (typeof AppLogger !== 'undefined') {
  AppLogger.debug('Core_Email_Config carregado');
}
