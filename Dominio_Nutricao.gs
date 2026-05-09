'use strict';

/**
 * DOMINIO_NUTRICAO
 * Consolidado de : SupervisaoNutricao.gs, CardapiosEspeciaisNT.gs, ControlePereciveisNT.gs
 * @version 2.0.0
 * @created 2025-11-04
 */


// ---- SupervisaoNutricao.gs ----
/**
 * SupervisaoNutricao.gs - Supervisão Técnica de Nutrição
 * Implementação do Manual da Alimentação Escolar do DF (Item 19)
 *
 * BASE LEGAL :
 * - Manual da Alimentação Escolar DF Item 19 : Supervisão técnica
 * - Resolução CFN 600/2018 : Responsabilidade técnica do nutricionista
 * - Resolução FNDE 06/2020 : Nutricionista RT do PNAE
 * - Lei 11.947/2009 : Atribuições do nutricionista
 *
 * ESCOPO :
 * - Visitas técnicas às unidades escolares
 * - Supervisão de cardápios
 * - Orientação de manipuladores
 * - Avaliação de estrutura física
 * - Controle de qualidade
 * - Relatórios técnicos
 */

/**
 * TIPOS DE VISITA TÉCNICA (Manual Item 19)
 */
var TIPOS_VISITA = {
  ROTINA : {
    codigo : 'ROTINA',
    nome : 'Visita de Rotina',
    frequencia : 'Mensal',
    base_legal : 'Manual Item 19'
  },
      // EMERGENCIAL : {
    codigo : 'EMERGENCIAL',
    nome : 'Visita Emergencial',
    motivo : 'Ocorrência grave',
    base_legal : 'Manual Item 19'
  },
      // SUPERVISAO_CARDAPIO : {
    codigo : 'SUP_CARDAPIO',
    nome : 'Supervisão de Cardápio',
    foco : 'Execução de cardápios',
    base_legal : 'Resolução FNDE 06/2020'
  },
      // ORIENTACAO_MANIPULADORES : {
    codigo : 'ORIENT_MANIP',
    nome : 'Orientação de Manipuladores',
    foco : 'Boas práticas',
    base_legal : 'RDC ANVISA 216/2004'
  },
      // AVALIACAO_ESTRUTURA : {
    codigo : 'AVAL_ESTRUT',
    nome : 'Avaliação de Estrutura',
    foco : 'Infraestrutura',
    base_legal : 'Manual Item 15'
  }
};

/**
 * ÁREAS DE AVALIAÇÃO NA VISITA (Manual Item 19)
 */
var AREAS_AVALIACAO = {
  ESTRUTURA_FISICA : 'Estrutura Física',
  EQUIPAMENTOS : 'Equipamentos e Utensílios',
  HIGIENE_MANIPULADORES : 'Higiene dos Manipuladores',
  HIGIENE_AMBIENTE : 'Higiene do Ambiente',
  ARMAZENAMENTO : 'Armazenamento de Alimentos',
  PREPARO_ALIMENTOS : 'Preparo de Alimentos',
  DISTRIBUICAO : 'Distribuição de Refeições',
  CONTROLE_TEMPERATURA : 'Controle de Temperatura',
  DOCUMENTACAO : 'Documentação',
  CARDAPIO : 'Execução de Cardápio'
};

/**
 * STATUS DE VISITA
 */
var STATUS_VISITA = {
  AGENDADA : 'Agendada',
  REALIZADA : 'Realizada',
  CANCELADA : 'Cancelada',
  PENDENTE_RELATORIO : 'Pendente de Relatório',
  CONCLUIDA : 'Concluída'
};

/**
 * CLASSIFICAÇÃO DE NÃO CONFORMIDADE
 */
var CLASSIFICACAO_NC = {
  LEVE : {
    codigo : 'LEVE',
    descricao : 'Não compromete a segurança alimentar',
    prazo_correcao : 30 // dias
  },
      // MODERADA : {
    codigo : 'MODERADA',
    descricao : 'Pode comprometer a segurança alimentar',
    prazo_correcao : 15 // dias
  },
      // GRAVE : {
    codigo : 'GRAVE',
    descricao : 'Compromete imediatamente a segurança alimentar',
    prazo_correcao : 7 // dias
  },
      // CRITICA : {
    codigo : 'CRITICA',
    descricao : 'Risco iminente à saúde',
    prazo_correcao : 1 // dia
  }
};

/**
 * Service : Supervisão Técnica de Nutrição
 */
function SupervisaoNutricaoService(dependencies) {
  BaseService.call(this, dependencies);
  this.sheetVisitas = 'Visitas_Tecnicas';
  this.sheetNaoConformidades = 'Nao_Conformidades_Visita';
  this.sheetOrientacoes = 'Orientacoes_Tecnicas';
}

SupervisaoNutricaoService.prototype = Object.create(BaseService.prototype);
SupervisaoNutricaoService.prototype.constructor = SupervisaoNutricaoService;

/**
 * Agenda visita técnica (Manual Item 19)
 */
SupervisaoNutricaoService.prototype.agendarVisita = function(dados) {
  validateRequired(dados.unidadeEscolar, 'Unidade Escolar');
  validateRequired(dados.dataVisita, 'Data da Visita');
  validateRequired(dados.tipoVisita, 'Tipo de Visita');
  validateRequired(dados.nutricionistaResponsavel, 'Nutricionista Responsável');

  var sheet = getOrCreateSheetSafe(this.sheetVisitas);

  var visita = {
    id : this.generateId(),
    dataAgendamento : new Date(),
    unidadeEscolar : dados.unidadeEscolar,
    cre : dados.cre || '',
    dataVisita : dados.dataVisita,
    horaVisita : dados.horaVisita || '',
    tipoVisita : dados.tipoVisita,
    nutricionistaResponsavel : dados.nutricionistaResponsavel,
    crnNutricionista : dados.crnNutricionista || '',
    objetivoVisita : dados.objetivoVisita || '',
    areasAvaliar : dados.areasAvaliar || [],
    status : STATUS_VISITA.AGENDADA,
    observacoes : dados.observacoes || '',
    baseLegal : 'Manual Alimentação Escolar DF Item 19'
  };

  this.salvarVisita(visita);

  SystemLogger.info('Visita técnica agendada', {
    id : visita.id,
    unidade : dados.unidadeEscolar,
    data : dados.dataVisita,
    tipo : dados.tipoVisita
  });

};

/**
 * Registra realização da visita técnica (Manual Item 19)
 */
SupervisaoNutricaoService.prototype.registrarRealizacaoVisita = function(idVisita, dados) {
  validateRequired(dados.dataRealizacao, 'Data de Realização');
  validateRequired(dados.horaInicio, 'Hora de Início');
  validateRequired(dados.horaFim, 'Hora de Fim');

  var visita = this.buscarVisitaPorId(idVisita);
  if (!visita) {
    throw new Error('Visita não encontrada : ' + idVisita);
  }

  visita.dataRealizacao = dados.dataRealizacao;
  visita.horaInicio = dados.horaInicio;
  visita.horaFim = dados.horaFim;
  visita.pessoasPresentes = dados.pessoasPresentes || [];
  visita.areasAvaliadas = dados.areasAvaliadas || [];
  visita.status = STATUS_VISITA.PENDENTE_RELATORIO;
  visita.observacoesRealizacao = dados.observacoes || '';

  this.atualizarVisita(visita);

  SystemLogger.info('Visita técnica realizada', {
    id : idVisita,
    data : dados.dataRealizacao
  });

};

/**
 * Registra não conformidade identificada na visita
 */
