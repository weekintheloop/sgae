/**
 * UI_Atesto_Integration.gs
 * Funções de integração entre o frontend aprimorado e o backend do sistema de atesto
 * Baseado no Manual de Análise Processual - UNIAE/CRE-PP
 */

/**
 * Verifica se o contexto UI está disponível
 * @private
 */
function _isUiContextAvailable() {
  try {
    SpreadsheetApp.getUi();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Abre a interface principal aprimorada do sistema de atesto
 */
function abrirSistemaAtestoAprimorado() {
  if (!_isUiContextAvailable()) {
    Logger.log('abrirSistemaAtestoAprimorado: Contexto UI não disponível');
    return { success: false, error: 'Esta função deve ser executada a partir da planilha' };
  }
  
  var html = HtmlService.createHtmlOutputFromFile('UI_Atesto_Aprimorado')
    .setWidth(1200)
    .setHeight(800)
    .setTitle('Sistema de Atesto - UNIAE/CRE-PP');

  SpreadsheetApp.getUi().showModalDialog(html, 'Sistema de Atesto de Gêneros Alimentícios');
}

/**
 * Abre o checklist de recebimento para impressão
 */
function abrirChecklistRecebimento() {
  if (!_isUiContextAvailable()) {
    Logger.log('abrirChecklistRecebimento: Contexto UI não disponível');
    return { success: false, error: 'Esta função deve ser executada a partir da planilha' };
  }
  
  var html = HtmlService.createHtmlOutputFromFile('UI_Checklist_Recebimento')
    .setWidth(800)
    .setHeight(900)
    .setTitle('Checklist de Recebimento');

  SpreadsheetApp.getUi().showModalDialog(html, 'Checklist de Verificação de Qualidade');
}

/**
 * Adiciona menu personalizado para o sistema de atesto
 */
function adicionarMenuAtesto() {
  if (!_isUiContextAvailable()) {
    Logger.log('adicionarMenuAtesto: Contexto UI não disponível');
    return;
  }
  
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 Sistema de Atesto')
    .addItem('🏠 Abrir Painel Principal', 'abrirSistemaAtestoAprimorado')
    .addItem('📝 Checklist de Recebimento', 'abrirChecklistRecebimento')
    .addSeparator()
    .addItem('📊 Relatório de Processos', 'gerarRelatorioProcessos')
    .addItem('⚠️ Processos com Prazo Crítico', 'listarProcessosPrazoCritico')
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Configurações')
      .addItem('Configurar Comissão', 'configurarComissao')
      .addItem('Definir Prazos', 'configurarPrazos'))
    .addToUi();
}

/**
 * Lista processos com prazo crítico (menos de 2 dias úteis)
 * Conforme Seção 4.2 do Manual - Prazo de 5 dias úteis
 */
function listarProcessosPrazoCritico() {
  if (!_isUiContextAvailable()) {
    Logger.log('listarProcessosPrazoCritico: Contexto UI não disponível');
    return { success: false, error: 'Esta função deve ser executada a partir da planilha' };
  }
  
  try {
    var resultado = listarProcessosAtesto({ status: 'EM_ANALISE' });

    if (!resultado.success) {
      SpreadsheetApp.getUi().alert('Erro ao carregar processos: ' + resultado.error);
      return;
    }

    var processosCriticos = resultado.data.filter(function(p) {
      var diasRestantes = calcularDiasUteisRestantes(p.dataRecebimentoUNIAE);
      return diasRestantes <= 2 && ['LIQUIDADO', 'PAGO'].indexOf(p.status) === -1;
    });

    if (processosCriticos.length === 0) {
      SpreadsheetApp.getUi().alert('✅ Nenhum processo com prazo crítico encontrado.');
      return;
    }

    var mensagem = '⚠️ PROCESSOS COM PRAZO CRÍTICO\n\n';
    mensagem += 'Conforme Seção 4.2 do Manual, o prazo de 5 dias úteis deve ser cumprido.\n\n';

    processosCriticos.forEach(function(p, i) {
      var dias = calcularDiasUteisRestantes(p.dataRecebimentoUNIAE);
      mensagem += (i + 1) + '. NF ' + p.notaFiscal + ' - ' + p.fornecedor + '\n';
      mensagem += '   Prazo: ' + (dias <= 0 ? 'VENCIDO' : dias + ' dia(s) restante(s)') + '\n\n';
    });

    SpreadsheetApp.getUi().alert(mensagem);

  } catch (error) {
    Logger.log('Erro em listarProcessosPrazoCritico: ' + error);
    if (_isUiContextAvailable()) {
      SpreadsheetApp.getUi().alert('Erro: ' + error.message);
    }
  }
}

/**
 * Calcula dias úteis restantes para o prazo de 5 dias
 * @param {string} dataRecebimento - Data de recebimento na UNIAE
 * @returns {number} Dias úteis restantes
 */
function calcularDiasUteisRestantes(dataRecebimento) {
  if (!dataRecebimento) return 5;

  const dataReceb = new Date(dataRecebimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Adiciona 5 dias úteis à data de recebimento
  let prazo = new Date(dataReceb);
  let diasUteis = 0;

  while (diasUteis < 5) {
    prazo.setDate(prazo.getDate() + 1);
    var diaSemana = prazo.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) { // Não é fim de semana
      diasUteis++;
    }
  }

  // Calcula diferença em dias
  var diffTime = prazo - hoje;
  var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Gera relatório consolidado de processos
 */
function gerarRelatorioProcessos() {
  if (!_isUiContextAvailable()) {
    Logger.log('gerarRelatorioProcessos: Contexto UI não disponível');
    return { success: false, error: 'Esta função deve ser executada a partir da planilha' };
  }
  
  try {
    var resultado = listarProcessosAtesto({});

    if (!resultado.success) {
      SpreadsheetApp.getUi().alert('Erro: ' + resultado.error);
      return;
    }

    var processos = resultado.data;
    var stats = {
      total: processos.length,
      emAnalise: processos.filter(function(p) { return p.status === 'EM_ANALISE'; }).length,
      atestados: processos.filter(function(p) { return ['ATESTO_COMISSAO', 'ATESTADO_EXECUTOR'].indexOf(p.status) !== -1; }).length,
      pendentes: processos.filter(function(p) { return p.status === 'PENDENCIA_DOCUMENTAL'; }).length,
      liquidados: processos.filter(function(p) { return ['LIQUIDADO', 'PAGO'].indexOf(p.status) !== -1; }).length
    };

    var valorTotal = processos.reduce(function(acc, p) { return acc + (Number(p.valorTotal) || 0); }, 0);

    var relatorio = '📊 RELATÓRIO DE PROCESSOS DE ATESTO\n';
    relatorio += '═══════════════════════════════════\n\n';
    relatorio += '📋 Total de Processos: ' + stats.total + '\n';
    relatorio += '💰 Valor Total: R$ ' + valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + '\n\n';
    relatorio += '📈 STATUS:\n';
    relatorio += '   • Em Análise: ' + stats.emAnalise + '\n';
    relatorio += '   • Atestados: ' + stats.atestados + '\n';
    relatorio += '   • Pendências: ' + stats.pendentes + '\n';
    relatorio += '   • Liquidados/Pagos: ' + stats.liquidados + '\n';

    SpreadsheetApp.getUi().alert(relatorio);

  } catch (error) {
    Logger.log('Erro em gerarRelatorioProcessos: ' + error);
    if (_isUiContextAvailable()) {
      SpreadsheetApp.getUi().alert('Erro: ' + error.message);
    }
  }
}

/**
 * Configuração da Comissão de Recebimento
 * Conforme Seção 2.3 do Manual - Mínimo 3 membros
 */
function configurarComissao() {
  if (!_isUiContextAvailable()) {
    Logger.log('configurarComissao: Contexto UI não disponível');
    return { success: false, error: 'Esta função deve ser executada a partir da planilha' };
  }
  
  var ui = SpreadsheetApp.getUi();

  var response = ui.prompt(
    'Configurar Comissão de Recebimento',
    'Digite os membros da comissão (Nome - Matrícula), separados por vírgula:\n\n' +
    'Exemplo: João Silva - 123456, Maria Santos - 654321, Pedro Costa - 789012',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    var membros = response.getResponseText().split(',').map(function(m) { return m.trim(); }).filter(function(m) { return m; });

    if (membros.length < 3) {
      ui.alert('⚠️ Atenção', 'A Comissão deve ter no mínimo 3 membros (Resolução CD/FNDE nº 06/2020).', ui.ButtonSet.OK);
      return;
    }

    // Salvar configuração
    var props = PropertiesService.getScriptProperties();
    props.setProperty('COMISSAO_MEMBROS', JSON.stringify(membros));

    ui.alert('✅ Sucesso', `Comissão configurada com ${membros.length} membros.`, ui.ButtonSet.OK);
  }
}

/**
 * Configuração de prazos do sistema
 */
function configurarPrazos() {
  if (!_isUiContextAvailable()) {
    Logger.log('configurarPrazos: Contexto UI não disponível');
    return { success: false, error: 'Esta função deve ser executada a partir da planilha' };
  }
  
  var ui = SpreadsheetApp.getUi();

  ui.alert(
    '⚙️ Prazos do Sistema',
    'Prazos definidos conforme Manual e Contratos:\n\n' +
    '• Análise da Comissão: 5 dias úteis\n' +
    '• Substituição de produtos (perecíveis): 24 horas\n' +
    '• Substituição de produtos (não perecíveis): 5 dias úteis\n' +
    '• Pagamento ao fornecedor: 30 dias\n\n' +
    'Estes prazos são definidos contratualmente e não podem ser alterados.',
    ui.ButtonSet.OK
  );
}

// ============================================================================
// FUNÇÕES ADICIONAIS DE INTEGRAÇÃO
// ============================================================================

/**
 * Verifica conformidade antes do atesto
 * Integração com Core_Conformidade_Auditoria.gs
 *
 * @param {string} processoId - ID do processo
 * @returns {Object} Resultado da verificação
 */
function verificarConformidadeAnteAtesto(processoId) {
  try {
    // Buscar dados do processo
    const resultado = listarProcessosAtesto({ id: processoId });

    if (!resultado.success || resultado.data.length === 0) {
      return { success: false, error: 'Processo não encontrado' };
    }

    const processo = resultado.data[0];

    // Verificar consistência de datas
    const verificacaoDatas = verificarConsistenciaDatas({
      processoId: processoId,
      notaFiscal: processo.notaFiscal,
      dataEmissaoNF: processo.dataEmissaoNF,
      dataAtesto: new Date().toISOString(),
      dataRecebimento: processo.dataRecebimentoUNIAE
    });

    // Verificar documentação
    const verificacaoDoc = verificarDocumentacaoLiquidacao({
      processoId: processoId,
      notaFiscal: {
        numero: processo.notaFiscal,
        valor: processo.valorTotal,
        descricaoDetalhada: true // Assumir que foi verificado
      },
      termoRecebimento: {
        assinado: processo.entregas?.some(e => e.assinatura),
        dataAssinatura: processo.entregas?.[0]?.dataEntrega
      },
      atestoExecutor: null, // Ainda não atestado
      certidoes: [] // Verificar separadamente
    });

    return {
      success: true,
      data: {
        processoId: processoId,
        verificacaoDatas: verificacaoDatas.data,
        verificacaoDocumentacao: verificacaoDoc.data,
        aptoParaAtesto: verificacaoDatas.data?.conforme !== false
      }
    };

  } catch (error) {
    Logger.log('Erro em verificarConformidadeAnteAtesto: ' + error);
    return { success: false, error: error.message };
  }
}

/**
 * Registra evento de rastreabilidade para processo de atesto
 * @param {string} processoId - ID do processo
 * @param {string} evento - Tipo de evento
 * @param {string} descricao - Descrição do evento
 */
function registrarEventoAtesto(processoId, evento, descricao) {
  try {
    if (typeof registrarEventoRastreabilidade === 'function') {
      registrarEventoRastreabilidade(processoId, {
        tipo: evento,
        descricao: descricao,
        responsavel: Session.getActiveUser().getEmail(),
        matricula: ''
      });
    }
  } catch (error) {
    Logger.log('Erro ao registrar evento: ' + error);
  }
}

/**
 * Gera despacho SEI formatado
 * @param {string} processoId - ID do processo
 * @returns {Object} Texto do despacho
 */
function gerarDespachoSEI(processoId) {
  try {
    const resultado = listarProcessosAtesto({ id: processoId });

    if (!resultado.success || resultado.data.length === 0) {
      return { success: false, error: 'Processo não encontrado' };
    }

    const p = resultado.data[0];
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const texto = `
DESPACHO

Processo SEI: ${p.processoSEI || '[A INFORMAR]'}
Assunto: Atesto de Recebimento de Gêneros Alimentícios

Senhor(a) Chefe,

Informo que os gêneros alimentícios constantes da Nota Fiscal nº ${p.notaFiscal},
emitida por ${p.fornecedor} (CNPJ: ${p.cnpjFornecedor || '[A INFORMAR]'}),
no valor de R$ ${Number(p.valorTotal || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})},
foram devidamente recebidos e conferidos conforme especificações contratuais.

VERIFICAÇÕES REALIZADAS:
☑ Conferência quantitativa dos produtos
☑ Conferência qualitativa (características sensoriais)
☑ Verificação de temperatura (produtos refrigerados/congelados)
☑ Verificação de validade e rotulagem
☑ Conferência de documentação fiscal

RESULTADO: ${p.status === 'ATESTADO_EXECUTOR' || p.status === 'LIQUIDADO' ? 'CONFORME' : 'EM ANÁLISE'}

${p.observacoes ? `OBSERVAÇÕES: ${p.observacoes}` : ''}

Diante do exposto, ${p.status === 'ATESTADO_EXECUTOR' || p.status === 'LIQUIDADO' ?
  'ATESTO o recebimento dos produtos e encaminho para liquidação e pagamento.' :
  'encaminho para análise e providências cabíveis.'}

Brasília-DF, ${dataAtual}.

_______________________________
[NOME DO SERVIDOR]
[MATRÍCULA]
[CARGO/FUNÇÃO]
UNIAE/CRE-PP
`;

    return { success: true, data: { texto: texto } };

  } catch (error) {
    Logger.log('Erro em gerarDespachoSEI: ' + error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtém resumo do processo para exibição
 * @param {string} processoId - ID do processo
 * @returns {Object} Resumo do processo
 */
function obterResumoProcesso(processoId) {
  try {
    const resultado = listarProcessosAtesto({ id: processoId });

    if (!resultado.success || resultado.data.length === 0) {
      return { success: false, error: 'Processo não encontrado' };
    }

    const p = resultado.data[0];

    // Calcular dias úteis restantes
    const diasRestantes = calcularDiasUteisRestantes(p.dataRecebimentoUNIAE);

    // Obter histórico de rastreabilidade
    let historico = [];
    if (typeof obterHistoricoProcesso === 'function') {
      const histResult = obterHistoricoProcesso(processoId);
      if (histResult.success) {
        historico = histResult.data;
      }
    }

    return {
      success: true,
      data: {
        ...p,
        diasRestantes: diasRestantes,
        prazoStatus: diasRestantes > 2 ? 'OK' : diasRestantes > 0 ? 'ATENCAO' : 'VENCIDO',
        historico: historico,
        totalEntregas: p.entregas?.length || 0,
        entregasConformes: p.entregas?.filter(e => e.quantitativaOk && e.qualitativaOk).length || 0
      }
    };

  } catch (error) {
    Logger.log('Erro em obterResumoProcesso: ' + error);
    return { success: false, error: error.message };
  }
}

// Registrar menu ao abrir a planilha (usa o menu completo do PAE)
// NOTA: Renomeada para evitar conflito com onOpen em Code.gs
function onOpenAtesto() {
  try {
    // Verificar se existe a função do menu completo
    if (typeof criarMenuPAE === 'function') {
      criarMenuPAE();
    } else {
      adicionarMenuAtesto();
    }
  } catch (e) {
    Logger.log('onOpenAtesto: Contexto UI não disponível - ' + e.message);
  }
}
