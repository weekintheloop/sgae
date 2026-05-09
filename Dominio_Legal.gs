// Requer V8 runtime habilitado no Apps Script
'use strict';

/**
 * DOMINIO_LEGAL
 * Consolidado de : LegalReports.gs, ConformidadeAuditoria.gs
 * @version 2.0.0
 * @created 2025-11-04
 */


// ---- LegalReports.gs ----
/**
 * LegalReports.gs - Relatórios de Conformidade Legal
 * Sistema UNIAE CRE PP/Cruzeiro - Conformidade Legal
 *
 * Gera relatórios específicos de conformidade legal, identificando lacunas,
 * violações e recomendações baseadas na análise crítica da legislação aplicável.
 */

/**
 * GERADOR DE RELATÓRIOS DE CONFORMIDADE LEGAL
 */
var LEGAL_REPORTS = {

  /**
   * Gera relatório completo de conformidade legal
   */
  generateComprehensiveComplianceReport: function() {
    var report = {
      metadata : {
        title : 'Relatório de Conformidade Legal - Sistema UNIAE',
        subtitle : 'Análise Crítica da Legislação de Conferência de Notas Fiscais e Notas de Empenho',
        generated_at : new Date(),
        version : '3.0.0-legal-compliance',
        scope : 'SEEDF/CRE-PPA - Fornecedores de Gêneros Alimentícios'
      }

      // executive_summary : this.generateExecutiveSummary(),
      legal_framework_analysis : this.analyzeLegalFramework(),
      responsibility_matrix : this.generateResponsibilityMatrix(),
      critical_gaps : this.identifyCriticalGaps(),
      compliance_violations : this.identifyComplianceViolations(),
      recommendations : this.generateCriticalRecommendations(),
      implementation_roadmap : this.generateImplementationRoadmap()
    };

  }

  /**
   * Gera resumo executivo
   */
  generateExecutiveSummary: function() {
      overview : 'A legislação que rege a conferência de notas fiscais e notas de empenho na CRE-PP é dispersa, incoerente e inadequada à realidade operacional local.',

      // key_findings : [
        'Analistas educacionais trabalham em VÁCUO LEGAL',
        'UNIAE sem base legal clara para conferência',
        'Conflito entre Lei 14.133/2021 e necessidades operacionais',
        'Responsabilidades pulverizadas sem designação formal',
        'Procedimentos baseados em interpretações customizadas'
      ]

  //  critical_impact : 'O trabalho dos analistas educacionais ocorre em vácuo legal, fundamentando-se em interpretações customizadas de normativas genéricas em vez de atribuições formalmente designadas.'

  //  urgency_level : 'CRÍTICA'

      // primary_recommendation : 'Revisão abrangente em cascata (federal ? distrital ? regional) é essencial para coerência e segurança jurídica operacional.'
    };
  }

  /**
   * Analisa framework legal aplicável
   */
  analyzeLegalFramework: function() {
      federal_legislation : {
        'LEI_11947_2009' : {
          status : 'APLICÁVEL_COM_LACUNAS',
          strengths : ['Designa SEEDF como EEx', 'Define prazo de guarda (5 anos)'],
          gaps : ['Não especifica mecanismos detalhados de conferência', 'Não clarifica responsabilidades regionais'],
          impact : 'ALTO'
        },

        'LEI_14133_2021' : {
          status : 'CONFLITO_OPERACIONAL',
          strengths : ['Define fiscal de contrato', 'Exige registro próprio'],
          conflicts : ['Atestação após recebimento completo vs. perecíveis imediatos'],
          impact : 'MÉDIO'
        },

        'RESOLUCAO_FNDE_06_2020' : {
          status : 'VAGA_OPERACIONALIZACAO',
          strengths : ['Exige Comissão de Recebimento', 'Define atestação obrigatória'],
          gaps : ['Vaga na operacionalização regional', 'Não detalha procedimentos'],
          impact : 'ALTO'
        }
      }

      // distrital_legislation : {
        'DECRETO_37387_2016' : {
          status : 'LACUNA_UNIAE',
          gaps : ['Não menciona atribuições da UNIAE'],
          recommendation : 'Decreto regulamentador necessário'
        },

        'PORTARIA_192_2019' : {
          status : 'INSUFICIENTE',
          gaps : ['Apenas tangencia competências da UNIAE'],
          recommendation : 'Portaria detalhada necessária'
        }
      }

      // overall_assessment : {
        coherence_score : 35 // 0-100,
        coverage_score : 45   // 0-100,
        operability_score : 25 // 0-100,
        overall_score : 35     // 0-100,
        classification : 'INADEQUADO_PARA_OPERACAO'
      }
    };

  /**
   * Gera matriz de responsabilidades
   */
  generateResponsibilityMatrix: function() {
      hierarchy_levels : {
        'FEDERAL' : {
          entity : 'FNDE',
          legal_basis : 'LEI_11947_2009',
          responsibilities : ['Normatização PNAE', 'Diretrizes nacionais'],
          current_status : 'ADEQUADO',
          system_mapping : 'NÃO_MAPEADO'
        },

        'DISTRITAL' : {
          entity : 'SEEDF (EEx)',
          legal_basis : 'LEI_11947_2009',
          responsibilities : ['Execução PNAE', 'Guarda documentos 5 anos'],
          current_status : 'GENÉRICO',
          gaps : ['Não especifica atribuições operacionais']
        },

        'REGIONAL' : {
          entity : 'CRE-PP',
          legal_basis : 'INDEFINIDO',
          responsibilities : ['Coordenação regional'],
          current_status : 'INDEFINIDO',
          critical_gap : 'Competências não formalizadas'
        },

        'LOCAL' : {
          entity : 'UNIAE',
          legal_basis : 'LACUNA_LEGAL',
          responsibilities : ['Infraestrutura', 'Apoio educacional'],
          current_status : 'VÁCUO_LEGAL',
          critical_impact : 'SEM BASE LEGAL CLARA'
        },

        'OPERACIONAL' : {
          entity : 'Comissão de Recebimento',
          legal_basis : 'RESOLUCAO_FNDE_06_2020',
          responsibilities : ['Recebimento', 'Atestação'],
          current_status : 'VAGO',
          gaps : ['Operacionalização não detalhada']
        },

        'INDIVIDUAL' : {
          entity : 'Analistas Educacionais',
          legal_basis : 'VÁCUO_LEGAL',
          responsibilities : ['Conferência', 'Análise'],
          current_status : 'CRÍTICO',
          critical_problem : 'Trabalham sem designação formal'
        }
      }

      // responsibility_gaps : {
        total_levels : 6,
        levels_with_clear_basis : 2,
        levels_with_gaps : 4,
        critical_gaps : 2,
        compliance_percentage : 33.33
      }
    };

  /**
   * Identifica lacunas críticas
   */
  identifyCriticalGaps: function() {
      primary_gaps : [
        {
          id : 'GAP_001',
          title : 'Vácuo Legal dos Analistas Educacionais',
          description : 'Analistas educacionais trabalham em vácuo legal, fundamentando-se em interpretações customizadas',
          legal_basis_missing : 'Designação formal em instrumento legal',
          impact : 'CRÍTICO',
          affected_operations : ['Conferência de NF', 'Validação de empenhos', 'Registro de ocorrências'],
          urgency : 'IMEDIATA'
        },

        {
          id : 'GAP_002',
          title : 'Atribuições da UNIAE Não Formalizadas',
          description : 'UNIAE sem base legal clara para conferência de notas fiscais',
          legal_basis_missing : 'Decreto regulamentador das atribuições',
          impact : 'ALTO',
          affected_operations : ['Apoio à Comissão', 'Infraestrutura de recebimento'],
          urgency : 'ALTA'
        },

        {
          id : 'GAP_003',
          title : 'Procedimentos de Conferência Vagos',
          description : 'Resolução FNDE vaga na operacionalização regional',
          legal_basis_missing : 'Manual de procedimentos com base legal',
          impact : 'ALTO',
          affected_operations : ['Processo de conferência', 'Atestação'],
          urgency : 'ALTA'
        },

        {
          id : 'GAP_004',
          title : 'Conflito Normativo Lei 14.133 vs. Perecíveis',
          description : 'Lei exige recebimento completo antes de atestação, conflitando com perecíveis',
          legal_basis_missing : 'Protocolo específico para gêneros perecíveis',
          impact : 'MÉDIO',
          affected_operations : ['Atestação de perecíveis'],
          urgency : 'MÉDIA'
        }
      ]

      // gap_analysis : {
        total_gaps : 4,
        critical_gaps : 1,
        high_priority_gaps : 2,
        medium_priority_gaps : 1,
        estimated_resolution_time : '90 dias',
        legal_risk_level : 'ALTO'
      }
    };

  /**
   * Identifica violações de conformidade
   */
  identifyComplianceViolations: function() {
      current_violations : [
        {
          id : 'VIO_001',
          type : 'RESPONSÁVEL_NÃO_DESIGNADO',
          description : 'Fiscal de contrato não designado conforme Lei 14.133/2021 Art. 117',
          legal_basis : 'LEI_14133_2021_ART_117',
          severity : 'CRÍTICA',
          current_status : 'ATIVO',
          corrective_action : 'Designar fiscal de contrato formalmente'
        },

        {
          id : 'VIO_002',
          type : 'COMISSÃO_NÃO_CONSTITUÍDA',
          description : 'Comissão de Recebimento não adequadamente constituída',
          legal_basis : 'RESOLUCAO_FNDE_06_2020',
          severity : 'ALTA',
          current_status : 'ATIVO',
          corrective_action : 'Constituir Comissão conforme Resolução FNDE'
        },

        {
          id : 'VIO_003',
          type : 'REGISTRO_PRÓPRIO_AUSENTE',
          description : 'Registro próprio de ocorrências não implementado',
          legal_basis : 'LEI_14133_2021_ART_117',
          severity : 'MÉDIA',
          current_status : 'PARCIAL',
          corrective_action : 'Implementar registro próprio completo'
        }
      ]

      // violation_summary : {
        total_violations : 3,
        critical_violations : 1,
        high_severity_violations : 1,
        medium_severity_violations : 1,
        compliance_score : 25 // 0-100,
        legal_risk_assessment : 'ALTO'
      }
    };

  /**
   * Gera recomendações críticas
   */
  generateCriticalRecommendations: function() {
      immediate_actions : [
        {
          priority : 'CRÍTICA',
          timeline : 'IMEDIATO',
          action : 'Designar formalmente analistas educacionais',
          legal_basis : 'LEI_14133_2021_ART_117',
          responsible : 'SEEDF',
          expected_outcome : 'Eliminar vácuo legal dos analistas'
        },

        {
          priority : 'CRÍTICA',
          timeline : '15 dias',
          action : 'Designar fiscal de contrato',
          legal_basis : 'LEI_14133_2021_ART_117',
          responsible : 'SEEDF',
          expected_outcome : 'Conformidade com Lei de Licitações'
        }
      ]

      // short_term_actions : [
        {
          priority : 'ALTA',
          timeline : '30 dias',
          action : 'Constituir Comissão de Recebimento adequada',
          legal_basis : 'RESOLUCAO_FNDE_06_2020',
          responsible : 'CRE-PP',
          expected_outcome : 'Atestação conforme Resolução FNDE'
        },

        {
          priority : 'ALTA',
          timeline : '60 dias',
          action : 'Criar decreto regulamentador das atribuições da UNIAE',
          legal_basis : 'LEI_11947_2009',
          responsible : 'SEEDF',
          expected_outcome : 'Formalizar base legal da UNIAE'
        }
      ]

      // medium_term_actions : [
        {
          priority : 'MÉDIA',
          timeline : '90 dias',
          action : 'Desenvolver manual de procedimentos com base legal',
          legal_basis : 'RESOLUCAO_FNDE_06_2020',
          responsible : 'SEEDF/CRE-PP',
          expected_outcome : 'Procedimentos padronizados e legais'
        },

        {
          priority : 'MÉDIA',
          timeline : '90 dias',
          action : 'Criar protocolo específico para gêneros perecíveis',
          legal_basis : 'LEI_14133_2021',
          responsible : 'SEEDF',
          expected_outcome : 'Resolver conflito normativo'
        }
      ]
    };

  /**
   * Gera roadmap de implementação
   */
  generateImplementationRoadmap: function() {
      phases : {
        'FASE_1_EMERGENCIAL' : {
          duration : '15 dias',
          objective : 'Resolver questões críticas imediatas',
          actions : [
            'Designar fiscal de contrato',
            'Designar formalmente analistas educacionais',
            'Implementar registro próprio de ocorrências'
          ]
      // success_criteria : 'Eliminação de violações críticas'
        },

        'FASE_2_ESTRUTURAL' : {
          duration : '30-60 dias',
          objective : 'Estabelecer estruturas legais adequadas',
          actions : [
            'Constituir Comissão de Recebimento',
            'Criar decreto regulamentador UNIAE',
            'Formalizar matriz de responsabilidades'
          ]
      // success_criteria : 'Base legal clara para todas as entidades'
        },

        'FASE_3_OPERACIONAL' : {
          duration : '60-90 dias',
          objective : 'Implementar procedimentos padronizados',
          actions : [
            'Manual de procedimentos legal',
            'Protocolo para perecíveis',
            'Sistema de monitoramento de conformidade'
          ]
      // success_criteria : 'Operação totalmente conforme'
        },

        'FASE_4_CONSOLIDACAO' : {
          duration : '90+ dias',
          objective : 'Consolidar e monitorar conformidade',
          actions : [
            'Treinamento em conformidade legal',
            'Auditoria de conformidade',
            'Melhoria contínua'
          ]
      // success_criteria : 'Conformidade sustentável'
        }
      }

      // success_metrics : {
        compliance_score_target : 95 // %
      // legal_violations_target : 0,
        gap_resolution_target : 100 // %
      // timeline_target : '90 dias'
      }
    };