SupervisaoNutricaoService.prototype.registrarNaoConformidade = function(dados) {
  validateRequired(dados.visitaId, 'ID da Visita');
  validateRequired(dados.area, 'Área');
  validateRequired(dados.descricao, 'Descrição');
  validateRequired(dados.classificacao, 'Classificação');

  var sheet = getOrCreateSheetSafe(this.sheetNaoConformidades);

  var prazoCorrecao = this.calcularPrazoCorrecao(dados.classificacao);

  var naoConformidade = {
    id : this.generateId(),
    dataRegistro : new Date(),
    visitaId : dados.visitaId,
    unidadeEscolar : dados.unidadeEscolar || '',
    area : dados.area,
    descricao : dados.descricao,
    classificacao : dados.classificacao,
    prazoCorrecao : prazoCorrecao,
    dataLimiteCorrecao : this.calcularDataLimite(prazoCorrecao),
    acaoCorretiva : dados.acaoCorretiva || '',
    responsavelCorrecao : dados.responsavelCorrecao || '',
    corrigida : false,
    dataCorrecao : null,
    evidenciaCorrecao : '',
    observacoes : dados.observacoes || '',
    baseLegal : dados.baseLegal || 'RDC ANVISA 216/2004'
  };

  this.salvarNaoConformidade(naoConformidade);

  SystemLogger.info('Não conformidade registrada', {
    id : naoConformidade.id,
    visitaId : dados.visitaId,
    classificacao : dados.classificacao
  });

};

/**
 * Calcula prazo de correção baseado na classificação
 */
SupervisaoNutricaoService.prototype.calcularPrazoCorrecao = function(classificacao) {
  switch(classificacao) {
    case CLASSIFICACAO_NC.CRITICA.codigo :
      return CLASSIFICACAO_NC.CRITICA.prazo_correcao;
    case CLASSIFICACAO_NC.GRAVE.codigo :
      return CLASSIFICACAO_NC.GRAVE.prazo_correcao;
    case CLASSIFICACAO_NC.MODERADA.codigo :
      return CLASSIFICACAO_NC.MODERADA.prazo_correcao;
    case CLASSIFICACAO_NC.LEVE.codigo :
      return CLASSIFICACAO_NC.LEVE.prazo_correcao;
    default :
      return 30;
  }
};

/**
 * Calcula data limite para correção
 */
SupervisaoNutricaoService.prototype.calcularDataLimite = function(diasPrazo) {
  var dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + diasPrazo);
};

/**
 * Registra orientação técnica fornecida
 */
SupervisaoNutricaoService.prototype.registrarOrientacao = function(dados) {
  validateRequired(dados.visitaId, 'ID da Visita');
  validateRequired(dados.tema, 'Tema');
  validateRequired(dados.descricao, 'Descrição');

  var sheet = getOrCreateSheetSafe(this.sheetOrientacoes);

  var orientacao = {
    id : this.generateId(),
    dataRegistro : new Date(),
    visitaId : dados.visitaId,
    unidadeEscolar : dados.unidadeEscolar || '',
    tema : dados.tema,
    descricao : dados.descricao,
    publicoAlvo : dados.publicoAlvo || '',
    materiaisEntregues : dados.materiaisEntregues || [],
    participantes : dados.participantes || 0,
    observacoes : dados.observacoes || ''
  };

  this.salvarOrientacao(orientacao);

};

/**
 * Finaliza visita com relatório técnico
 */
SupervisaoNutricaoService.prototype.finalizarVisita = function(idVisita, dados) {
  validateRequired(dados.relatorioTecnico, 'Relatório Técnico');

  var visita = this.buscarVisitaPorId(idVisita);
  if (!visita) {
    throw new Error('Visita não encontrada : ' + idVisita);
  }

  // Buscar não conformidades da visita
  var naoConformidades = this.listarNaoConformidadesPorVisita(idVisita);

  visita.dataFinalizacao = new Date();
  visita.relatorioTecnico = dados.relatorioTecnico;
  visita.totalNaoConformidades = naoConformidades.length;
  visita.naoConformidadesCriticas = naoConformidades.filter(function(nc) {
    return nc.classificacao == CLASSIFICACAO_NC.CRITICA.codigo;
  }).length;
  visita.naoConformidadesGraves = naoConformidades.filter(function(nc) {
    return nc.classificacao == CLASSIFICACAO_NC.GRAVE.codigo;
  }).length;
  visita.conclusao = dados.conclusao || '';
  visita.recomendacoes = dados.recomendacoes || '';
  visita.linkRelatorioSEI = dados.linkRelatorioSEI || '';
  visita.status = STATUS_VISITA.CONCLUIDA;

  this.atualizarVisita(visita);

  SystemLogger.info('Visita técnica finalizada', {
    id : idVisita,
    naoConformidades : visita.totalNaoConformidades
  });

};

/**
 * Verifica não conformidades vencidas
 */
SupervisaoNutricaoService.prototype.verificarNaoConformidadesVencidas = function(unidadeEscolar) {
  var todasNC = this.listarTodasNaoConformidades();
  var hoje = new Date();

  var vencidas = todasNC.filter(function(nc) {
    if (unidadeEscolar && nc.unidadeEscolar != unidadeEscolar) return false;
    if (nc.corrigida) return false;

    var dataLimite = new Date(nc.dataLimiteCorrecao);
    return dataLimite < hoje;
  });

    var diasVencidos = Math.floor((hoje - new Date(nc.dataLimiteCorrecao)) / (1000 * 60 * 60 * 24));
      id : nc.id,
      visitaId : nc.visitaId,
      unidade : nc.unidadeEscolar,
      area : nc.area,
      classificacao : nc.classificacao,
      diasVencidos : diasVencidos,
      descricao : nc.descricao
    };


/**
 * Gera relatório de supervisão consolidado
 */
SupervisaoNutricaoService.prototype.gerarRelatorioSupervisao = function(filtros) {
  var visitas = this.listarTodasVisitas();
  var naoConformidades = this.listarTodasNaoConformidades();

  if (filtros) {
    if (filtros.cre) {
      visitas = visitas.filter(function(v) { return v.cre == filtros.cre; });
    }
    if (filtros.periodo) {
      var dataInicio = new Date(filtros.periodo.inicio);
      var dataFim = new Date(filtros.periodo.fim);
      visitas = visitas.filter(function(v) {
        var data = new Date(v.dataVisita);
        return data >= dataInicio && data <= dataFim;
      });
    }
    if (filtros.nutricionista) {
      visitas = visitas.filter(function(v) {
        return v.nutricionistaResponsavel == filtros.nutricionista;
      });
    }
  }

  var relatorio = {
    totalVisitas : visitas.length,
    visitasRealizadas : 0,
    visitasCanceladas : 0,
    porTipoVisita : {},
    totalNaoConformidades : 0,
    porClassificacao : {},
    naoConformidadesCorrigidas : 0,
    naoConformidadesPendentes : 0,
    porUnidadeEscolar : {}
  };

  visitas.forEach(function(v) {
    if (v.status == STATUS_VISITA.CONCLUIDA || v.status == STATUS_VISITA.REALIZADA) {
      relatorio.visitasRealizadas++;
    } else if (v.status == STATUS_VISITA.CANCELADA) {
      relatorio.visitasCanceladas++;
    }

    relatorio.porTipoVisita[v.tipoVisita] = (relatorio.porTipoVisita[v.tipoVisita] || 0) + 1;

    if (!relatorio.porUnidadeEscolar[v.unidadeEscolar]) {
      relatorio.porUnidadeEscolar[v.unidadeEscolar] = {
        visitas : 0,
        naoConformidades : 0
      };
    }
    relatorio.porUnidadeEscolar[v.unidadeEscolar].visitas++;
  });

  naoConformidades.forEach(function(nc) {
    relatorio.totalNaoConformidades++;
    relatorio.porClassificacao[nc.classificacao] = (relatorio.porClassificacao[nc.classificacao] || 0) + 1;

    if (nc.corrigida) {
      relatorio.naoConformidadesCorrigidas++;
    } else {
      relatorio.naoConformidadesPendentes++;
    }

    if (nc.unidadeEscolar && relatorio.porUnidadeEscolar[nc.unidadeEscolar]) {
      relatorio.porUnidadeEscolar[nc.unidadeEscolar].naoConformidades++;
    }
  });

};

