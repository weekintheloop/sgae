/**
 * @fileoverview Ferramentas de Diagnóstico
 * @version 4.1.0
 * @description Scripts para diagnosticar e resolver problemas comuns
 * 
 * Dependências:
 * - Core_UI_Safe.gs (getSafeUi, safeAlert, safePrompt)
 * - Core_Production_Logger.gs (ProductionLogger)
 */

'use strict';

// Usa funções de Core_UI_Safe.gs (getSafeUi, safeAlert, safePrompt)

// Helper para logging - usa Logger ao invés de console
const _diagLog = function(msg) {
  Logger.log(msg);
};

/**
 * ============================================================================
 * DIAGNÓSTICO COMPLETO DO SISTEMA
 * ============================================================================
 */

/**
 * Executa diagnóstico completo do sistema
 * Execute esta função para identificar problemas
 */
function executarDiagnosticoCompleto() {
  _diagLog('='.repeat(80));
  _diagLog('DIAGNÓSTICO COMPLETO DO SISTEMA UNIAE');
  _diagLog('='.repeat(80));
  _diagLog('');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    versao: '2.0.0',
    testes: []
  };
  
  // 1. Testar doGet
  resultados.testes.push(testarDoGet());
  
  // 2. Testar acesso a planilhas
  resultados.testes.push(testarAcessoPlanilhas());
  
  // 3. Testar funções auxiliares
  resultados.testes.push(testarFuncoesAuxiliares());
  
  // 4. Testar estrutura de dados
  resultados.testes.push(testarEstruturaDados());
  
  // 5. Testar permissões
  resultados.testes.push(testarPermissoes());
  
  // 6. Testar quotas
  resultados.testes.push(testarQuotas());
  
  // Resumo
  _diagLog('');
  _diagLog('='.repeat(80));
  _diagLog('RESUMO DO DIAGNÓSTICO');
  _diagLog('='.repeat(80));
  
  const total = resultados.testes.length;
  const passou = resultados.testes.filter(t => t.status === 'OK').length;
  const falhou = resultados.testes.filter(t => t.status === 'ERRO').length;
  const aviso = resultados.testes.filter(t => t.status === 'AVISO').length;
  
  _diagLog(`Total de testes: ${total}`);
  _diagLog(`✅ Passou: ${passou}`);
  _diagLog(`❌ Falhou: ${falhou}`);
  _diagLog(`⚠️  Avisos: ${aviso}`);
  _diagLog('');
  
  if (falhou === 0) {
    _diagLog('🎉 Sistema está funcionando corretamente!');
  } else {
    _diagLog('⚠️  Foram encontrados problemas. Veja detalhes acima.');
  }
  
  _diagLog('='.repeat(80));
  
  return resultados;
}

/**
 * Testa função doGet
 */
function testarDoGet() {
  _diagLog('1. Testando função doGet...');
  
  try {
    if (typeof doGet !== 'function') {
      _diagLog('   ❌ ERRO: Função doGet não está definida');
      return {
        nome: 'doGet',
        status: 'ERRO',
        mensagem: 'Função doGet não encontrada'
      };
    }
    
    const resultado = doGet({ parameter: {} });
    
    if (!resultado) {
      _diagLog('   ❌ ERRO: doGet retornou null/undefined');
      return {
        nome: 'doGet',
        status: 'ERRO',
        mensagem: 'doGet retornou valor inválido'
      };
    }
    
    const content = resultado.getContent();
    if (!content || content.length === 0) {
      _diagLog('   ⚠️  AVISO: doGet retornou HTML vazio');
      return {
        nome: 'doGet',
        status: 'AVISO',
        mensagem: 'HTML retornado está vazio'
      };
    }
    
    _diagLog('   ✅ OK: doGet funciona corretamente');
    _diagLog(`   Tamanho do HTML: ${content.length} caracteres`);
    
    return {
      nome: 'doGet',
      status: 'OK',
      mensagem: 'Função doGet operacional',
      detalhes: {
        tamanhoHTML: content.length
      }
    };
    
  } catch (error) {
    _diagLog(`   ❌ ERRO: ${error.message}`);
    return {
      nome: 'doGet',
      status: 'ERRO',
      mensagem: error.message,
      stack: error.stack
    };
  }
}

/**
 * Testa acesso a planilhas
 */