/**
 * FUNÇÕES DE INTERFACE PARA RELATÓRIOS
 */

/**
 * Gera e exibe relatório de conformidade legal
 */
function generateLegalComplianceReport() {
  var ui = getSafeUi();

  try {
    ui.alert('Gerando Relatório de Conformidade Legal',
      'Iniciando análise abrangente da conformidade legal/* spread */\n\n' +
      'Este relatório incluirá : \n' +
      '• Análise do framework legal\n' +
      '• Identificação de lacunas críticas\n' +
      '• Matriz de responsabilidades\n' +
      '• Violações de conformidade\n' +
      '• Recomendações críticas\n' +
      '• Roadmap de implementação',
      ui.ButtonSet.OK
    );

    var report = LEGAL_REPORTS.generateComprehensiveComplianceReport();

    // Salvar relatório
    var savedReport = saveLegalReportToDrive(report);

    // Exibir resumo
    var summary = report.executive_summary;
    var gaps = report.critical_gaps;

    var message = 'RELATÓRIO DE CONFORMIDADE LEGAL GERADO\n\n';
    message += '?? RESUMO EXECUTIVO : \n';
    message += '• Nível de Urgência : ' + summary.urgency_level + '\n';
    message += '• Lacunas Críticas : ' + gaps.gap_analysis.critical_gaps + '\n';
    message += '• Lacunas Alta Prioridade : ' + gaps.gap_analysis.high_priority_gaps + '\n';
    message += '• Risco Legal : ' + gaps.gap_analysis.legal_risk_level + '\n\n';

    message += '?? PRINCIPAIS ACHADOS : \n';
    summary.key_findings.slice(0, 3).forEach(function(finding) {
      message += '• ' + finding + '\n';
    });

    message += '\n?? RELATÓRIO SALVO : \n';
    message += '• Nome : ' + savedReport.name + '\n';
    message += '• Local : Google Drive\n';
    message += '• URL : ' + savedReport.url;

    safeAlert('Relatório Gerado', message, ui.ButtonSet.OK);


  } catch (error) {
    safeAlert('Erro', 'Erro ao gerar relatório : ' + error.message, ui.ButtonSet.OK);
    Logger.log('Erro generateLegalComplianceReport : ' + error.message);
      chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
      return {
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
      };
    };
  }