/**
 * Métodos auxiliares - Visitas
 */
SupervisaoNutricaoService.prototype.salvarVisita = function(visita) {
  var sheet = getOrCreateSheetSafe(this.sheetVisitas);
  var headers = this.getHeadersVisitas();

  if (sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
  }

  var row = this.mapVisitaToRow(visita, headers);
  sheet.appendRow(row);
};

SupervisaoNutricaoService.prototype.atualizarVisita = function(visita) {
  var sheet = getOrCreateSheetSafe(this.sheetVisitas);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == visita.id) {
      var headers = data[0];
      var row = this.mapVisitaToRow(visita, headers);
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
    }
  }
};

SupervisaoNutricaoService.prototype.buscarVisitaPorId = function(id) {
  var visitas = this.listarTodasVisitas();
};

SupervisaoNutricaoService.prototype.listarTodasVisitas = function() {
  var sheet = getOrCreateSheetSafe(this.sheetVisitas);
  if (sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var visitas = [];

  for (var i = 1; i < data.length; i++) {
    visitas.push(this.mapRowToVisita(data[i], headers));
  }

};

SupervisaoNutricaoService.prototype.getHeadersVisitas = function() {
          'Tipo Visita', 'Nutricionista', 'CRN', 'Objetivo', 'Status', 'Data Realização',
          'Hora Início', 'Hora Fim', 'Total NC', 'NC Críticas', 'NC Graves',
          'Data Finalização', 'Link Relatório SEI', 'Observações', 'Base Legal'};

SupervisaoNutricaoService.prototype.mapVisitaToRow = function(v, headers) {
    v.id, v.dataAgendamento, v.unidadeEscolar, v.cre || '', v.dataVisita, v.horaVisita || '',
    v.tipoVisita, v.nutricionistaResponsavel, v.crnNutricionista || '', v.objetivoVisita || '',
    v.status, v.dataRealizacao || '', v.horaInicio || '', v.horaFim || '',
    v.totalNaoConformidades || 0, v.naoConformidadesCriticas || 0, v.naoConformidadesGraves || 0,
    v.dataFinalizacao || '', v.linkRelatorioSEI || '', v.observacoes || '', v.baseLegal || ''
  };

SupervisaoNutricaoService.prototype.mapRowToVisita = function(row, headers) {
    id : row[0], dataAgendamento, row[1], unidadeEscolar : row[2], cre : row[3], dataVisita : row[4],
    horaVisita : row[5], tipoVisita, row[6], nutricionistaResponsavel : row[7], crnNutricionista : row[8],
    objetivoVisita : row[9], status, row[10], dataRealizacao : row[11], horaInicio : row[12],
    horaFim : row[13], totalNaoConformidades, row[14], naoConformidadesCriticas : row[15],
    naoConformidadesGraves : row[16], dataFinalizacao, row[17], linkRelatorioSEI : row[18],
    observacoes : row[19], baseLegal, row[20]
  };

/**
 * Métodos auxiliares - Não Conformidades
 */
SupervisaoNutricaoService.prototype.salvarNaoConformidade = function(nc) {
  var sheet = getOrCreateSheetSafe(this.sheetNaoConformidades);
  var headers = this.getHeadersNaoConformidades();

  if (sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
  }

  var row = this.mapNaoConformidadeToRow(nc, headers);
  sheet.appendRow(row);
};

SupervisaoNutricaoService.prototype.listarTodasNaoConformidades = function() {
  var sheet = getOrCreateSheetSafe(this.sheetNaoConformidades);
  if (sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var ncs = [];

  for (var i = 1; i < data.length; i++) {
    ncs.push(this.mapRowToNaoConformidade(data[i], headers));
  }

};

SupervisaoNutricaoService.prototype.listarNaoConformidadesPorVisita = function(visitaId) {
  var todasNC = this.listarTodasNaoConformidades();
};

SupervisaoNutricaoService.prototype.getHeadersNaoConformidades = function() {
          'Classificação', 'Prazo Correção (dias)', 'Data Limite', 'Ação Corretiva',
          'Responsável Correção', 'Corrigida', 'Data Correção', 'Evidência', 'Observações', 'Base Legal'};

SupervisaoNutricaoService.prototype.mapNaoConformidadeToRow = function(nc, headers) {
    nc.id, nc.dataRegistro, nc.visitaId, nc.unidadeEscolar || '', nc.area, nc.descricao,
    nc.classificacao, nc.prazoCorrecao, nc.dataLimiteCorrecao, nc.acaoCorretiva || '',
    nc.responsavelCorrecao || '', nc.corrigida, nc.dataCorrecao || '', nc.evidenciaCorrecao || '',
    nc.observacoes || '', nc.baseLegal || ''
  };

SupervisaoNutricaoService.prototype.mapRowToNaoConformidade = function(row, headers) {
    id : row[0], dataRegistro, row[1], visitaId : row[2], unidadeEscolar : row[3], area : row[4],
    descricao : row[5], classificacao, row[6], prazoCorrecao : row[7], dataLimiteCorrecao : row[8],
    acaoCorretiva : row[9], responsavelCorrecao, row[10], corrigida : row[11], dataCorrecao : row[12],
    evidenciaCorrecao : row[13], observacoes, row[14], baseLegal : row[15]
  };

/**
 * Métodos auxiliares - Orientações
 */
SupervisaoNutricaoService.prototype.salvarOrientacao = function(orientacao) {
  var sheet = getOrCreateSheetSafe(this.sheetOrientacoes);
  var headers = this.getHeadersOrientacoes();

  if (sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
  }

  var row = this.mapOrientacaoToRow(orientacao, headers);
  sheet.appendRow(row);
};

SupervisaoNutricaoService.prototype.getHeadersOrientacoes = function() {
          'Público Alvo', 'Participantes', 'Observações'};

SupervisaoNutricaoService.prototype.mapOrientacaoToRow = function(o, headers) {
    o.id, o.dataRegistro, o.visitaId, o.unidadeEscolar || '', o.tema, o.descricao,
    o.publicoAlvo || '', o.participantes, o.observacoes || ''
  };

SupervisaoNutricaoService.prototype.generateId = function() {
};

/**
 * Registrar serviço no DI Container
 */
function registerSupervisaoNutricao() {
  DIContainer.bind('supervisaoNutricao', function() {
    return new SupervisaoNutricaoService({});
  }, true);

  SystemLogger.info('SupervisaoNutricao service registered');
}


// ---- CardapiosEspeciaisNT.gs ----
/**
 * CardapiosEspeciaisNT.gs - Cardápios para Alunos com Necessidades Especiais
 * Implementação da Nota Técnica N.º 2/2025 - SEE/SUAPE/DIAE/GPAE
 *
 * BASE LEGAL :
 * - Nota Técnica 2/2025 : Cardápios para alunos com necessidades especiais
 * - Lei 12.982/2014 : Alimentação especial
 * - Resolução FNDE 06/2020 : Cardápios adaptados
 * - Lei 13.709/2018 : LGPD - Proteção de dados pessoais
 *
 * ESCOPO :
 * - Levantamento de alunos com necessidades especiais
 * - Elaboração de cardápios adaptados
 * - Controle de aquisição de gêneros especiais via PDAF
 * - Alterações de consistência (moído, amassado, purê)
 * - Proteção de dados sensíveis (LGPD)
 */

/**
 * PATOLOGIAS PRINCIPAIS (NT 2/2025 Item 2.5.1)
 */
var PATOLOGIAS_PRINCIPAIS = {
  APLV: {
    codigo: 'APLV',
    nome: 'Alergia à Proteína do Leite de Vaca',
    elaboradoPor: 'GPAE',
    restricoes: ['Leite', 'Derivados lácteos', 'Traços de leite'],
    icone: '??',
    corTema: '#f59e0b'
  },
  DIABETES: {
    codigo: 'DIABETES',
    nome: 'Diabetes Mellitus',
    elaboradoPor: 'GPAE',
    restricoes: ['Açúcar', 'Carboidratos simples', 'Doces'],
    icone: '??',
    corTema: '#ef4444'
  },
  INTOLERANCIA_LACTOSE: {
    codigo: 'INT_LACTOSE',
    nome: 'Intolerância à Lactose',
    elaboradoPor: 'GPAE',
    restricoes: ['Lactose', 'Leite não processado'],
    icone: '??',
    corTema: '#3b82f6'
  },
  DOENCA_CELIACA: {
    codigo: 'DOENCA_CELIACA',
    nome: 'Doença Celíaca',
    elaboradoPor: 'GPAE',
    restricoes: ['Glúten', 'Trigo', 'Centeio', 'Cevada', 'Aveia contaminada'],
    icone: '??',
    corTema: '#f97316'
  },
  ALERGIA_GLUTEN: {
    codigo: 'ALERG_GLUTEN',
    nome: 'Alergia ou Intolerância ao Glúten',
    elaboradoPor: 'GPAE',
    restricoes: ['Trigo', 'Centeio', 'Cevada', 'Aveia contaminada'],
    icone: '??',
    corTema: '#f97316'
  }
};

/**
 * DIETAS ESPECIAIS POR ESCOLHA/CONVICÇÃO
 * Inclui vegetarianos, veganos e outras opções alimentares
 */
var DIETAS_ESPECIAIS = {
  VEGANO: {
    codigo: 'VEGANO',
    nome: 'Dieta Vegana',
    elaboradoPor: 'GPAE',
    restricoes: ['Carne', 'Frango', 'Peixe', 'Ovos', 'Leite', 'Derivados animais', 'Mel', 'Gelatina'],
    icone: '??',
    corTema: '#22c55e',
    descricao: 'Exclui todos os produtos de origem animal'
  },
  VEGETARIANO: {
    codigo: 'VEGETARIANO',
    nome: 'Dieta Vegetariana',
    elaboradoPor: 'GPAE',
    restricoes: ['Carne', 'Frango', 'Peixe', 'Frutos do mar'],
    icone: '??',
    corTema: '#16a34a',
    descricao: 'Exclui carnes, permite ovos e laticínios'
  },
  OVOLACTOVEGETARIANO: {
    codigo: 'OVOLACTO',
    nome: 'Dieta Ovolactovegetariana',
    elaboradoPor: 'GPAE',
    restricoes: ['Carne', 'Frango', 'Peixe'],
    icone: '??',
    corTema: '#84cc16',
    descricao: 'Exclui carnes, permite ovos e laticínios'
  },
  PESCETARIANO: {
    codigo: 'PESCETARIANO',
    nome: 'Dieta Pescetariana',
    elaboradoPor: 'UE',
    restricoes: ['Carne', 'Frango'],
    icone: '??',
    corTema: '#06b6d4',
    descricao: 'Exclui carnes vermelhas e aves, permite peixes'
  }
};

/**
 * OUTRAS PATOLOGIAS (NT 2/2025 Item 2.6)
 */
var OUTRAS_PATOLOGIAS = {
  ALERGIA_OVO: 'Alergia ao Ovo',
  ALERGIA_SOJA: 'Alergia à Soja',
  ALERGIA_AMENDOIM: 'Alergia ao Amendoim',
  ALERGIA_FRUTOS_MAR: 'Alergia a Frutos do Mar',
  ALERGIA_CASTANHAS: 'Alergia a Castanhas/Nozes',
  FENILCETONURIA: 'Fenilcetonúria',
  DISFAGIA: 'Disfagia',
  HIPERTENSAO: 'Hipertensão (dieta hipossódica)',
  OBESIDADE: 'Obesidade (dieta hipocalórica)',
  OUTROS: 'Outras necessidades'
};

/**
 * Retorna todas as dietas/patologias disponíveis para dropdown
 * @returns {Array} Lista de opções para select
 */
function obterTodasDietasDisponiveis() {
  var opcoes = [];
  
  // Patologias principais
  for (var key in PATOLOGIAS_PRINCIPAIS) {
    var p = PATOLOGIAS_PRINCIPAIS[key];
    opcoes.push({
      codigo: p.codigo,
      nome: p.nome,
      tipo: 'PATOLOGIA',
      icone: p.icone || '??',
      cor: p.corTema || '#6b7280'
    });
  }
  
  // Dietas especiais
  for (var key in DIETAS_ESPECIAIS) {
    var d = DIETAS_ESPECIAIS[key];
    opcoes.push({
      codigo: d.codigo,
      nome: d.nome,
      tipo: 'DIETA',
      icone: d.icone || '???',
      cor: d.corTema || '#6b7280',
      descricao: d.descricao
    });
  }
  
  // Outras patologias
  for (var key in OUTRAS_PATOLOGIAS) {
    opcoes.push({
      codigo: key,
      nome: OUTRAS_PATOLOGIAS[key],
      tipo: 'OUTRA',
      icone: '??',
      cor: '#6b7280'
    });
  }
  
  return opcoes;
}

/**
 * CONSISTÊNCIAS (NT 2/2025 Item 4)
 */
var CONSISTENCIAS_ALIMENTO = {
  NORMAL : 'Normal',
  PICADO : 'Picado',
  MOIDO : 'Moído',
  AMASSADO : 'Amassado',
  PURE : 'Purê',
  LIQUIDO : 'Líquido'
};

/**
 * PROGRAMAS DE TRABALHO (NT 2/2025 Item 1.4)
 */
var PROGRAMAS_TRABALHO = {
  CRECHE_0_2 : 'Creche (0-2 anos)',
  CRECHE_2_3 : 'Creche (2-3 anos)',
  PRE_ESCOLA : 'Pré-escola',
  ENSINO_FUNDAMENTAL : 'Ensino Fundamental',
  ENSINO_MEDIO : 'Ensino Médio',
  EJA : 'EJA',
  ENSINO_ESPECIAL_01 : 'Ensino Especial 01 (até 10 anos)',
  ENSINO_ESPECIAL_02 : 'Ensino Especial 02 (11+ anos)'
};

/**
 * MODALIDADES DE ATENDIMENTO (NT 2/2025 Item 1.4)
 */
var MODALIDADES_ATENDIMENTO = {
  PARCIAL_1_REFEICAO : '1 refeição',
  PARCIAL_2_REFEICOES : '2 refeições',
  INTEGRAL_3_REFEICOES : '3 refeições',
  INTEGRAL_4_REFEICOES : '4 refeições',
  INTEGRAL_5_REFEICOES : '5 refeições'
};

/**
 * STATUS DE CARDÁPIO ESPECIAL
 */
var STATUS_CARDAPIO_ESPECIAL = {
  AGUARDANDO_LAUDO : 'Aguardando Laudo Médico',
  LAUDO_RECEBIDO : 'Laudo Recebido',
  CARDAPIO_ELABORADO : 'Cardápio Elaborado',
  AGUARDANDO_AQUISICAO : 'Aguardando Aquisição PDAF',
  EM_EXECUCAO : 'Em Execução',
  SUSPENSO : 'Suspenso',
  FINALIZADO : 'Finalizado'
};

/**
 * Service : Cardápios Especiais NT 2/2025
 */
function CardapiosEspeciaisNTService(dependencies) {
  BaseService.call(this, dependencies);
  this.sheetName = 'Cardapios_Especiais_NT';
  this.sheetLaudos = 'Laudos_Medicos_Protegidos';
}

CardapiosEspeciaisNTService.prototype = Object.create(BaseService.prototype);
CardapiosEspeciaisNTService.prototype.constructor = CardapiosEspeciaisNTService;

/**
 * Registra aluno com necessidade especial (NT 2/2025 Item 2.3)
 * ATENÇÃO : Dados sensíveis protegidos pela LGPD
 */
CardapiosEspeciaisNTService.prototype.registrarAlunoNecessidadeEspecial = function(dados) {
  // Validações obrigatórias
  validateRequired(dados.nomeCompleto, 'Nome Completo do Aluno');
  validateRequired(dados.unidadeEscolar, 'Unidade Escolar');
  validateRequired(dados.serie, 'Série/Turma');
  validateRequired(dados.turno, 'Turno');
  validateRequired(dados.patologia, 'Patologia');
  validateRequired(dados.programaTrabalho, 'Programa de Trabalho');
  validateRequired(dados.modalidadeAtendimento, 'Modalidade de Atendimento');

  // Validação de laudo médico (NT 2/2025 Item 2.3)
  if (dados.possuiLaudo) {
    validateRequired(dados.dataLaudo, 'Data do Laudo');
    validateRequired(dados.linkLaudoSEI, 'Link do Laudo no SEI');

    // Validar prazo do laudo (máximo 1 ano - NT 2/2025 Item 2.3.1)
    var dataLaudo = new Date(dados.dataLaudo);
    var umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

    if (dataLaudo < umAnoAtras) {
      throw new Error('Laudo médico desatualizado. Prazo máximo : 1 ano (NT 2/2025 Item 2.3.1)');
    }
  }

  var sheet = getOrCreateSheetSafe(this.sheetName);
  var registro = {
    id : this.generateId(),
    dataRegistro : new Date(),
    nomeCompleto : dados.nomeCompleto,
    unidadeEscolar : dados.unidadeEscolar,
    cre : dados.cre || '',
    serie : dados.serie,
    turma : dados.turma || '',
    turno : dados.turno,
    patologia : dados.patologia,
    patologiaSecundaria : dados.patologiaSecundaria || '',
    programaTrabalho : dados.programaTrabalho,
    modalidadeAtendimento : dados.modalidadeAtendimento,
    possuiLaudo : dados.possuiLaudo || false,
    dataLaudo : dados.dataLaudo || null,
    linkLaudoSEI : dados.linkLaudoSEI || '',
    cid10 : dados.cid10 || '',
    consistenciaEspecial : dados.consistenciaEspecial || CONSISTENCIAS_ALIMENTO.NORMAL,
    restricoesAdicionais : dados.restricoesAdicionais || '',
    elaboradoPor : this.determinarElaborador(dados.patologia),
    status : dados.possuiLaudo ? STATUS_CARDAPIO_ESPECIAL.LAUDO_RECEBIDO , STATUS_CARDAPIO_ESPECIAL.AGUARDANDO_LAUDO,
    nutricionistaResponsavel : dados.nutricionistaResponsavel || '',
    responsavelRegistro : Session.getActiveUser().getEmail(),
    observacoes : dados.observacoes || '',
    baseLegal : 'NT 2/2025 Item 2.3',
    lgpdConsentimento : true,
    dataAtualizacao : new Date()
  };

  this.salvarRegistro(registro);

  // Log sem dados sensíveis (LGPD)
  SystemLogger.info('Aluno com necessidade especial registrado', {
    id : registro.id,
    unidade : dados.unidadeEscolar,
    patologia : dados.patologia,
    possuiLaudo : dados.possuiLaudo
  });

};

/**
 * Determina quem elabora o cardápio (NT 2/2025 Item 2.5 e 2.6)
 */
CardapiosEspeciaisNTService.prototype.determinarElaborador = function(patologia) {
  var patologiasPrincipais = Object.keys(PATOLOGIAS_PRINCIPAIS).map(function(k) {});

  if (patologiasPrincipais.indexOf(patologia) != -1) {}

};

/**
 * Registra cardápio elaborado (NT 2/2025 Item 2.5 e 2.6)
 */
CardapiosEspeciaisNTService.prototype.registrarCardapioElaborado = function(idAluno, dadosCardapio) {
  validateRequired(dadosCardapio.distribuicao, 'Distribuição');
  validateRequired(dadosCardapio.linkCardapioSEI, 'Link do Cardápio no SEI');

  var registro = this.buscarPorId(idAluno);
  if (!registro) {
    throw new Error('Aluno não encontrado : ' + idAluno);
  }

  registro.distribuicaoAtual = dadosCardapio.distribuicao;
  registro.linkCardapioSEI = dadosCardapio.linkCardapioSEI;
  registro.dataElaboracao = new Date();
  registro.nutricionistaElaborador = dadosCardapio.nutricionistaElaborador || '';
  registro.status = STATUS_CARDAPIO_ESPECIAL.CARDAPIO_ELABORADO;
  registro.observacoesCardapio = dadosCardapio.observacoes || '';
  registro.dataAtualizacao = new Date();

  this.atualizarRegistro(registro);

  SystemLogger.info('Cardápio especial elaborado', {
    id : idAluno,
    distribuicao : dadosCardapio.distribuicao,
    elaborador : registro.elaboradoPor
  });

};

/**
 * Registra aquisição de gêneros especiais via PDAF (NT 2/2025 Item 3)
 */
CardapiosEspeciaisNTService.prototype.registrarAquisicaoPDAF = function(idAluno, dadosAquisicao) {
  validateRequired(dadosAquisicao.generosAdquiridos, 'Gêneros Adquiridos');
  validateRequired(dadosAquisicao.valorTotal, 'Valor Total');

  var registro = this.buscarPorId(idAluno);
  if (!registro) {
    throw new Error('Aluno não encontrado : ' + idAluno);
  }

  registro.generosAdquiridos = dadosAquisicao.generosAdquiridos;
  registro.valorTotalPDAF = dadosAquisicao.valorTotal;
  registro.dataAquisicao = new Date();
  registro.notasFiscaisPDAF = dadosAquisicao.notasFiscais || '';
  registro.ataConselhoEscolar = dadosAquisicao.ataConselho || '';
  registro.status = STATUS_CARDAPIO_ESPECIAL.EM_EXECUCAO;
  registro.observacoesAquisicao = dadosAquisicao.observacoes || '';
  registro.baseLegalAquisicao = 'NT 2/2025 Item 3';
  registro.dataAtualizacao = new Date();

  this.atualizarRegistro(registro);

  SystemLogger.info('Aquisição PDAF registrada', {
    id : idAluno,
    valor : dadosAquisicao.valorTotal
  });

};

/**
 * Atualiza status do aluno
 */
CardapiosEspeciaisNTService.prototype.atualizarStatus = function(idAluno, novoStatus, observacao) {
  var registro = this.buscarPorId(idAluno);
  if (!registro) {
    throw new Error('Aluno não encontrado : ' + idAluno);
  }

  registro.statusAnterior = registro.status;
  registro.status = novoStatus;
  registro.dataAtualizacaoStatus = new Date();
  registro.observacaoStatus = observacao || '';
  registro.dataAtualizacao = new Date();

  this.atualizarRegistro(registro);

};

/**
 * Lista alunos por unidade escolar (NT 2/2025 Item 1.6.1)
 */
CardapiosEspeciaisNTService.prototype.listarPorUnidadeEscolar = function(unidadeEscolar) {
  var todosRegistros = this.listarTodos();

           reg.status != STATUS_CARDAPIO_ESPECIAL.FINALIZADO;
  };

/**
 * Lista alunos por patologia
 */
CardapiosEspeciaisNTService.prototype.listarPorPatologia = function(patologia) {
  var todosRegistros = this.listarTodos();

  };

/**
 * Verifica laudos vencidos (NT 2/2025 Item 2.3.1)
 */
CardapiosEspeciaisNTService.prototype.verificarLaudosVencidos = function() {
  var registros = this.listarTodos();
  var vencidos = [];
  var umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

  registros.forEach(function(reg) {
    if (reg.possuiLaudo && reg.dataLaudo) {
      var dataLaudo = new Date(reg.dataLaudo);
      if (dataLaudo < umAnoAtras) {
        vencidos.push({
          id : reg.id,
          unidade : reg.unidadeEscolar,
          aluno : reg.nomeCompleto,
          dataLaudo : reg.dataLaudo,
          diasVencidos : Math.floor((new Date() - dataLaudo) / (1000 * 60 * 60 * 24)) - 365
        });
      }
    }
  });

};

/**
 * Gera relatório consolidado por CRE (NT 2/2025 Item 2.4.3)
 */
CardapiosEspeciaisNTService.prototype.gerarRelatorioConsolidadoCRE = function(cre) {
  var registros = this.listarTodos();
  var registrosCRE = registros.filter(function(reg) {});

  var consolidado = {
    cre : cre,
    totalAlunos : registrosCRE.length,
    porPatologia : {},
    porStatus : {},
    porModalidade : {},
    comLaudo : 0,
    semLaudo : 0,
    laudosVencidos : 0
  };

  var umAnoAtras = new Date();
  umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

  registrosCRE.forEach(function(reg) {
    // Por patologia
    consolidado.porPatologia[reg.patologia] = (consolidado.porPatologia[reg.patologia] || 0) + 1;

    // Por status
    consolidado.porStatus[reg.status] = (consolidado.porStatus[reg.status] || 0) + 1;

    // Por modalidade
    consolidado.porModalidade[reg.modalidadeAtendimento] = (consolidado.porModalidade[reg.modalidadeAtendimento] || 0) + 1;

    // Laudos
    if (reg.possuiLaudo) {
      consolidado.comLaudo++;
      if (reg.dataLaudo && new Date(reg.dataLaudo) < umAnoAtras) {
        consolidado.laudosVencidos++;
      }
    } else {
      consolidado.semLaudo++;
    }
  });

};

/**
 * Métodos auxiliares
 */
CardapiosEspeciaisNTService.prototype.salvarRegistro = function(registro) {
  var sheet = getOrCreateSheetSafe(this.sheetName);
  var headers = this.getHeaders();

  if (sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
    // Proteger planilha (dados sensíveis - LGPD)
    var protection = sheet.protect().setDescription('Dados protegidos pela LGPD');
    protection.setWarningOnly(true);
  }

  var row = this.mapRegistroToRow(registro, headers);
  sheet.appendRow(row);
};

CardapiosEspeciaisNTService.prototype.atualizarRegistro = function(registro) {
  var sheet = getOrCreateSheetSafe(this.sheetName);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == registro.id) {
      var headers = data[0];
      var row = this.mapRegistroToRow(registro, headers);
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
    }
  }

};

