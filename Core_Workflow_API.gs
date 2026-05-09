/**
 * @fileoverview API Backend Integrada para os 3 Workflows (REFATORADO)
 * 
 * INTERVENÇÃO 4/4: Orquestração (Service Layer)
 * 
 * Agora atua como um FACADE/ORCHESTRATOR que delega para:
 * - Core_Workflow_Calculator (Domínio/Lógica Pura)
 * - Core_Workflow_Repository (Dados/Persistência)
 * 
 * Compatibilidade mantida com versões anteriores.
 * 
 * @version 3.0.0 (Refatorado)
 */

'use strict';

// ============================================================================
// FACADE PARA CÁLCULOS (Delegation)
// ============================================================================

/**
 * Calcula valores contábeis de uma NF com base nos recebimentos
 * @delegate WorkflowCalculator.calculateAccountingValues
 */
function calcularValoresContabeis(qtdNF, qtdRecebida, valorUnitario) {
  return WorkflowCalculator.calculateAccountingValues(qtdNF, qtdRecebida, valorUnitario);
}

/**
 * Valida integridade contábil de uma análise
 * @delegate WorkflowCalculator.validateAccountingIntegrity
 */
function validarIntegridadeContabil(dados) {
  var result = WorkflowCalculator.validateAccountingIntegrity(dados);
  // Adaptador de retorno para manter compatibilidade exata com o código antigo se necessário
  return {
    valido: result.valid,
    erros: result.errors,
    calculado: result.calculated
  };
}


// ============================================================================
// WORKFLOW 1: FORNECEDOR
// ============================================================================

function salvarNotaFiscal_Workflow(dados) {
  try {
    // Validação básica
    if (!dados.numero) return { success: false, error: 'Número da NF é obrigatório' };
    
    // Delega ao Repositório
    var id = WorkflowRepository.Invoices.save(dados);
    
    Logger.log('Facade: NF salva via Repository - ' + id);
    return { success: true, id: id };
    
  } catch (e) {
    Logger.log('Erro salvarNotaFiscal_Workflow: ' + e.message);
    return { success: false, error: e.message };
  }
}

function listarNotasFiscais_Workflow() {
  try {
    return WorkflowRepository.Invoices.listAll();
  } catch (e) {
    Logger.log('Erro listarNotasFiscais: ' + e.message);
    return [];
  }
}

// ============================================================================
// WORKFLOW 2: REPRESENTANTE ESCOLAR
// ============================================================================

function salvarRecebimento(dados) {
  try {
    // Orquestração: Valida -> Salva Recebimento -> Atualiza NF -> (Opcional) Registra Recusa
    
    // 1. Validação Contábil/Regra de Negócios (Calculadora)
    var status = 'CONFORME';
    if (dados.quantidadeRecebida < dados.quantidadeEsperada) {
      status = dados.quantidadeRecebida > 0 ? 'PARCIAL' : 'RECUSADO';
    }
    dados.status = status;
    
    // 2. Persistência (Repositório)
    var id = WorkflowRepository.Receipts.save(dados);
    
    // 3. Atualização de Estado (Repositório)
    WorkflowRepository.Invoices.updateStatus(dados.nfId, 'EM_RECEBIMENTO');
    
    // 4. Fluxo de Exceção (Recusa)
    var qtdRecusada = dados.quantidadeRecusada || Math.max(0, (dados.quantidadeEsperada || 0) - dados.quantidadeRecebida);
    if (qtdRecusada > 0) {
      WorkflowRepository.Occurrences.save({
        prefixo: 'OCOR_',
        tipo: dados.quantidadeRecebida > 0 ? 'RECUSA_PARCIAL' : 'RECUSA_TOTAL',
        nfId: dados.nfId,
        escola: dados.escola,
        produto: dados.produto,
        motivo: dados.motivoRecusa,
        acaoTomada: 'Registrado no Recebimento',
        status: 'REGISTRADO'
      });
    }

    // 5. Horta Escolar — persiste itens colhidos quando informados pela escola
    var hortaIds = [];
    if (dados.hortaEscolar && dados.hortaEscolar.temHorta) {
      hortaIds = _salvarItensHorta(dados.hortaEscolar, dados.escola || '', id);
      if (hortaIds.length > 0) {
        Logger.log('[salvarRecebimento] ' + hortaIds.length + ' item(ns) de horta registrado(s): ' + hortaIds.join(', '));
      }
    }
    
    return {
      success: true,
      id: id,
      status: status,
      hortaIds: hortaIds,
      mensagem: 'Recebimento registrado com sucesso' + (hortaIds.length > 0 ? ' (' + hortaIds.length + ' item(ns) de horta escolar registrado(s))' : '')
    };
    
  } catch (e) {
    Logger.log('Erro salvarRecebimento: ' + e.message);
    return { success: false, error: e.message };
  }
}