/**
 * Salva relatório legal no Google Drive
 */
function saveLegalReportToDrive(report) {
  try {
    // Gerar nome do arquivo
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmm');
    var fileName = 'UNIAE_Relatorio_Conformidade_Legal_' + timestamp;

    // Converter relatório para formato legível
    var content = formatLegalReportContent(report);

    // Criar documento
    var doc = DocumentApp.create(fileName);
    var body = doc.getBody();
    body.clear();

    // Adicionar conteúdo
    addLegalReportContent(body, content);

    // Obter pasta de relatórios
    var folder = getOrCreateReportsFolder();

    // Mover arquivo
    var file = DriveApp.getFileById(doc.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      name : fileName,
      docId : doc.getId(),
      url : doc.getUrl(),
      folderId : folder.getId()
    };

  } catch (error) {
    Logger.log('Erro ao salvar relatório legal : ' + error.message);
    throw error;
      // chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
      return {
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
      };
    };
  }


/**
 * Formata conteúdo do relatório legal
 */
function formatLegalReportContent(report) {
  var content = '';

  // Cabeçalho
  content += report.metadata.title + '\n';
  content += report.metadata.subtitle + '\n';
  content += 'Gerado em : ' + report.metadata.generated_at.toLocaleDateString('pt-BR') + '\n';
  content += 'Versão : ' + report.metadata.version + '\n\n';

  // Resumo Executivo
  content += 'RESUMO EXECUTIVO\n\n';
  content += report.executive_summary.overview + '\n\n';
  content += 'PRINCIPAIS ACHADOS : \n';
  report.executive_summary.key_findings.forEach(function(finding) {
    content += '• ' + finding + '\n';
  });
  content += '\n';

  // Lacunas Críticas
  content += 'LACUNAS CRÍTICAS IDENTIFICADAS\n\n';
  report.critical_gaps.primary_gaps.forEach(function(gap) {
    content += gap.id + ' - ' + gap.title + '\n';
    content += 'Descrição : ' + gap.description + '\n';
    content += 'Impacto : ' + gap.impact + '\n';
    content += 'Urgência : ' + gap.urgency + '\n\n';
  });

  // Recomendações
  content += 'RECOMENDAÇÕES CRÍTICAS\n\n';
  content += 'AÇÕES IMEDIATAS : \n';
  report.recommendations.immediate_actions.forEach(function(action) {
    content += '• ' + action.action + ' (' + action.timeline + ')\n';
  });
  content += '\n';

}