CardapiosEspeciaisNTService.prototype.buscarPorId = function(id) {
  var registros = this.listarTodos();
};

CardapiosEspeciaisNTService.prototype.listarTodos = function() {
  var sheet = getOrCreateSheetSafe(this.sheetName);
  if (sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var registros = [];

  for (var i = 1; i < data.length; i++) {
    registros.push(this.mapRowToRegistro(data[i], headers));
  }

};

CardapiosEspeciaisNTService.prototype.getHeaders = function() {
          'Turno', 'Patologia', 'Patologia Secundária', 'Programa Trabalho', 'Modalidade',
          'Possui Laudo', 'Data Laudo', 'Link Laudo SEI', 'CID-10', 'Consistência',
          'Restrições Adicionais', 'Elaborado Por', 'Status', 'Nutricionista Responsável',
          'Distribuição Atual', 'Link Cardápio SEI', 'Gêneros Adquiridos', 'Valor PDAF',
          'Observações', 'Base Legal', 'Data Atualização'};

CardapiosEspeciaisNTService.prototype.mapRegistroToRow = function(reg, headers) {
    reg.id, reg.dataRegistro, reg.nomeCompleto, reg.unidadeEscolar, reg.cre || '',
    reg.serie, reg.turma || '', reg.turno, reg.patologia, reg.patologiaSecundaria || '',
    reg.programaTrabalho, reg.modalidadeAtendimento, reg.possuiLaudo, reg.dataLaudo || '',
    reg.linkLaudoSEI || '', reg.cid10 || '', reg.consistenciaEspecial || '',
    reg.restricoesAdicionais || '', reg.elaboradoPor, reg.status, reg.nutricionistaResponsavel || '',
    reg.distribuicaoAtual || '', reg.linkCardapioSEI || '', reg.generosAdquiridos || '',
    reg.valorTotalPDAF || '', reg.observacoes || '', reg.baseLegal || '', reg.dataAtualizacao
  };

CardapiosEspeciaisNTService.prototype.mapRowToRegistro = function(row, headers) {
    id : row[0],
    dataRegistro : row[1],
    nomeCompleto : row[2],
    unidadeEscolar : row[3],
    cre : row[4],
    serie : row[5],
    turma : row[6],
    turno : row[7],
    patologia : row[8],
    patologiaSecundaria : row[9],
    programaTrabalho : row[10],
    modalidadeAtendimento : row[11],
    possuiLaudo : row[12],
    dataLaudo : row[13],
    linkLaudoSEI : row[14],
    cid10 : row[15],
    consistenciaEspecial : row[16],
    restricoesAdicionais : row[17],
    elaboradoPor : row[18],
    status : row[19],
    nutricionistaResponsavel : row[20],
    distribuicaoAtual : row[21],
    linkCardapioSEI : row[22],
    generosAdquiridos : row[23],
    valorTotalPDAF : row[24],
    observacoes : row[25],
    baseLegal : row[26],
    dataAtualizacao : row[27]
  };

CardapiosEspeciaisNTService.prototype.generateId = function() {
};

/**
 * Registrar serviço no DI Container
 */
function registerCardapiosEspeciaisNT() {
  DIContainer.bind('cardapiosEspeciaisNT', function() {
    return new CardapiosEspeciaisNTService({});
  }, true);

  SystemLogger.info('CardapiosEspeciaisNT service registered');
}


// ---- ControlePereciveisNT.gs ----
/**
 * ControlePereciveisNT.gs - Controle de Alimentos Perecíveis
 * Implementação da Nota Técnica N.º 1/2025 - SEE/SUAPE/DIAE/GPAE
 *
 * BASE LEGAL :
 * - Nota Técnica 1/2025 : Procedimentos para notificação e monitoramento de alimentos perecíveis
 * - Lei 11.947/2009 : PNAE
 * - Resolução FNDE 06/2020 : Atestação por Comissão de Recebimento
 *
 * ESCOPO :
 * - Alimentos vencidos na unidade escolar
 * - Alimentos perecíveis impróprios
 * - Alterações na qualidade do alimento
 * - Descarte de alimentos perecíveis
 * - Reposição por unidade escolar ou fornecedor
 */

/**
 * TIPOS DE ALIMENTOS PERECÍVEIS (NT 1/2025 Item 1.1)
 */
var TIPOS_PERECIVEIS = {
  PAES : 'Pães',
  HORTIFRUTIS : 'Hortifrutis',
  CARNES_IN_NATURA : 'Carnes in natura',
  OVO : 'Ovo',
  QUEIJOS : 'Queijos',
  IOGURTE : 'Iogurte',
  OUTROS : 'Outros perecíveis'
};

/**
 * ORIGENS DE IMPROPRIEDADE (NT 1/2025 Item 5.2)
 */
var ORIGEM_IMPROPRIEDADE = {
  RECEBIMENTO_INADEQUADO : {
    codigo : 'REC_INAD',
    descricao : 'Recebimento inadequado/vício oculto',
    exemplos : ['Temperatura inadequada', 'Descongelamento', 'Deterioração visível', 'Pragas urbanas']
  },
      // FALHA_ESTOQUE : {
    codigo : 'FALHA_EST',
    descricao : 'Falha no estoque, armazenagem e/ou conservação',
    exemplos : ['Temperatura incorreta', 'Falha em freezer/geladeira', 'Descongelamento sem controle', 'Más condições estruturais']
  }
};

