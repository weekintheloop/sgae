/**
 * @fileoverview Setup de Dados Sintéticos para Testes
 * @version 1.0.0
 * @description Cria dados de teste com senhas em TEXTO PLANO
 * para testar os casos de uso do sistema UNIAE CRE.
 * 
 * @author UNIAE CRE Team
 * @created 2025-12-09
 */

'use strict';

// ============================================================================
// ESTRUTURA DE DADOS ESPERADA
// ============================================================================

/**
 * Headers da planilha Usuarios
 * DEPRECATED: Use USUARIOS_SCHEMA.HEADERS de Core_Schema_Usuarios.gs
 * Mantido para compatibilidade - referencia o schema unificado
 */
var USUARIOS_HEADERS = (typeof USUARIOS_SCHEMA !== 'undefined') 
  ? USUARIOS_SCHEMA.HEADERS 
  : [
    'email', 'nome', 'senha', 'tipo', 'instituicao', 'telefone', 'cpf', 'cnpj',
    'ativo', 'dataCriacao', 'dataAtualizacao', 'ultimoAcesso', 'token'
  ];

/**
 * Dados sintéticos de usuários para teste
 * DEPRECATED: Use USUARIOS_DADOS_TESTE de Core_Schema_Usuarios.gs
 * Mantido para compatibilidade - referencia o schema unificado
 */
var USUARIOS_TESTE = (typeof USUARIOS_DADOS_TESTE !== 'undefined') 
  ? USUARIOS_DADOS_TESTE 
  : [
    {
      email: 'admin@uniae.gov.br',
      nome: 'Administrador Sistema',
      senha: 'Admin@2025',
      tipo: 'ADMIN',
      instituicao: 'UNIAE/CRE-PP',
      telefone: '(61) 3333-0001',
      cpf: '000.000.000-01',
      cnpj: '',
      ativo: 'ATIVO',
      dataCriacao: new Date(),
      dataAtualizacao: '',
      ultimoAcesso: '',
      token: ''
    },
    {
      email: 'analista@uniae.gov.br',
      nome: 'Ana Paula Silva',
      senha: 'Analista@2025',
      tipo: 'ANALISTA',
      instituicao: 'UNIAE/CRE-PP',
      telefone: '(61) 3333-0002',
      cpf: '000.000.000-02',
      cnpj: '',
      ativo: 'ATIVO',
      dataCriacao: new Date(),
      dataAtualizacao: '',
      ultimoAcesso: '',
      token: ''
    },
    {
      email: 'teste@teste.com',
      nome: 'Usuário de Teste',
      senha: 'Teste@123',
      tipo: 'ANALISTA',
      instituicao: 'Teste',
      telefone: '(61) 9999-9999',
      cpf: '000.000.000-00',
      cnpj: '',
      ativo: 'ATIVO',
      dataCriacao: new Date(),
      dataAtualizacao: '',
      ultimoAcesso: '',
      token: ''
    }
  ];

/**
 * Dados sintéticos de Notas Fiscais
 */
var NOTAS_FISCAIS_TESTE = [
  {
    id: 'NF_001',
    numero_nf: '000001',
    serie: '1',
    chave_acesso: '53251212345678000199550010000000011234567890',
    fornecedor: 'Alimentos Brasil LTDA',
    cnpj: '12.345.678/0001-99',
    valor_total: 15000.00,
    valor_liquido: 15000.00,
    data_emissao: new Date(2025, 11, 1),
    data_cadastro: new Date(),
    status: 'PENDENTE',
    usuario_cadastro: 'analista@uniae.gov.br',
    nota_empenho: '2025/000001',
    itens_quantidade: 25
  },
  {
    id: 'NF_002',
    numero_nf: '000002',
    serie: '1',
    chave_acesso: '53251212345678000199550010000000021234567891',
    fornecedor: 'Distribuidora de Alimentos XYZ',
    cnpj: '98.765.432/0001-10',
    valor_total: 8500.50,
    valor_liquido: 8500.50,
    data_emissao: new Date(2025, 11, 2),
    data_cadastro: new Date(),
    status: 'PENDENTE',
    usuario_cadastro: 'analista@uniae.gov.br',
    nota_empenho: '2025/000002',
    itens_quantidade: 15
  },
  {
    id: 'NF_003',
    numero_nf: '000003',
    serie: '1',
    chave_acesso: '53251212345678000199550010000000031234567892',
    fornecedor: 'Hortifruti Central',
    cnpj: '11.222.333/0001-44',
    valor_total: 3200.00,
    valor_liquido: 3200.00,
    data_emissao: new Date(2025, 11, 3),
    data_cadastro: new Date(),
    status: 'RECEBIDA',
    usuario_cadastro: 'analista@uniae.gov.br',
    nota_empenho: '2025/000003',
    itens_quantidade: 10
  }
];