/**
 * Adiciona conteúdo formatado ao documento
 */
function addLegalReportContent(body, content) {
  var lines = content.split('\n');

  lines.forEach(function(line) {
    if (line.trim() == '') {
      body.appendParagraph('');
    } else if (line == line.toUpperCase() && line.length > 10) {
      // Título
      var title = body.appendParagraph(line);
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    } else {
      body.appendParagraph(line);
    }
  });
}

/**
 * Interface para menu - Relatório de Lacunas Legais
 */
function relatorioLacunasLegaisDetalhado() {
  try {
    generateLegalComplianceReport();
  } catch (error) {
    var ui = getSafeUi();
    ui.alert('Erro', 'Erro ao gerar relatório detalhado : ' + error.message, ui.ButtonSet.OK);
    return {
      chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
    };
  }
}

// ---- ConformidadeAuditoria.gs ----
/**
 * ConformidadeAuditoria.gs
 * Sistema de Verificação de Conformidade e Auditoria
 * Opera sobre NotasFiscais.xlsx sem criar abas externas
 * Registra resultados em aba fixa Auditoria_Log
 * Sistema UNIAE CRE PP/Cruzeiro - Portaria 244/2006
 */

/**
 * ==
 * ESTRUTURA DA ABA AUDITORIA_LOG
 * ==
 */