/**
 * STATUS DE NOTIFICAÇÃO (NT 1/2025)
 */
var STATUS_NOTIFICACAO_PERECIVEL = {
  AGUARDANDO_VISITA : 'Aguardando Visita Técnica',
  AGUARDANDO_REPOSICAO_ESCOLA : 'Aguardando Reposição Escola',
  AGUARDANDO_REPOSICAO_FORNECEDOR : 'Aguardando Reposição Fornecedor',
  DESCARTE_REALIZADO : 'Descarte Realizado',
  REPOSICAO_CONCLUIDA : 'Reposição Concluída',
  ENCAMINHADO_CORRED : 'Encaminhado CORRED',
  FINALIZADO : 'Finalizado'
};

/**
 * PRAZOS LEGAIS (NT 1/2025)
 */
var PRAZOS_NT_01_2025 = {
  REPOSICAO_RECUSA_FORNECEDOR : {
    prazo : 24 // horas,
    base : 'NT 1/2025 Item 9.2'
  },
      // REPOSICAO_IMPROPRIEDADE_FORNECEDOR : {
    prazo : 5 // dias úteis,
    base : 'NT 1/2025 Item 9.4'
  }
};

/**
 * Service : Controle de Perecíveis NT 1/2025
 */
function ControlePereciveisNTService(dependencies) {
  BaseService.call(this, dependencies);
  this.sheetName = 'Controle_Pereciveis_NT';
}