function listarNFsPendentesParaEscola(escola) {
  // Lógica complexa de filtro mantida no Facade ou movida para um Service específico?
  // Por simplicidade na refatoração, vamos reconstruir usando os métodos do Repositório.
  
  try {
    var allNFs = WorkflowRepository.Invoices.listAll();
    var resultado = [];
    
    // Filtrar apenas ENVIADA ou EM_RECEBIMENTO
    allNFs.forEach(function(nf) {
      if (nf.status === 'ENVIADA' || nf.status === 'EM_RECEBIMENTO') {
        // Verificar se escola já recebeu
        var recibos = WorkflowRepository.Receipts.findByNfId(nf.id);
        var jaRecebeu = recibos.some(function(r) { return r.escola === escola; });
        
        var totalRecebido = recibos.reduce(function(acc, r) { return acc + (Number(r.qtdRecebida) || 0); }, 0);
        
        nf.recebimentos = recibos.map(function(r) { return r.escola; });
        nf.totalRecebido = totalRecebido;
        nf.jaRecebeuEscola = jaRecebeu;
        
        resultado.push(nf);
      }
    });
    
    return resultado.reverse();
  } catch (e) {
    Logger.log('Erro listarNFsPendentesParaEscola: ' + e.message);
    return [];
  }
}