var AUDITORIA_HEADERS = [
  'ID_Auditoria'           // Identificador único
  'Data_Auditoria'         // Data/hora da verificação
  'Tipo_Verificacao'       // Tipo de verificação realizada
  'NF_Numero'              // Número da NF verificada
  'Fornecedor_Nome'        // Nome do fornecedor
  'Resultado'              // Conforme|NaoConforme|Alerta|Critico
  'Score'                  // Pontuação (0-100)
  'Detalhes'               // Detalhes do resultado
  'Observacoes'            // Observações adicionais
  'Usuario'                // Usuário que executou
  'Acao_Recomendada'       // Ação recomendada
  'Status_Resolucao'        // Pendente|EmAnalise|Resolvido
];

/**
 * ==
 * TIPOS DE VERIFICAÇÃO
 * ==
 */

var TIPOS_VERIFICACAO = {
  MATEMATICA : 'Verificacao_Matematica',
  PDGP : 'Verificacao_PDGP',
  NFE_SEFAZ : 'Consulta_NFe_SEFAZ',
  PRAZO_ATESTO : 'Verificacao_Prazo_Atesto',
  INTEGRIDADE_DADOS : 'Integridade_Dados',
  DUPLICIDADE : 'Verificacao_Duplicidade',
  FORNECEDOR : 'Validacao_Fornecedor',
  VALORES : 'Validacao_Valores',
  DOCUMENTACAO : 'Verificacao_Documentacao',
  CONFORMIDADE_GERAL : 'Conformidade_Geral'
};

/**
 * ==
 * FUNÇÃO PRINCIPAL DE AUDITORIA
 * ==
 */

/**
 * Executa auditoria completa do sistema
 * @param { Object: Object } options - Opções : { tipos: tipos, maxRecords, autoFix}
 * @returns { Object: Object } Resultado da auditoria
 */
function executarAuditoriaCompleta(options) {
  options = options || {};
  var tipos = options.tipos || Object.values(TIPOS_VERIFICACAO);
  var maxRecords = options.maxRecords || 1000;
  var autoFix = options.autoFix || false;

  try {
    var resultados = {
      timestamp : new Date(),
      tipos : tipos,
      verificacoes : [],
      resumo : {
        total : 0,
        conforme : 0,
        naoConforme : 0,
        alertas : 0,
        criticos : 0
      }
    };

    // Executar cada tipo de verificação
    tipos.forEach(function(tipo) {
      var resultado = executarVerificacao(tipo, {maxRecords : maxRecords, autoFix, autoFix});
      resultados.verificacoes.push(resultado);

      // Atualizar resumo
      resultados.resumo.total += resultado.total;
      resultados.resumo.conforme += resultado.conforme;
      resultados.resumo.naoConforme += resultado.naoConforme;
      resultados.resumo.alertas += resultado.alertas;
      resultados.resumo.criticos += resultado.criticos;
    });

    // Calcular score geral
    resultados.resumo.score = calcularScoreGeral(resultados.resumo);

    // Registrar auditoria completa
    registrarAuditoria({
      tipo : 'AUDITORIA_COMPLETA',
      resultado : resultados.resumo.score >= 80 ? 'Conforme' : 'NaoConforme',
      score : resultados.resumo.score,
      detalhes : JSON.stringify(resultados.resumo),
      observacoes : tipos.length + ' verificações executadas'
    });


  } catch (error) {
    Logger.log('Erro executarAuditoriaCompleta : ' + error.message);
    throw error;
      // chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
      return {
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
      };
    };
  }


/**
 * Executa uma verificação específica
 */
function executarVerificacao(tipo, options) {
  switch (tipo) {
    case TIPOS_VERIFICACAO.MATEMATICA :
      return verificarCalculosMatematicos(options);
    case TIPOS_VERIFICACAO.PDGP :
      return verificarConformidadePDGP(options);
    case TIPOS_VERIFICACAO.NFE_SEFAZ :
      return verificarNFesSEFAZ(options);
    case TIPOS_VERIFICACAO.PRAZO_ATESTO :
      return verificarPrazosAtesto(options);
    case TIPOS_VERIFICACAO.INTEGRIDADE_DADOS :
      return verificarIntegridadeDados(options);
    case TIPOS_VERIFICACAO.DUPLICIDADE :
      return verificarDuplicidades(options);
    case TIPOS_VERIFICACAO.FORNECEDOR :
      return verificarFornecedores(options);
    case TIPOS_VERIFICACAO.VALORES :
      return verificarValores(options);
    case TIPOS_VERIFICACAO.DOCUMENTACAO :
      return verificarDocumentacao(options);
    case TIPOS_VERIFICACAO.CONFORMIDADE_GERAL :
      return verificarConformidadeGeral(options);
    default :
      throw new Error('Tipo de verificação desconhecido : ' + tipo);
  }
}

/**
 * ==
 * VERIFICAÇÕES ESPECÍFICAS
 * ==
 */

/**
 * 1. Verificação Matemática (soma de valores)
 */