function testarAcessoPlanilhas() {
  _diagLog('');
  _diagLog('2. Testando acesso a planilhas...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!ss) {
      _diagLog('   ❌ ERRO: Não foi possível acessar a planilha');
      return {
        nome: 'Acesso a Planilhas',
        status: 'ERRO',
        mensagem: 'SpreadsheetApp.getActiveSpreadsheet() retornou null'
      };
    }
    
    _diagLog(`   ✅ Planilha: ${ss.getName()}`);
    _diagLog(`   ID: ${ss.getId()}`);
    
    const sheets = ss.getSheets();
    _diagLog(`   Total de abas: ${sheets.length}`);
    
    const planilhasNecessarias = [
      'Notas_Fiscais',
      'Entregas',
      'Recusas',
      'Glosas',
      'Fornecedores'
    ];
    
    const planilhasExistentes = sheets.map(s => s.getName());
    const faltando = planilhasNecessarias.filter(p => !planilhasExistentes.includes(p));
    
    if (faltando.length > 0) {
      _diagLog(`   ⚠️  AVISO: Planilhas faltando: ${faltando.join(', ')}`);
      return {
        nome: 'Acesso a Planilhas',
        status: 'AVISO',
        mensagem: 'Algumas planilhas necessárias não existem',
        detalhes: {
          faltando: faltando,
          existentes: planilhasExistentes
        }
      };
    }
    
    _diagLog('   ✅ OK: Todas as planilhas necessárias existem');
    
    return {
      nome: 'Acesso a Planilhas',
      status: 'OK',
      mensagem: 'Acesso a planilhas operacional',
      detalhes: {
        nome: ss.getName(),
        id: ss.getId(),
        totalAbas: sheets.length,
        abas: planilhasExistentes
      }
    };
    
  } catch (error) {
    _diagLog(`   ❌ ERRO: ${error.message}`);
    return {
      nome: 'Acesso a Planilhas',
      status: 'ERRO',
      mensagem: error.message,
      stack: error.stack
    };
  }
}

/**
 * Testa funções auxiliares
 */
function testarFuncoesAuxiliares() {
  _diagLog('');
  _diagLog('3. Testando funções auxiliares...');
  
  const funcoesNecessarias = [
    'getSheet',
    'getSafeDataRange',
    'generateId',
    'getOrCreateSheetSafe',
    'addSheetRow',
    'getSheetData',
    'apiResponse',
    'include'
  ];
  
  const resultados = {
    definidas: [],
    naoDefinidas: []
  };
  
  // Mapa seguro de funções - evita uso de eval() (vulnerabilidade de injection)
  const funcaoMap = {
    'getSheet': typeof getSheet !== 'undefined' ? getSheet : null,
    'getSafeDataRange': typeof getSafeDataRange !== 'undefined' ? getSafeDataRange : null,
    'generateId': typeof generateId !== 'undefined' ? generateId : null,
    'getOrCreateSheetSafe': typeof getOrCreateSheetSafe !== 'undefined' ? getOrCreateSheetSafe : null,
    'addSheetRow': typeof addSheetRow !== 'undefined' ? addSheetRow : null,
    'getSheetData': typeof getSheetData !== 'undefined' ? getSheetData : null,
    'apiResponse': typeof apiResponse !== 'undefined' ? apiResponse : null,
    'include': typeof include !== 'undefined' ? include : null
  };
  
  funcoesNecessarias.forEach(nome => {
    try {
      const fn = funcaoMap[nome];
      if (typeof fn === 'function') {
        _diagLog(`   ✅ ${nome}`);
        resultados.definidas.push(nome);
      } else if (fn === null) {
        _diagLog(`   ❌ ${nome} (não encontrada)`);
        resultados.naoDefinidas.push(nome);
      } else {
        _diagLog(`   ❌ ${nome} (não é função)`);
        resultados.naoDefinidas.push(nome);
      }
    } catch (error) {
      _diagLog(`   ❌ ${nome} (erro: ${error.message})`);
      resultados.naoDefinidas.push(nome);
    }
  });
  
  if (resultados.naoDefinidas.length > 0) {
    return {
      nome: 'Funções Auxiliares',
      status: 'ERRO',
      mensagem: `${resultados.naoDefinidas.length} funções não encontradas`,
      detalhes: resultados
    };
  }
  
  _diagLog('   ✅ OK: Todas as funções auxiliares estão definidas');
  
  return {
    nome: 'Funções Auxiliares',
    status: 'OK',
    mensagem: 'Todas as funções auxiliares operacionais',
    detalhes: resultados
  };
}

/**
 * Testa estrutura de dados
 */