ControlePereciveisNTService.prototype = Object.create(BaseService.prototype);
ControlePereciveisNTService.prototype.constructor = ControlePereciveisNTService;

/**
 * Registra notificação de alimento vencido (NT 1/2025 Item 4)
 */
ControlePereciveisNTService.prototype.registrarAlimentoVencido = function(dados) {
  validateRequired(dados.unidadeEscolar, 'Unidade Escolar');
  validateRequired(dados.tipoAlimento, 'Tipo de Alimento');
  validateRequired(dados.quantidade, 'Quantidade');
  validateRequired(dados.dataVencimento, 'Data de Vencimento');

  var sheet = getOrCreateSheetSafe(this.sheetName);
  var registro = {
    id : this.generateId(),
    tipo : 'VENCIDO',
    dataRegistro : new Date(),
    unidadeEscolar : dados.unidadeEscolar,
    tipoAlimento : dados.tipoAlimento,
    quantidade : dados.quantidade,
    unidade : dados.unidade || 'kg',
    dataVencimento : dados.dataVencimento,
    lote : dados.lote || ''
    fornecedor : dados.fornecedor || '',
    reciboCopia : dados.reciboCopia || false,
    registroFotografico : dados.registroFotografico || false
    formularioPreenchido : dados.formularioPreenchido || false,
    status : STATUS_NOTIFICACAO_PERECIVEL.AGUARDANDO_VISITA,
    responsavelRegistro : Session.getActiveUser().getEmail(),
    observacoes : dados.observacoes || '',
    baseLegal : 'NT 1/2025 Item 4'
  };

  this.salvarRegistro(registro);

  SystemLogger.info('Alimento vencido registrado', {
    id : registro.id,
    unidade : dados.unidadeEscolar,
    tipo : dados.tipoAlimento
  });

};