function verificarCalculosMatematicos(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var resultado = {
    tipo : TIPOS_VERIFICACAO.MATEMATICA,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0,
    detalhes : []
  };

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var valorTotal = safeNumber(row[8]);
    var fornecedor = row[6];

    if (isNaN(valorTotal) || valorTotal <= 0) {
      resultado.naoConforme++;
      resultado.criticos++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.MATEMATICA,
         : ,
 : fornecedor,
        resultado : 'Critico',
        score : 0,
        detalhes : 'Valor total inválido : ' + row[8],
        observacoes : 'Linha ' + (index + 2),
        acaoRecomendada : 'Corrigir valor da NF'
      });
    } else {
      resultado.conforme++;
    }

    resultado.total++;
  });

}

/**
 * 2. Verificação de Conformidade com PDGP
 */
function verificarConformidadePDGP(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var pdgpData = readSheetData('PDGP', options);

  var resultado = {
    tipo : TIPOS_VERIFICACAO.PDGP,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  // Criar mapa de fornecedores planejados
  var fornecedoresPrevistos = {};
  pdgpData.data.forEach(function(row) {
    var fornecedor = row[9]; // Fornecedor_Previsto;
    if (fornecedor) {
      fornecedoresPrevistos[fornecedor] = true;
    }
  });

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var fornecedor = row[6];

    if (fornecedoresPrevistos[fornecedor]) {
      resultado.conforme++;
    } else {
      resultado.alertas++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.PDGP,
         : ,
 : fornecedor,
        resultado : 'Alerta',
        score : 50,
        detalhes : 'Fornecedor não previsto no PDGP',
        observacoes : 'Verificar se há justificativa',
        acaoRecomendada : 'Validar com planejamento'
      });
    }

    resultado.total++;
  });

}

/**
 * 3. Verificação de NF-e na SEFAZ
 */
function verificarNFesSEFAZ(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var resultado = {
    tipo : TIPOS_VERIFICACAO.NFE_SEFAZ,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var chaveAcesso = String(row[2] || '').trim();
    var fornecedor = row[6];

    if (!chaveAcesso || chaveAcesso.length != 44) {
      resultado.naoConforme++;
      resultado.criticos++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.NFE_SEFAZ,
         : ,
 : fornecedor,
        resultado : 'Critico',
        score : 0,
        detalhes : 'Chave de acesso inválida ou ausente',
        observacoes : 'Chave : ' + chaveAcesso,
        acaoRecomendada : 'Solicitar chave válida ao fornecedor'
      });
    } else {
      // Validar formato da chave
      if (/^\d{ 44: 44 }$/.test(chaveAcesso)) {
        resultado.conforme++;
      } else {
        resultado.naoConforme++;

        registrarAuditoria({
          tipo : TIPOS_VERIFICACAO.NFE_SEFAZ,
           : ,
 : fornecedor,
          resultado : 'NaoConforme',
          score : 30,
          detalhes : 'Formato de chave inválido',
          observacoes : 'Deve conter apenas números',
          acaoRecomendada : 'Corrigir formato da chave'
        });
      }
    }

    resultado.total++;
  });

}

/**
 * 4. Verificação de Prazos de Atesto
 */
function verificarPrazosAtesto(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var resultado = {
    tipo : TIPOS_VERIFICACAO.PRAZO_ATESTO,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  var hoje = new Date();
  var PRAZO_DIAS = 5;

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var dataRecebimento = row[4];
    var status = row[9];
    var fornecedor = row[6];

    if (!dataRecebimento) {
      resultado.alertas++;
      return;
    }

    var diasDesde = Math.floor((hoje - new Date(dataRecebimento)) / (1000 * 60 * 60 * 24));

    if (status != 'Atestada' && diasDesde > PRAZO_DIAS) {
      resultado.naoConforme++;

      var gravidade;
      if (diasDesde > 10) {
        gravidade = 'Critico';
      } else {
        gravidade = 'Alerta';
      }
      if (diasDesde > 10) resultado.criticos++;
      else resultado.alertas++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.PRAZO_ATESTO,
         : ,
 : fornecedor,
        resultado : gravidade,
        score : Math.max(0, 100 - (diasDesde * 5)),
        detalhes : 'Atesto atrasado : ' + diasDesde + ' dias',
        observacoes : 'Prazo : ' + PRAZO_DIAS + ' dias',
        acaoRecomendada : 'Atestar NF urgentemente'
      });
    } else {
      resultado.conforme++;
    }

    resultado.total++;
  });

}

/**
 * 5. Verificação de Integridade de Dados
 */