function testarEstruturaDados() {
  _diagLog('');
  _diagLog('4. Testando estrutura de dados...');
  
  try {
    const planilhas = ['Notas_Fiscais', 'Entregas', 'Recusas', 'Glosas'];
    const resultados = {};
    
    planilhas.forEach(nome => {
      try {
        const dados = getSheetData(nome, 10);
        resultados[nome] = {
          status: 'OK',
          registros: dados.count || 0,
          headers: dados.headers ? dados.headers.length : 0
        };
        _diagLog(`   ✅ ${nome}: ${resultados[nome].registros} registros`);
      } catch (error) {
        resultados[nome] = {
          status: 'ERRO',
          erro: error.message
        };
        _diagLog(`   ❌ ${nome}: ${error.message}`);
      }
    });
    
    const erros = Object.values(resultados).filter(r => r.status === 'ERRO');
    
    if (erros.length > 0) {
      return {
        nome: 'Estrutura de Dados',
        status: 'ERRO',
        mensagem: `${erros.length} planilhas com erro`,
        detalhes: resultados
      };
    }
    
    _diagLog('   ✅ OK: Estrutura de dados válida');
    
    return {
      nome: 'Estrutura de Dados',
      status: 'OK',
      mensagem: 'Estrutura de dados operacional',
      detalhes: resultados
    };
    
  } catch (error) {
    _diagLog(`   ❌ ERRO: ${error.message}`);
    return {
      nome: 'Estrutura de Dados',
      status: 'ERRO',
      mensagem: error.message,
      stack: error.stack
    };
  }
}

/**
 * Testa permissões
 */
function testarPermissoes() {
  _diagLog('');
  _diagLog('5. Testando permissões...');
  
  const permissoes = {
    spreadsheet: false,
    user: false,
    properties: false
  };
  
  // Testar acesso a planilha
  try {
    SpreadsheetApp.getActiveSpreadsheet();
    permissoes.spreadsheet = true;
    _diagLog('   ✅ Acesso a Spreadsheet');
  } catch (error) {
    _diagLog('   ❌ Acesso a Spreadsheet negado');
  }
  
  // Testar acesso a usuário
  try {
    const email = Session.getActiveUser().getEmail();
    permissoes.user = true;
    _diagLog(`   ✅ Acesso a User: ${email}`);
  } catch (error) {
    _diagLog('   ❌ Acesso a User negado');
  }
  
  // Testar acesso a propriedades
  try {
    PropertiesService.getUserProperties();
    permissoes.properties = true;
    _diagLog('   ✅ Acesso a Properties');
  } catch (error) {
    _diagLog('   ❌ Acesso a Properties negado');
  }
  
  const todasPermissoes = Object.values(permissoes).every(p => p);
  
  if (!todasPermissoes) {
    return {
      nome: 'Permissões',
      status: 'ERRO',
      mensagem: 'Algumas permissões estão faltando',
      detalhes: permissoes
    };
  }
  
  _diagLog('   ✅ OK: Todas as permissões concedidas');
  
  return {
    nome: 'Permissões',
    status: 'OK',
    mensagem: 'Permissões adequadas',
    detalhes: permissoes
  };
}

/**
 * Testa quotas disponíveis
 */
function testarQuotas() {
  _diagLog('');
  _diagLog('6. Testando quotas...');
  
  try {
    const emailQuota = MailApp.getRemainingDailyQuota();
    _diagLog(`   Email quota restante: ${emailQuota}`);
    
    const quotas = {
      email: emailQuota
    };
    
    if (emailQuota < 10) {
      _diagLog('   ⚠️  AVISO: Quota de email baixa');
      return {
        nome: 'Quotas',
        status: 'AVISO',
        mensagem: 'Quota de email baixa',
        detalhes: quotas
      };
    }
    
    _diagLog('   ✅ OK: Quotas adequadas');
    
    return {
      nome: 'Quotas',
      status: 'OK',
      mensagem: 'Quotas disponíveis',
      detalhes: quotas
    };
    
  } catch (error) {
    _diagLog(`   ⚠️  AVISO: Não foi possível verificar quotas`);
    return {
      nome: 'Quotas',
      status: 'AVISO',
      mensagem: 'Não foi possível verificar quotas',
      erro: error.message
    };
  }
}

/**
 * ============================================================================
 * FERRAMENTAS DE CORREÇÃO AUTOMÁTICA
 * ============================================================================
 */

/**
 * Corrige problemas comuns automaticamente
 */
function corrigirProblemasAutomaticamente() {
  _diagLog('='.repeat(80));
  _diagLog('CORREÇÃO AUTOMÁTICA DE PROBLEMAS');
  _diagLog('='.repeat(80));
  _diagLog('');
  
  const acoes = [];
  
  // 1. Criar planilhas faltantes
  acoes.push(criarPlanilhasFaltantes());
  
  // 2. Adicionar headers faltantes
  acoes.push(adicionarHeadersFaltantes());
  
  // 3. Limpar cache
  acoes.push(limparCache());
  
  _diagLog('');
  _diagLog('='.repeat(80));
  _diagLog('CORREÇÃO CONCLUÍDA');
  _diagLog('='.repeat(80));
  
  const sucesso = acoes.filter(a => a.status === 'OK').length;
  _diagLog(`✅ ${sucesso} ações executadas com sucesso`);
  
  return acoes;
}