/**
 * Dados sintéticos de Entregas
 */
var ENTREGAS_TESTE = [
  {
    id: 'ENT_001',
    nota_fiscal_id: 'NF_003',
    numero_nf: '000003',
    fornecedor: 'Hortifruti Central',
    unidade_escolar: 'EC 01 Plano Piloto',
    data_entrega: new Date(2025, 11, 5),
    hora_entrega: '09:30',
    responsavel_recebimento: 'Roberto Lima',
    matricula_responsavel: '123456',
    quantidade_volumes: 8,
    temperatura_adequada: true,
    embalagem_integra: true,
    documentacao_ok: true,
    status: 'ENTREGUE',
    usuario_registro: 'escola@seedf.gov.br',
    data_registro: new Date()
  }
];

// ============================================================================
// FUNÇÕES DE SETUP
// ============================================================================

/**
 * Configura planilha de Usuários com dados de teste
 * SENHAS EM TEXTO PLANO
 */
function setupUsuariosTeste() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('SETUP: Configurando Usuários de Teste');
  Logger.log('⚠️ SENHAS EM TEXTO PLANO');
  Logger.log('═══════════════════════════════════════════════');
  
  var ss = getSS();
  var sheet = ss.getSheetByName('Usuarios');
  
  if (!sheet) {
    sheet = ss.insertSheet('Usuarios');
    Logger.log('Planilha Usuarios criada');
  }
  
  // Limpa dados existentes (mantém headers se existirem)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    Logger.log('Dados anteriores removidos');
  }
  
  // Define headers
  sheet.getRange(1, 1, 1, USUARIOS_HEADERS.length).setValues([USUARIOS_HEADERS]);
  sheet.getRange(1, 1, 1, USUARIOS_HEADERS.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, USUARIOS_HEADERS.length).setBackground('#4a86e8');
  sheet.getRange(1, 1, 1, USUARIOS_HEADERS.length).setFontColor('white');
  
  // Insere dados
  var dados = USUARIOS_TESTE.map(function(u) {
    return USUARIOS_HEADERS.map(function(h) {
      return u[h] !== undefined ? u[h] : '';
    });
  });
  
  sheet.getRange(2, 1, dados.length, USUARIOS_HEADERS.length).setValues(dados);
  
  // Formata
  sheet.autoResizeColumns(1, USUARIOS_HEADERS.length);
  
  Logger.log('');
  Logger.log('✅ ' + USUARIOS_TESTE.length + ' usuários criados');
  Logger.log('');
  Logger.log('📋 CREDENCIAIS DE TESTE (TEXTO PLANO):');
  Logger.log('─────────────────────────────────────────');
  
  USUARIOS_TESTE.forEach(function(u) {
    Logger.log('   ' + u.tipo + ': ' + u.email + ' / ' + u.senha);
  });
  
  Logger.log('─────────────────────────────────────────');
  
  return {
    success: true,
    message: USUARIOS_TESTE.length + ' usuários criados',
    usuarios: USUARIOS_TESTE.map(function(u) {
      return { email: u.email, senha: u.senha, tipo: u.tipo };
    })
  };
}

/**
 * Configura planilha de Notas Fiscais com dados de teste
 */
function setupNotasFiscaisTeste() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('SETUP: Configurando Notas Fiscais de Teste');
  Logger.log('═══════════════════════════════════════════════');
  
  var ss = getSS();
  var sheet = ss.getSheetByName('Notas_Fiscais');
  
  if (!sheet) {
    sheet = ss.insertSheet('Notas_Fiscais');
    Logger.log('Planilha Notas_Fiscais criada');
  }
  
  var headers = Object.keys(NOTAS_FISCAIS_TESTE[0]);
  
  // Limpa e configura
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#6aa84f');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  
  var dados = NOTAS_FISCAIS_TESTE.map(function(nf) {
    return headers.map(function(h) {
      return nf[h] !== undefined ? nf[h] : '';
    });
  });
  
  sheet.getRange(2, 1, dados.length, headers.length).setValues(dados);
  sheet.autoResizeColumns(1, headers.length);
  
  Logger.log('✅ ' + NOTAS_FISCAIS_TESTE.length + ' notas fiscais criadas');
  
  return {
    success: true,
    message: NOTAS_FISCAIS_TESTE.length + ' notas fiscais criadas'
  };
}

/**
 * Configura planilha de Entregas com dados de teste
 */