function verificarIntegridadeDados(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var resultado = {
    tipo : TIPOS_VERIFICACAO.INTEGRIDADE_DADOS,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  var camposObrigatorios = [1, 2, 3, 5, 6, 8]; // Indices dos campos obrigatórios;

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var fornecedor = row[6];
    var camposFaltando = [];

    camposObrigatorios.forEach(function(colIndex) {
      if (!row[colIndex] || String(row[colIndex]).trim() == '') {
        camposFaltando.push(nfData.headers[colIndex]);
      }
    });

    if (camposFaltando.length > 0) {
      resultado.naoConforme++;
      resultado.criticos++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.INTEGRIDADE_DADOS,
         : ,
 : fornecedor,
        resultado : 'Critico',
        score : 0,
        detalhes : 'Campos obrigatórios faltando : ' + camposFaltando.join(', '),
        observacoes : 'Linha ' + (index + 2),
        acaoRecomendada : 'Preencher campos obrigatórios'
      });
    } else {
      resultado.conforme++;
    }

    resultado.total++;
  });

}

/**
 * 6. Verificação de Duplicidades
 */
function verificarDuplicidades(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var resultado = {
    tipo : TIPOS_VERIFICACAO.DUPLICIDADE,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  var chavesVistas = {};
  var numerosVistos = {};

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var chaveAcesso = row[2];
    var fornecedor = row[6];

    // Verificar duplicidade de chave
    if (chaveAcesso) {
      if (chavesVistas[chaveAcesso]) {
        resultado.naoConforme++;
        resultado.criticos++;

        registrarAuditoria({
          tipo : TIPOS_VERIFICACAO.DUPLICIDADE,
           : ,
 : fornecedor,
          resultado : 'Critico',
          score : 0,
          detalhes : 'Chave de acesso duplicada',
          observacoes : 'Já existe na linha ' + chavesVistas[chaveAcesso],
          acaoRecomendada : 'Remover duplicata'
        });
      } else {
        chavesVistas[chaveAcesso] = index + 2;
      }
    }

    // Verificar duplicidade de número
    if (nfNumero) {
      var chave = fornecedor + '|' + nfNumero;
      if (numerosVistos[chave]) {
        resultado.alertas++;

        registrarAuditoria({
          tipo : TIPOS_VERIFICACAO.DUPLICIDADE,
           : ,
 : fornecedor,
          resultado : 'Alerta',
          score : 50,
          detalhes : 'Número de NF duplicado para mesmo fornecedor',
          observacoes : 'Já existe na linha ' + numerosVistos[chave],
          acaoRecomendada : 'Verificar se são NFs diferentes'
        });
      } else {
        numerosVistos[chave] = index + 2;
        resultado.conforme++;
      }
    }

    resultado.total++;
  });

}

/**
 * 7. Verificação de Fornecedores
 */
function verificarFornecedores(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var fornData = readSheetData('Ref_Fornecedores', options);

  var resultado = {
    tipo : TIPOS_VERIFICACAO.FORNECEDOR,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  // Criar mapa de fornecedores cadastrados
  var fornecedoresCadastrados = {};
  fornData.data.forEach(function(row) {
    var cnpj = String(row[1] || '').replace(/\D/g, '');
    if (cnpj) {
      fornecedoresCadastrados[cnpj] = {
        nome : row[2],
        status : row[10]
      };
    }
  });

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var cnpj = String(row[5] || '').replace(/\D/g, '');
    var fornecedor = row[6];

    if (!cnpj) {
      resultado.naoConforme++;
      resultado.criticos++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.FORNECEDOR,
         : ,
 : fornecedor,
        resultado : 'Critico',
        score : 0,
        detalhes : 'CNPJ do fornecedor ausente',
        observacoes : 'Linha ' + (index + 2),
        acaoRecomendada : 'Preencher CNPJ do fornecedor'
      });
    } else if (!fornecedoresCadastrados[cnpj]) {
      resultado.alertas++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.FORNECEDOR,
         : ,
 : fornecedor,
        resultado : 'Alerta',
        score : 60,
        detalhes : 'Fornecedor não cadastrado',
        observacoes : 'CNPJ : ' + cnpj,
        acaoRecomendada : 'Cadastrar fornecedor em Ref_Fornecedores'
      });
    } else if (fornecedoresCadastrados[cnpj].status != 'Ativo') {
      resultado.alertas++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.FORNECEDOR,
         : ,
 : fornecedor,
        resultado : 'Alerta',
        score : 70,
        detalhes : 'Fornecedor com status : ' + fornecedoresCadastrados[cnpj].status,
        observacoes : 'Verificar situação cadastral',
        acaoRecomendada : 'Validar status do fornecedor'
      });
    } else {
      resultado.conforme++;
    }

    resultado.total++;
  });

}

/**
 * 8. Verificação de Valores
 */