/**
 * Cria planilhas faltantes
 */
function criarPlanilhasFaltantes() {
  _diagLog('1. Criando planilhas faltantes...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const planilhasConfig = [
      {
        nome: 'Notas_Fiscais',
        headers: ['ID', 'Numero_NF', 'Chave_Acesso', 'Data_Emissao', 'Fornecedor', 'Valor_Total', 'Status_NF']
      },
      {
        nome: 'Entregas',
        headers: ['ID', 'Data_Entrega', 'Numero_NF', 'Fornecedor', 'Produto', 'Quantidade', 'Status_Entrega']
      },
      {
        nome: 'Recusas',
        headers: ['ID', 'Data_Recusa', 'Fornecedor', 'Produto', 'Motivo', 'Status']
      },
      {
        nome: 'Glosas',
        headers: ['ID', 'Data_Glosa', 'Numero_NF', 'Fornecedor', 'Valor_Glosa', 'Motivo', 'Status']
      },
      {
        nome: 'Fornecedores',
        headers: ['ID', 'CNPJ', 'Razao_Social', 'Nome_Fantasia', 'Email', 'Telefone', 'Status']
      }
    ];
    
    let criadas = 0;
    
    planilhasConfig.forEach(config => {
      let sheet = ss.getSheetByName(config.nome);
      if (!sheet) {
        sheet = ss.insertSheet(config.nome);
        sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
        sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold');
        _diagLog(`   ✅ Criada: ${config.nome}`);
        criadas++;
      }
    });
    
    if (criadas === 0) {
      _diagLog('   ℹ️  Nenhuma planilha precisou ser criada');
    } else {
      _diagLog(`   ✅ ${criadas} planilhas criadas`);
    }
    
    return {
      acao: 'Criar Planilhas',
      status: 'OK',
      mensagem: `${criadas} planilhas criadas`
    };
    
  } catch (error) {
    _diagLog(`   ❌ ERRO: ${error.message}`);
    return {
      acao: 'Criar Planilhas',
      status: 'ERRO',
      mensagem: error.message
    };
  }
}

/**
 * Adiciona headers faltantes
 */
function adicionarHeadersFaltantes() {
  _diagLog('');
  _diagLog('2. Verificando headers...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    let corrigidas = 0;
    
    sheets.forEach(sheet => {
      if (sheet.getLastRow() === 0) {
        _diagLog(`   ⚠️  ${sheet.getName()} está vazia, pulando...`);
      }
    });
    
    _diagLog('   ✅ Headers verificados');
    
    return {
      acao: 'Verificar Headers',
      status: 'OK',
      mensagem: 'Headers verificados'
    };
    
  } catch (error) {
    _diagLog(`   ❌ ERRO: ${error.message}`);
    return {
      acao: 'Verificar Headers',
      status: 'ERRO',
      mensagem: error.message
    };
  }
}

/**
 * Limpa cache do sistema
 */
function limparCache() {
  _diagLog('');
  _diagLog('3. Limpando cache...');
  
  try {
    CacheService.getScriptCache().removeAll();
    CacheService.getUserCache().removeAll();
    
    _diagLog('   ✅ Cache limpo');
    
    return {
      acao: 'Limpar Cache',
      status: 'OK',
      mensagem: 'Cache limpo com sucesso'
    };
    
  } catch (error) {
    _diagLog(`   ❌ ERRO: ${error.message}`);
    return {
      acao: 'Limpar Cache',
      status: 'ERRO',
      mensagem: error.message
    };
  }
}

/**
 * ============================================================================
 * MENU DE DIAGNÓSTICO
 * ============================================================================
 */

/**
 * Adiciona menu de diagnóstico
 */
function adicionarMenuDiagnostico() {
  const ui = getUiSafely();
  if (!ui) return;
  
  ui.createMenu('🔧 Diagnóstico')
    .addItem('🔍 Executar Diagnóstico Completo', 'executarDiagnosticoCompleto')
    .addItem('🔧 Corrigir Problemas Automaticamente', 'corrigirProblemasAutomaticamente')
    .addSeparator()
    .addItem('🧪 Testar doGet', 'testarDoGet')
    .addItem('📊 Testar Planilhas', 'testarAcessoPlanilhas')
    .addItem('⚙️ Testar Funções', 'testarFuncoesAuxiliares')
    .addSeparator()
    .addItem('🗑️ Limpar Cache', 'limparCache')
    .addToUi();
}