/**
 * Registra notificação de alimento impróprio (NT 1/2025 Item 5)
 */
ControlePereciveisNTService.prototype.registrarAlimentoImproprio = function(dados) {
  validateRequired(dados.unidadeEscolar, 'Unidade Escolar');
  validateRequired(dados.tipoAlimento, 'Tipo de Alimento');
  validateRequired(dados.origemImpropriedade, 'Origem da Impropriedade');
  validateRequired(dados.descricaoProblema, 'Descrição do Problema');

  var sheet = getOrCreateSheetSafe(this.sheetName);
  var registro = {
    id : this.generateId(),
    tipo : 'IMPROPRIO',
    dataRegistro : new Date(),
    unidadeEscolar : dados.unidadeEscolar,
    tipoAlimento : dados.tipoAlimento,
    quantidade : dados.quantidade || 0,
    unidade : dados.unidade || 'kg',
    origemImpropriedade : dados.origemImpropriedade,
    descricaoProblema : dados.descricaoProblema,
    lote : dados.lote || ''
    fornecedor : dados.fornecedor || '',
    dataVencimento : dados.dataVencimento || null,
    reciboCopia : dados.reciboCopia || false,
    registroFotografico : dados.registroFotografico || false
    formularioPreenchido : dados.formularioPreenchido || false,
    status : STATUS_NOTIFICACAO_PERECIVEL.AGUARDANDO_VISITA,
    responsavelRegistro : Session.getActiveUser().getEmail(),
    observacoes : dados.observacoes || '',
    baseLegal : 'NT 1/2025 Item 5'
  };

  this.salvarRegistro(registro);

  SystemLogger.info('Alimento impróprio registrado', {
    id : registro.id,
    unidade : dados.unidadeEscolar,
    origem : dados.origemImpropriedade
  });

};

/**
 * Registra alteração na qualidade (NT 1/2025 Item 6)
 */
ControlePereciveisNTService.prototype.registrarAlteracaoQualidade = function(dados) {
  validateRequired(dados.unidadeEscolar, 'Unidade Escolar');
  validateRequired(dados.tipoAlimento, 'Tipo de Alimento');
  validateRequired(dados.descricaoAlteracao, 'Descrição da Alteração');

  var registro = {
    id : this.generateId(),
    tipo : 'ALTERACAO_QUALIDADE',
    dataRegistro : new Date(),
    unidadeEscolar : dados.unidadeEscolar,
    tipoAlimento : dados.tipoAlimento,
    quantidade : dados.quantidade || 0,
    descricaoAlteracao : dados.descricaoAlteracao
    fornecedor : dados.fornecedor || '',
    lote : dados.lote || '',
    dataVencimento : dados.dataVencimento || null,
    solicitarAnalise : dados.solicitarAnalise || false,
    status : dados.solicitarAnalise ? 'AGUARDANDO_ANALISE' , STATUS_NOTIFICACAO_PERECIVEL.AGUARDANDO_VISITA,
    responsavelRegistro : Session.getActiveUser().getEmail(),
    observacoes : dados.observacoes || '',
    baseLegal : 'NT 1/2025 Item 6'
  };

  this.salvarRegistro(registro);

};

/**
 * Registra descarte de alimento (NT 1/2025 Item 7)
 */