function verificarValores(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var glosasData = readSheetData('Glosas', options);

  var resultado = {
    tipo : TIPOS_VERIFICACAO.VALORES,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  // Criar mapa de glosas por NF
  var glosasPorNF = {};
  glosasData.data.forEach(function(row) {
    var nfNumero = row[2];
    var valorGlosa = safeNumber(row[7]);
    if (nfNumero && !isNaN(valorGlosa)) {
      glosasPorNF[nfNumero] = (glosasPorNF[nfNumero] || 0) + valorGlosa;
    }
  });

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var valorTotal = safeNumber(row[8]);
    var fornecedor = row[6];
    var valorGlosado = glosasPorNF[nfNumero] || 0;

    // Verificar se valor é razoável
    if (valorTotal > 1000000) {
      resultado.alertas++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.VALORES,
         : ,
 : fornecedor,
        resultado : 'Alerta',
        score : 80,
        detalhes : 'Valor muito alto, R$ ' + valorTotal.toFixed(2),
        observacoes : 'Verificar se valor está correto',
        acaoRecomendada : 'Validar valor com fornecedor'
      });
    }

    // Verificar se glosa excede valor total
    if (valorGlosado > valorTotal) {
      resultado.naoConforme++;
      resultado.criticos++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.VALORES,
         : ,
 : fornecedor,
        resultado : 'Critico',
        score : 0,
        detalhes : 'Glosa excede valor total da NF',
        observacoes : 'Glosa, R$ ' + valorGlosado.toFixed(2) + ' | Total : R$ ' + valorTotal.toFixed(2),
        acaoRecomendada : 'Revisar valores de glosa'
      });
    } else {
      resultado.conforme++;
    }

    resultado.total++;
  });

}

/**
 * 9. Verificação de Documentação
 */
function verificarDocumentacao(options) {
  var nfData = readSheetData('Notas_Fiscais', options);
  var resultado = {
    tipo : TIPOS_VERIFICACAO.DOCUMENTACAO,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  nfData.data.forEach(function(row, index) {
    var nfNumero = row[1];
    var fornecedor = row[6];
    var arquivoPDF = row[13];
    var notaEmpenho = row[7];

    var problemas = [];

    if (!arquivoPDF || String(arquivoPDF).trim() == '') {
      problemas.push('PDF da NF ausente');
    }

    if (!notaEmpenho || String(notaEmpenho).trim() == '') {
      problemas.push('Nota de Empenho ausente');
    }

    if (problemas.length > 0) {
      resultado.naoConforme++;
      resultado.alertas++;

      registrarAuditoria({
        tipo : TIPOS_VERIFICACAO.DOCUMENTACAO,
         : ,
 : fornecedor,
        resultado : 'Alerta',
        score : 50,
        detalhes : problemas.join('; '),
        observacoes : 'Documentação incompleta',
        acaoRecomendada : 'Solicitar documentos faltantes'
      });
    } else {
      resultado.conforme++;
    }

    resultado.total++;
  });

}

/**
 * 10. Verificação de Conformidade Geral
 */
function verificarConformidadeGeral(options) {
  var resultado = {
    tipo : TIPOS_VERIFICACAO.CONFORMIDADE_GERAL,
    total : 0,
    conforme : 0,
    naoConforme : 0,
    alertas : 0,
    criticos : 0
  };

  // Executar verificações básicas
  var verificacoes = [
    verificarCalculosMatematicos(options),
    verificarPrazosAtesto(options),
    verificarIntegridadeDados(options)
  ];

  verificacoes.forEach(function(v) {
    resultado.total += v.total;
    resultado.conforme += v.conforme;
    resultado.naoConforme += v.naoConforme;
    resultado.alertas += v.alertas;
    resultado.criticos += v.criticos;
  });

  var score = calcularScoreGeral(resultado);

  registrarAuditoria({
    tipo : TIPOS_VERIFICACAO.CONFORMIDADE_GERAL,
    resultado : score >= 80 ? 'Conforme' : 'NaoConforme',
    score : score,
    detalhes : 'Score geral : ' + score + '/100',
    observacoes : resultado.total + ' registros verificados',
    acaoRecomendada : score < 80 ? 'Corrigir não conformidades' : 'Manter padrão'
  });

}

/**
 * ==
 * FUNÇÕES DE REGISTRO
 * ==
 */

/**
 * Registra resultado de auditoria na aba Auditoria_Log
 */
function registrarAuditoria(dados) {
  try {
    var rowData = [
      'AUD_' + new Date().getTime(),
      new Date(),
      dados.tipo || '',
      dados.nfNumero || '',
      dados.fornecedor || '',
      dados.resultado || '',
      dados.score || 0,
      dados.detalhes || '',
      dados.observacoes || '',
      Session.getActiveUser().getEmail(),
      dados.acaoRecomendada || '',
      dados.statusResolucao || 'Pendente'
    ];

    writeSheetRow('Auditoria_Log', rowData, {validate : false});

  } catch (error) {
    Logger.log('Erro registrarAuditoria : ' + error.message);
    return {
      chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
    };
  }
}

/**
 * Calcula score geral baseado nos resultados
 */
function calcularScoreGeral(resumo) {
  if (resumo.total == 0) return 100;

  var peso = {
    conforme : 100,
    alerta : 50,
    naoConforme : 0,
    critico : -50
  };

  var pontos = (resumo.conforme * peso.conforme) +;
                (resumo.alertas * peso.alerta) +
                (resumo.naoConforme * peso.naoConforme) +
                (resumo.criticos * peso.critico);

  var maxPontos = resumo.total * peso.conforme;
  var score = Math.max(0, Math.min(100, (pontos / maxPontos) * 100));

}