function setupEntregasTeste() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('SETUP: Configurando Entregas de Teste');
  Logger.log('═══════════════════════════════════════════════');
  
  var ss = getSS();
  var sheet = ss.getSheetByName('Entregas');
  
  if (!sheet) {
    sheet = ss.insertSheet('Entregas');
    Logger.log('Planilha Entregas criada');
  }
  
  var headers = Object.keys(ENTREGAS_TESTE[0]);
  
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#e69138');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  
  var dados = ENTREGAS_TESTE.map(function(e) {
    return headers.map(function(h) {
      return e[h] !== undefined ? e[h] : '';
    });
  });
  
  sheet.getRange(2, 1, dados.length, headers.length).setValues(dados);
  sheet.autoResizeColumns(1, headers.length);
  
  Logger.log('✅ ' + ENTREGAS_TESTE.length + ' entregas criadas');
  
  return {
    success: true,
    message: ENTREGAS_TESTE.length + ' entregas criadas'
  };
}

/**
 * Configura planilha de Controle de Conferência
 */
function setupConferenciasTeste() {
  Logger.log('');
  Logger.log('═══════════════════════════════════════════════');
  Logger.log('SETUP: Configurando Controle de Conferência');
  Logger.log('═══════════════════════════════════════════════');
  
  var ss = getSS();
  var sheet = ss.getSheetByName('Controle_Conferencia');
  
  if (!sheet) {
    sheet = ss.insertSheet('Controle_Conferencia');
    Logger.log('Planilha Controle_Conferencia criada');
  }
  
  var headers = [
    'id', 'nota_fiscal_id', 'numero_nf', 'fornecedor', 'valor_nf',
    'data_inicio', 'usuario_conferencia', 'status', 'itens_conferidos',
    'itens_total', 'valor_conferido', 'valor_glosa', 'observacoes',
    'data_conclusao', 'usuario_atesto', 'parecer', 'valor_liquido_final'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.getRange(1, 1, 1, headers.length).setBackground('#9900ff');
  sheet.getRange(1, 1, 1, headers.length).setFontColor('white');
  sheet.autoResizeColumns(1, headers.length);
  
  Logger.log('✅ Planilha de conferência configurada');
  
  return { success: true };
}

// ============================================================================
// SETUP COMPLETO
// ============================================================================

/**
 * Executa setup completo de todos os dados de teste
 */
function setupDadosTesteCompleto() {
  Logger.log('');
  Logger.log('╔═══════════════════════════════════════════════════════════════════╗');
  Logger.log('║     SETUP COMPLETO DE DADOS DE TESTE                             ║');
  Logger.log('║     Sistema UNIAE CRE - Senhas em TEXTO PLANO                    ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  var resultados = [];
  
  resultados.push(setupUsuariosTeste());
  resultados.push(setupNotasFiscaisTeste());
  resultados.push(setupEntregasTeste());
  resultados.push(setupConferenciasTeste());
  
  Logger.log('');
  Logger.log('╔═══════════════════════════════════════════════════════════════════╗');
  Logger.log('║     SETUP CONCLUÍDO                                              ║');
  Logger.log('╠═══════════════════════════════════════════════════════════════════╣');
  Logger.log('║ ✅ Usuários: 8 registros (senhas em texto plano)');
  Logger.log('║ ✅ Notas Fiscais: 3 registros');
  Logger.log('║ ✅ Entregas: 1 registro');
  Logger.log('║ ✅ Controle Conferência: estrutura criada');
  Logger.log('╚═══════════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('🔑 Para testar login, use:');
  Logger.log('   Email: analista@uniae.gov.br');
  Logger.log('   Senha: Analista@2025');
  Logger.log('');
  Logger.log('   Ou: teste@teste.com / Teste@123');
  
  return {
    success: true,
    message: 'Setup completo realizado'
  };
}



/**
 * Lista credenciais de teste disponíveis
 */
function listarCredenciaisTeste() {
  Logger.log('');
  Logger.log('╔═══════════════════════════════════════════════════════════════════╗');
  Logger.log('║     CREDENCIAIS DE TESTE DISPONÍVEIS                             ║');
  Logger.log('║     ⚠️ SENHAS EM TEXTO PLANO                                      ║');
  Logger.log('╚═══════════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  USUARIOS_TESTE.forEach(function(u, i) {
    Logger.log((i + 1) + '. ' + u.tipo);
    Logger.log('   📧 Email: ' + u.email);
    Logger.log('   🔑 Senha: ' + u.senha);
    Logger.log('   🏢 Instituição: ' + u.instituicao);
    Logger.log('');
  });
  
  return USUARIOS_TESTE.map(function(u) {
    return {
      email: u.email,
      senha: u.senha,
      tipo: u.tipo
    };
  });
}

// Log de carregamento
Logger.log('✅ Setup_Dados_Teste.gs carregado');