ControlePereciveisNTService.prototype.registrarDescarte = function(idNotificacao, dadosDescarte) {
  validateRequired(dadosDescarte.tipoDescarte, 'Tipo de Descarte');
  validateRequired(dadosDescarte.nutricionistaResponsavel, 'Nutricionista Responsável');

  var registro = this.buscarPorId(idNotificacao);
  if (!registro) {
    throw new Error('Notificação não encontrada : ' + idNotificacao);
  }

  registro.dataDescarte = new Date();
  registro.tipoDescarte = dadosDescarte.tipoDescarte; // LIQUIDOS, OVOS, CARNEOS
  registro.nutricionistaResponsavel = dadosDescarte.nutricionistaResponsavel;
  registro.diretorPresente = dadosDescarte.diretorPresente || '';
  registro.formularioDescartePreenchido = true;
  registro.status = STATUS_NOTIFICACAO_PERECIVEL.DESCARTE_REALIZADO;
  registro.observacoesDescarte = dadosDescarte.observacoes || '';
  registro.baseLegalDescarte = 'NT 1/2025 Item 7';

  this.atualizarRegistro(registro);

  SystemLogger.info('Descarte registrado', {
    id : idNotificacao,
    tipo : dadosDescarte.tipoDescarte,
    nutricionista : dadosDescarte.nutricionistaResponsavel
  });

};

/**
 * Registra reposição pela escola (NT 1/2025 Item 8)
 */
ControlePereciveisNTService.prototype.registrarReposicaoEscola = function(idNotificacao, dadosReposicao) {
  validateRequired(dadosReposicao.comprovanteFiscal, 'Comprovante Fiscal');
  validateRequired(dadosReposicao.quantidadeReposta, 'Quantidade Reposta');

  var registro = this.buscarPorId(idNotificacao);
  if (!registro) {
    throw new Error('Notificação não encontrada : ' + idNotificacao);
  }

  registro.dataReposicao = new Date();
  registro.tipoReposicao = 'ESCOLA';
  registro.comprovanteFiscal = dadosReposicao.comprovanteFiscal;
  registro.quantidadeReposta = dadosReposicao.quantidadeReposta;
  registro.nutricionistaAtesto = dadosReposicao.nutricionistaAtesto || '';
  registro.equivalenciaNutricional = dadosReposicao.equivalenciaNutricional || true;
  registro.status = STATUS_NOTIFICACAO_PERECIVEL.REPOSICAO_CONCLUIDA;
  registro.observacoesReposicao = dadosReposicao.observacoes || '';
  registro.baseLegalReposicao = 'NT 1/2025 Item 8';

  this.atualizarRegistro(registro);

  SystemLogger.info('Reposição pela escola registrada', {
    id : idNotificacao,
    quantidade : dadosReposicao.quantidadeReposta
  });

};

/**
 * Registra reposição pelo fornecedor (NT 1/2025 Item 9)
 */
ControlePereciveisNTService.prototype.registrarReposicaoFornecedor = function(idNotificacao, dadosReposicao) {
  validateRequired(dadosReposicao.fornecedor, 'Fornecedor');
  validateRequired(dadosReposicao.quantidadeReposta, 'Quantidade Reposta');

  var registro = this.buscarPorId(idNotificacao);
  if (!registro) {
    throw new Error('Notificação não encontrada : ' + idNotificacao);
  }

  registro.dataReposicao = new Date();
  registro.tipoReposicao = 'FORNECEDOR';
  registro.fornecedorReposicao = dadosReposicao.fornecedor;
  registro.quantidadeReposta = dadosReposicao.quantidadeReposta;
  registro.guiaRecolhimento = dadosReposicao.guiaRecolhimento || '';
  registro.status = STATUS_NOTIFICACAO_PERECIVEL.REPOSICAO_CONCLUIDA;
  registro.observacoesReposicao = dadosReposicao.observacoes || '';
  registro.baseLegalReposicao = 'NT 1/2025 Item 9';

  this.atualizarRegistro(registro);

  SystemLogger.info('Reposição pelo fornecedor registrada', {
     : ,
 : dadosReposicao.fornecedor
  });

};

/**
 * Verifica prazos de reposição
 */
ControlePereciveisNTService.prototype.verificarPrazosReposicao = function() {
  var registros = this.listarTodos();
  var vencidos = [];
  var agora = new Date();

  registros.forEach(function(reg) {
    if (reg.status == STATUS_NOTIFICACAO_PERECIVEL.AGUARDANDO_REPOSICAO_FORNECEDOR) {
      var prazoHoras = PRAZOS_NT_01_2025.REPOSICAO_RECUSA_FORNECEDOR.prazo;
      var dataLimite = new Date(reg.dataRegistro.getTime() + (prazoHoras * 60 * 60 * 1000));

      if (agora > dataLimite) {
        vencidos.push({
          id : reg.id,
          unidade : reg.unidadeEscolar,
          tipo : reg.tipoAlimento,
          diasVencidos : Math.floor((agora - dataLimite) / (1000 * 60 * 60 * 24))
        });
      }
    }
  });

};

/**
 * Métodos auxiliares
 */
ControlePereciveisNTService.prototype.salvarRegistro = function(registro) {
  var sheet = getOrCreateSheetSafe(this.sheetName);
  var headers = this.getHeaders();

  if (sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
  }

  var row = this.mapRegistroToRow(registro, headers);
  sheet.appendRow(row);
};

ControlePereciveisNTService.prototype.atualizarRegistro = function(registro) {
  var sheet = getOrCreateSheetSafe(this.sheetName);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == registro.id) {
      var headers = data[0];
      var row = this.mapRegistroToRow(registro, headers);
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
    }
  }

};

ControlePereciveisNTService.prototype.buscarPorId = function(id) {
  var registros = this.listarTodos();
};

ControlePereciveisNTService.prototype.listarTodos = function() {
  var sheet = getOrCreateSheetSafe(this.sheetName);
  if (sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var registros = [];

  for (var i = 1; i < data.length; i++) {
    registros.push(this.mapRowToRegistro(data[i], headers));
  }

};

ControlePereciveisNTService.prototype.getHeaders = function() {
          'Unidade', 'Data Vencimento', 'Lote', 'Fornecedor', 'Status', 'Responsável Registro',
          'Origem Impropriedade', 'Descrição Problema', 'Data Descarte', 'Nutricionista',
          'Data Reposição', 'Tipo Reposição', 'Quantidade Reposta', 'Observações', 'Base Legal'};

ControlePereciveisNTService.prototype.mapRegistroToRow = function(reg, headers) {
    reg.id, reg.tipo, reg.dataRegistro, reg.unidadeEscolar, reg.tipoAlimento,
    reg.quantidade, reg.unidade || '', reg.dataVencimento || '', reg.lote || '',
    reg.fornecedor || '', reg.status, reg.responsavelRegistro,
    reg.origemImpropriedade || '', reg.descricaoProblema || '', reg.dataDescarte || '',
    reg.nutricionistaResponsavel || '', reg.dataReposicao || '', reg.tipoReposicao || '',
    reg.quantidadeReposta || '', reg.observacoes || '', reg.baseLegal || ''
  };

ControlePereciveisNTService.prototype.mapRowToRegistro = function(row, headers) {
    id : row[0],
    tipo : row[1],
    dataRegistro : row[2],
    unidadeEscolar : row[3],
    tipoAlimento : row[4],
    quantidade : row[5],
    unidade : row[6],
    dataVencimento : row[7],
    lote : row[8]
    fornecedor : row[9],
    status : row[10],
    responsavelRegistro : row[11],
    origemImpropriedade : row[12],
    descricaoProblema : row[13],
    dataDescarte : row[14],
    nutricionistaResponsavel : row[15],
    dataReposicao : row[16],
    tipoReposicao : row[17],
    quantidadeReposta : row[18],
    observacoes : row[19],
    baseLegal : row[20]
  };

ControlePereciveisNTService.prototype.generateId = function() {
};

/**
 * Registrar serviço no DI Container
 */
function registerControlePereciveisNT() {
  DIContainer.bind('controlePereciveisNT', function() {
    return new ControlePereciveisNTService({});
  }, true);

  SystemLogger.info('ControlePereciveisNT service registered');
}