function registrarRecusa(dados) {
  try {
    var id = WorkflowRepository.Occurrences.save({
      prefixo: 'RECUSA_',
      tipo: 'RECUSA_RECEBIMENTO',
      nfId: dados.nfId,
      escola: dados.escola,
      produto: dados.produto,
      motivo: dados.motivo,
      acaoTomada: 'Notificação de Qualidade',
      status: 'AGUARDANDO_REPOSICAO'
    });
    
    // Atualizar NF
    WorkflowRepository.Invoices.updateStatus(dados.nfId, 'REJEITADO');
    
    return { success: true, id: id, mensagem: 'Recusa registrada.' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ============================================================================
// WORKFLOW 3: ANALISTA
// ============================================================================

function listarNFsParaAnalise() {
  try {
    var allNFs = WorkflowRepository.Invoices.listAll();
    var resultado = [];
    
    allNFs.forEach(function(nf) {
      if (nf.status === 'ENVIADA' || nf.status === 'EM_RECEBIMENTO') {
        var recibos = WorkflowRepository.Receipts.findByNfId(nf);
        var totalRecebido = recibos.reduce(function(acc, r) { return acc + (Number(r.qtdRecebida) || 0); }, 0);
        
        // Uso da Calculadora para enriquecer o objeto
        var calc = WorkflowCalculator.calculateAccountingValues(nf.quantidade, totalRecebido, nf.valorUnitario);
        
        // Merge de propriedades
        nf.recebimentos = recibos; // Detalhes completos
        nf.totalRecebido = totalRecebido;
        nf.diferenca = calc.diferenca;
        nf.valorGlosaCalculado = calc.valorGlosa;
        nf.valorAprovadoCalculado = calc.valorAprovado;
        nf.percentualGlosa = calc.percentualGlosa;
        nf.qtdEscolas = recibos.length;
        
        resultado.push(nf);
      }
    });
    
    return resultado.reverse();
  } catch (e) {
    return [];
  }
}

function salvarAnalise(dados) {
  try {
    // 1. Validação de Domínio
    var validacao = WorkflowCalculator.validateAccountingIntegrity(dados);
    if (!validacao.valid) {
      Logger.log('Correção automática de análise baseada na calculadora');
      dados.valorGlosa = validacao.calculated.valorGlosa;
      dados.valorAprovado = validacao.calculated.valorAprovado;
      dados.percentualGlosa = validacao.calculated.percentualGlosa;
      dados.validacaoContabil = 'CORRIGIDO_AUTO';
    } else {
      dados.validacaoContabil = 'OK';
    }
    
    // 2. Determinar Status Final
    var statusFinal = 'APROVADO';
    if (dados.decisao === 'GLOSADO') statusFinal = 'GLOSADO';
    if (dados.decisao === 'REJEITADO') statusFinal = 'REJEITADO';
    if (dados.decisao === 'APROVADO_PARCIAL') statusFinal = 'APROVADO_PARCIAL';
    
    dados.status = statusFinal;
    
    // 3. Persistência
    var id = WorkflowRepository.Analyses.save(dados);
    WorkflowRepository.Invoices.updateStatus(dados.nfId, statusFinal);
    
    return { success: true, id: id, status: statusFinal };
    
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ============================================================================
// HORTA ESCOLAR — persistência de colheitas no fluxo de recebimento
// ============================================================================

/**
 * Salva cada item colhido da horta na aba Horta_Escolar.
 * Chamado internamente por salvarRecebimento() e api_entrega_confirmarRecebimento().
 *
 * @param {Object} hortaPayload  Objeto coletarDadosHorta() / coletarDadosHortaReceiving()
 * @param {string} unidadeEscolar Nome da escola (vem do payload principal)
 * @param {string} recebimentoId  ID do recebimento pai (para rastreabilidade)
 * @returns {string[]} Array de IDs gerados
 */
function _salvarItensHorta(hortaPayload, unidadeEscolar, recebimentoId) {
  var ids = [];
  if (!hortaPayload || !hortaPayload.temHorta) return ids;

  var itens = hortaPayload.itens || [];
  if (!itens.length) return ids;

  var ss = (typeof getSS === 'function') ? getSS() : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Horta_Escolar');
  if (!sheet) {
    Logger.log('[_salvarItensHorta] Aba Horta_Escolar não encontrada — execute initializeSheets() primeiro');
    return ids;
  }

  // Descobre posição dos headers para mapeamento seguro
  var headersRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var now = new Date();
  var usuario = '';
  try { usuario = Session.getActiveUser().getEmail(); } catch(e) {}

  itens.forEach(function(item) {
    if (!item.produto || !item.produto.trim()) return; // ignora linha vazia

    var id = 'HRT-' + Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyyMMdd') +
             '-' + now.getTime().toString().slice(-6);
    var dataColheita = hortaPayload.dataColheita ? new Date(hortaPayload.dataColheita) : now;

    var rec = {
      ID_Horta:              id,
      Unidade_Escolar:       unidadeEscolar || '',
      Produto_Nome:          (item.produto || '').trim(),
      Item_ID:               item.itemId || '',
      Quantidade_Colhida:    parseFloat(item.quantidade) || 0,
      Unidade_Medida:        item.unidade || 'kg',
      Data_Colheita:         Utilities.formatDate(dataColheita, 'America/Sao_Paulo', 'dd/MM/yyyy'),
      Responsavel_Colheita:  hortaPayload.responsavelColheita || '',
      Destino_Producao:      item.destino || hortaPayload.destinoPadrao || 'Cardapio_Dia',
      Status_Aprovacao:      'Pendente',
      Responsavel_Aprovacao: '',
      Data_Aprovacao:        '',
      Lote_Estoque_ID:       '',
      Criado_Por:            usuario,
      Timestamp_Criacao:     now.toISOString(),
      Timestamp_Modificacao: now.toISOString(),
      Observacoes:           'Registrado via recebimento ' + recebimentoId +
                             (hortaPayload.observacoes ? ' — ' + hortaPayload.observacoes : '')
    };

    var row = headersRow.map(function(h) {
      var val = rec[h];
      return (val !== undefined && val !== null) ? val : '';
    });
    sheet.appendRow(row);
    ids.push(id);
  });

  return ids;
}

// ============================================================================
// api_entrega_confirmarRecebimento — chamado por UI_Receiving.html
// ============================================================================

/**
 * Confirma recebimento de entrega (formulário desktop de conferência).
 * Persiste a conferência e, se informada, os itens de horta escolar.
 *
 * Payload esperado:
 *   entrega_id, status, checks, itens, temperatura, observacoes,
 *   responsavel {nome, matricula}, assinatura, hortaEscolar (opcional)
 */
function api_entrega_confirmarRecebimento(dados) {
  try {
    if (!dados) return { success: false, error: 'Payload ausente' };

    var ss = (typeof getSS === 'function') ? getSS() : SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    var usuario = '';
    try { usuario = Session.getActiveUser().getEmail(); } catch(e) {}

    // ── Salva conferência na aba Controle_Conferencia (se existir) ──────────
    var sheetConf = ss.getSheetByName('Controle_Conferencia');
    var confId = 'CONF-' + Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyyMMdd') +
                 '-' + now.getTime().toString().slice(-6);
    if (sheetConf) {
      sheetConf.appendRow([
        confId,
        dados.entrega_id || '',
        dados.status || 'ACEITO',
        JSON.stringify(dados.checks || {}),
        dados.temperatura || '',
        dados.observacoes || '',
        (dados.responsavel || {}).nome || '',
        (dados.responsavel || {}).matricula || '',
        now.toISOString(),
        usuario
      ]);
    }

    // ── Horta Escolar — salva colheitas informadas ────────────────────────────
    var hortaIds = [];
    if (dados.hortaEscolar && dados.hortaEscolar.temHorta) {
      // unidadeEscolar vem do payload de entrega ou do hortaPayload
      var ue = (dados.hortaEscolar.unidadeEscolar) || '';
      hortaIds = _salvarItensHorta(dados.hortaEscolar, ue, confId);
      if (hortaIds.length > 0) {
        Logger.log('[api_entrega_confirmarRecebimento] ' + hortaIds.length + ' item(ns) de horta registrado(s)');
      }
    }

    return {
      success: true,
      id: confId,
      hortaIds: hortaIds,
      mensagem: 'Recebimento confirmado' + (hortaIds.length > 0
        ? ' com ' + hortaIds.length + ' item(ns) de horta registrado(s)'
        : '')
    };

  } catch (e) {
    Logger.log('Erro api_entrega_confirmarRecebimento: ' + e.message);
    return { success: false, error: e.message };
  }
}

// ============================================================================
// COMPATIBILIDADE / LEGADO / MENUS
// ============================================================================

// Mantém funções de menu originais para não quebrar a UI
function abrirWorkflowFornecedor() { _abrirSidebar('UI_Workflow_Fornecedor', 'Fornecedor'); }
function abrirWorkflowRepresentante() { _abrirSidebar('UI_Workflow_Representante', 'Escola'); }
function abrirWorkflowAnalista() { _abrirSidebar('UI_Workflow_Analista', 'Analista'); }
function abrirWorkflowNutricionista() { _abrirSidebar('UI_Workflow_Nutricionista', 'Nutricionista'); }

function _abrirSidebar(arquivo, titulo) {
  try {
    var html = HtmlService.createHtmlOutputFromFile(arquivo).setWidth(420).setHeight(650).setTitle(titulo);
    SpreadsheetApp.getUi().showSidebar(html);
  } catch (e) {
    Logger.log('Erro sidebar: ' + e.message);
  }
}
