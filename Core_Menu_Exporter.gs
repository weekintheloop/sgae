/**
 * @fileoverview Exportador de Cardápios em PDF - Alimentação Escolar CRE-PP
 * @version 1.0.0
 * 
 * Intervenção 20/38: MenuExporter conforme Prompt 20
 * 
 * Funcionalidades:
 * - Gera cardápio mensal em PDF formatado
 * - Layout otimizado para impressão A4
 * - Suporte a murais escolares
 * - Exportação para Drive
 * 
 * @author UNIAE CRE Team
 * @created 2025-12-25
 */

'use strict';

// ============================================================================
// MENU EXPORTER - Exportador de Cardápios
// ============================================================================

var MenuExporter = (function() {
  
  // =========================================================================
  // CONFIGURAÇÃO
  // =========================================================================
  
  var CONFIG = {
    // Pasta padrão para PDFs
    FOLDER_NAME: 'Cardapios_PDF',
    
    // Dimensões A4 em pontos (72 dpi)
    PAGE_WIDTH: 595,
    PAGE_HEIGHT: 842,
    
    // Margens
    MARGIN_TOP: 50,
    MARGIN_BOTTOM: 50,
    MARGIN_LEFT: 40,
    MARGIN_RIGHT: 40,
    
    // Cores do tema
    COLORS: {
      PRIMARY: '#2E7D32',      // Verde
      SECONDARY: '#EF6C00',    // Laranja
      TEXT: '#212121',
      TEXT_LIGHT: '#757575',
      BACKGROUND: '#FFFFFF',
      HEADER_BG: '#E8F5E9',
      BORDER: '#C8E6C9'
    },
    
    // Fontes
    FONTS: {
      TITLE: 'Arial',
      BODY: 'Arial',
      SIZE_TITLE: 18,
      SIZE_SUBTITLE: 14,
      SIZE_BODY: 10,
      SIZE_SMALL: 8
    },
    
    // Dias da semana
    DIAS_SEMANA: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
  };
  
  // =========================================================================
  // FUNÇÕES PRIVADAS
  // =========================================================================
  
  /**
   * Obtém ou cria pasta para PDFs
   * @private
   */
  function _getOrCreateFolder() {
    try {
      // Tenta obter ID da pasta do PropertiesManager
      var folderId = null;
      if (typeof PropertiesManager !== 'undefined') {
        folderId = PropertiesManager.get('CARDAPIOS_PDF_FOLDER_ID');
      }
      
      if (folderId) {
        try {
          return DriveApp.getFolderById(folderId);
        } catch (e) {
          // Pasta não existe mais, criar nova
        }
      }
      
      // Busca ou cria pasta
      var folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
      if (folders.hasNext()) {
        return folders.next();
      }
      
      // Cria nova pasta
      var folder = DriveApp.createFolder(CONFIG.FOLDER_NAME);
      
      // Salva ID
      if (typeof PropertiesManager !== 'undefined') {
        PropertiesManager.set('CARDAPIOS_PDF_FOLDER_ID', folder.getId());
      }
      
      return folder;
      
    } catch (e) {
      console.error('Erro ao obter pasta: ' + e.message);
      return null;
    }
  }
  
  /**
   * Formata data para exibição
   * @private
   */
  function _formatarData(data) {
    if (!data) return '';
    var d = new Date(data);
    var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[d.getMonth()] + ' de ' + d.getFullYear();
  }
  
  /**
   * Formata data curta
   * @private
   */
  function _formatarDataCurta(data) {
    if (!data) return '';
    var d = new Date(data);
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
  }
  
  /**
   * Gera HTML do cardápio para conversão em PDF
   * @private
   */
  function _gerarHTMLCardapio(cardapio, options) {
    options = options || {};
    
    var html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: ${CONFIG.FONTS.BODY}, sans-serif;
      font-size: ${CONFIG.FONTS.SIZE_BODY}pt;
      color: ${CONFIG.COLORS.TEXT};
      background: ${CONFIG.COLORS.BACKGROUND};
      padding: 20px;
    }
    
    .header {
      text-align: center;
      padding: 15px;
      background: ${CONFIG.COLORS.HEADER_BG};
      border-radius: 8px;
      margin-bottom: 20px;
      border: 2px solid ${CONFIG.COLORS.PRIMARY};
    }
    
    .header h1 {
      font-size: ${CONFIG.FONTS.SIZE_TITLE}pt;
      color: ${CONFIG.COLORS.PRIMARY};
      margin-bottom: 5px;
    }
    
    .header h2 {
      font-size: ${CONFIG.FONTS.SIZE_SUBTITLE}pt;
      color: ${CONFIG.COLORS.SECONDARY};
      font-weight: normal;
    }
    
    .header .periodo {
      font-size: ${CONFIG.FONTS.SIZE_BODY}pt;
      color: ${CONFIG.COLORS.TEXT_LIGHT};
      margin-top: 8px;
    }
    
    .escola-info {
      text-align: center;
      font-size: ${CONFIG.FONTS.SIZE_SMALL}pt;
      color: ${CONFIG.COLORS.TEXT_LIGHT};
      margin-bottom: 15px;
    }
    
    .semana {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .semana-header {
      background: ${CONFIG.COLORS.PRIMARY};
      color: white;
      padding: 8px 12px;
      font-weight: bold;
      border-radius: 4px 4px 0 0;
    }
    
    .dias-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }
    
    .dia {
      display: table-cell;
      width: 20%;
      border: 1px solid ${CONFIG.COLORS.BORDER};
      vertical-align: top;
      padding: 8px;
    }
    
    .dia-header {
      background: ${CONFIG.COLORS.HEADER_BG};
      padding: 5px;
      text-align: center;
      font-weight: bold;
      color: ${CONFIG.COLORS.PRIMARY};
      border-bottom: 1px solid ${CONFIG.COLORS.BORDER};
      margin: -8px -8px 8px -8px;
    }
    
    .dia-data {
      font-size: ${CONFIG.FONTS.SIZE_SMALL}pt;
      color: ${CONFIG.COLORS.TEXT_LIGHT};
      font-weight: normal;
    }
    
    .refeicao {
      margin-bottom: 10px;
    }
    
    .refeicao-titulo {
      font-size: ${CONFIG.FONTS.SIZE_SMALL}pt;
      color: ${CONFIG.COLORS.SECONDARY};
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    
    .refeicao-itens {
      font-size: ${CONFIG.FONTS.SIZE_SMALL}pt;
      line-height: 1.4;
    }
    
    .footer {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid ${CONFIG.COLORS.PRIMARY};
      font-size: ${CONFIG.FONTS.SIZE_SMALL}pt;
      color: ${CONFIG.COLORS.TEXT_LIGHT};
    }
    
    .footer-grid {
      display: flex;
      justify-content: space-between;
    }
    
    .legenda {
      background: ${CONFIG.COLORS.HEADER_BG};
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }
    
    .legenda-titulo {
      font-weight: bold;
      color: ${CONFIG.COLORS.PRIMARY};
      margin-bottom: 5px;
    }
    
    .legenda-item {
      display: inline-block;
      margin-right: 15px;
    }
    
    .legenda-icon {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
    }
    
    .icon-vegetariano { background: #4CAF50; }
    .icon-sem-gluten { background: #FF9800; }
    .icon-sem-lactose { background: #2196F3; }
    
    .assinaturas {
      margin-top: 30px;
      display: flex;
      justify-content: space-around;
    }
    
    .assinatura {
      text-align: center;
      width: 200px;
    }
    
    .assinatura-linha {
      border-top: 1px solid ${CONFIG.COLORS.TEXT};
      margin-bottom: 5px;
    }
    
    .assinatura-nome {
      font-weight: bold;
    }
    
    .assinatura-cargo {
      font-size: ${CONFIG.FONTS.SIZE_SMALL}pt;
      color: ${CONFIG.COLORS.TEXT_LIGHT};
    }
    
    @media print {
      body { padding: 0; }
      .semana { page-break-inside: avoid; }
    }
  </style>
</head>
<body>`;

    // Header
    html += `
  <div class="header">
    <h1>🍎 Cardápio Escolar</h1>
    <h2>${options.escola || 'CRE Plano Piloto'}</h2>
    <div class="periodo">${_formatarData(cardapio.mesAno || new Date())}</div>
  </div>`;

    // Info da escola
    if (options.infoAdicional) {
      html += `<div class="escola-info">${options.infoAdicional}</div>`;
    }

    // Semanas do cardápio
    var semanas = cardapio.semanas || [];
    semanas.forEach(function(semana, idx) {
      html += `
  <div class="semana">
    <div class="semana-header">Semana ${idx + 1} - ${semana.periodo || ''}</div>
    <div class="dias-grid">`;
      
      CONFIG.DIAS_SEMANA.forEach(function(dia, diaIdx) {
        var diaData = semana.dias && semana.dias[diaIdx] ? semana.dias[diaIdx] : {};
        
        html += `
      <div class="dia">
        <div class="dia-header">
          ${dia}
          <div class="dia-data">${_formatarDataCurta(diaData.data)}</div>
        </div>`;
        
        // Refeições do dia
        var refeicoes = diaData.refeicoes || {};
        
        if (refeicoes.lancheManha) {
          html += `
        <div class="refeicao">
          <div class="refeicao-titulo">☀️ Lanche Manhã</div>
          <div class="refeicao-itens">${refeicoes.lancheManha}</div>
        </div>`;
        }
        
        if (refeicoes.almoco) {
          html += `
        <div class="refeicao">
          <div class="refeicao-titulo">🍽️ Almoço</div>
          <div class="refeicao-itens">${refeicoes.almoco}</div>
        </div>`;
        }
        
        if (refeicoes.lancheTarde) {
          html += `
        <div class="refeicao">
          <div class="refeicao-titulo">🌙 Lanche Tarde</div>
          <div class="refeicao-itens">${refeicoes.lancheTarde}</div>
        </div>`;
        }
        
        html += `
      </div>`;
      });
      
      html += `
    </div>
  </div>`;
    });

    // Legenda
    html += `
  <div class="legenda">
    <div class="legenda-titulo">Legenda:</div>
    <span class="legenda-item"><span class="legenda-icon icon-vegetariano"></span> Vegetariano</span>
    <span class="legenda-item"><span class="legenda-icon icon-sem-gluten"></span> Sem Glúten</span>
    <span class="legenda-item"><span class="legenda-icon icon-sem-lactose"></span> Sem Lactose</span>
  </div>`;

    // Footer com assinaturas
    html += `
  <div class="footer">
    <div class="footer-grid">
      <div>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
      <div>Sistema de Alimentação Escolar - CRE-PP</div>
    </div>
    
    <div class="assinaturas">
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${options.nutricionista || 'Nutricionista Responsável'}</div>
        <div class="assinatura-cargo">CRN: ${options.crnNutricionista || '______'}</div>
      </div>
      <div class="assinatura">
        <div class="assinatura-linha"></div>
        <div class="assinatura-nome">${options.supervisor || 'Supervisor(a)'}</div>
        <div class="assinatura-cargo">UNIAE CRE-PP</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  
  /**
   * Converte HTML para PDF usando Google Docs
   * @private
   */
  function _htmlToPdf(html, fileName) {
    try {
      // Cria documento temporário
      var blob = Utilities.newBlob(html, 'text/html', 'temp.html');
      
      // Usa Drive para converter
      var tempDoc = Drive.Files.insert(
        { title: fileName, mimeType: 'application/vnd.google-apps.document' },
        blob,
        { convert: true }
      );
      
      // Exporta como PDF
      var pdfBlob = DriveApp.getFileById(tempDoc.id).getAs('application/pdf');
      pdfBlob.setName(fileName + '.pdf');
      
      // Remove documento temporário
      DriveApp.getFileById(tempDoc.id).setTrashed(true);
      
      return pdfBlob;
      
    } catch (e) {
      console.error('Erro ao converter para PDF: ' + e.message);
      return null;
    }
  }
  
  /**
   * Busca cardápio do mês
   * @private
   */
  function _buscarCardapioMes(mesAno) {
    try {
      if (typeof MenuBuilder !== 'undefined') {
        return MenuBuilder.getCardapioMensal(mesAno);
      }
      
      // Fallback: busca direto
      if (typeof DatabaseEngine !== 'undefined') {
        var data = new Date(mesAno);
        var mes = data.getMonth() + 1;
        var ano = data.getFullYear();
        
        return DatabaseEngine.read('Cardapios_Semanais', {
          mes: mes,
          ano: ano,
          status: 'Publicado'
        });
      }
      
      return null;
    } catch (e) {
      console.error('Erro ao buscar cardápio: ' + e.message);
      return null;
    }
  }
  
  /**
   * Organiza cardápio em semanas
   * @private
   */
  function _organizarEmSemanas(dados, mesAno) {
    var semanas = [];
    var data = new Date(mesAno);
    var mes = data.getMonth();
    var ano = data.getFullYear();
    
    // Primeiro dia do mês
    var primeiroDia = new Date(ano, mes, 1);
    // Último dia do mês
    var ultimoDia = new Date(ano, mes + 1, 0);
    
    var semanaAtual = { dias: [], periodo: '' };
    var diaAtual = new Date(primeiroDia);
    
    // Ajusta para começar na segunda-feira
    while (diaAtual.getDay() !== 1 && diaAtual <= ultimoDia) {
      diaAtual.setDate(diaAtual.getDate() + 1);
    }
    
    while (diaAtual <= ultimoDia) {
      var diaSemana = diaAtual.getDay();
      
      // Segunda a Sexta (1-5)
      if (diaSemana >= 1 && diaSemana <= 5) {
        var diaData = new Date(diaAtual);
        var dadosDia = _buscarDadosDia(dados, diaData);
        
        semanaAtual.dias.push({
          data: diaData,
          refeicoes: dadosDia
        });
        
        // Se é sexta, fecha a semana
        if (diaSemana === 5) {
          semanaAtual.periodo = _formatarDataCurta(semanaAtual.dias[0].data) + 
                               ' a ' + _formatarDataCurta(diaData);
          semanas.push(semanaAtual);
          semanaAtual = { dias: [], periodo: '' };
        }
      }
      
      diaAtual.setDate(diaAtual.getDate() + 1);
    }
    
    // Adiciona última semana incompleta
    if (semanaAtual.dias.length > 0) {
      semanaAtual.periodo = _formatarDataCurta(semanaAtual.dias[0].data) + 
                           ' a ' + _formatarDataCurta(semanaAtual.dias[semanaAtual.dias.length - 1].data);
      semanas.push(semanaAtual);
    }
    
    return semanas;
  }
  
  /**
   * Busca dados de um dia específico
   * @private
   */
  function _buscarDadosDia(dados, data) {
    if (!dados || !Array.isArray(dados)) {
      return { lancheManha: '-', almoco: '-', lancheTarde: '-' };
    }
    
    var dataStr = Utilities.formatDate(data, 'America/Sao_Paulo', 'yyyy-MM-dd');
    
    var diaEncontrado = dados.find(function(d) {
      if (!d.data) return false;
      var dData = Utilities.formatDate(new Date(d.data), 'America/Sao_Paulo', 'yyyy-MM-dd');
      return dData === dataStr;
    });
    
    if (diaEncontrado) {
      return {
        lancheManha: diaEncontrado.lanche_manha || diaEncontrado.lancheManha || '-',
        almoco: diaEncontrado.almoco || diaEncontrado.prato_principal || '-',
        lancheTarde: diaEncontrado.lanche_tarde || diaEncontrado.lancheTarde || '-'
      };
    }
    
    return { lancheManha: '-', almoco: '-', lancheTarde: '-' };
  }
  
  // =========================================================================
  // API PÚBLICA
  // =========================================================================
  
  /**
   * Exporta cardápio mensal para PDF
   * @param {Object} options - Opções de exportação
   * @param {string|Date} options.mesAno - Mês/ano do cardápio
   * @param {string} options.escola - Nome da escola
   * @param {string} options.nutricionista - Nome do nutricionista
   * @param {string} options.crnNutricionista - CRN do nutricionista
   * @param {boolean} options.salvarDrive - Salvar no Drive
   * @returns {Object} Resultado da exportação
   */
  function exportarPDF(options) {
    options = options || {};
    
    try {
      var mesAno = options.mesAno || new Date();
      if (typeof mesAno === 'string') {
        mesAno = new Date(mesAno);
      }
      
      // Busca dados do cardápio
      var dadosCardapio = _buscarCardapioMes(mesAno);
      
      // Organiza em semanas
      var semanas = _organizarEmSemanas(dadosCardapio, mesAno);
      
      var cardapio = {
        mesAno: mesAno,
        semanas: semanas
      };
      
      // Gera HTML
      var html = _gerarHTMLCardapio(cardapio, options);
      
      // Nome do arquivo
      var nomeArquivo = 'Cardapio_' + 
                        Utilities.formatDate(mesAno, 'America/Sao_Paulo', 'yyyy_MM') +
                        (options.escola ? '_' + options.escola.replace(/\s+/g, '_') : '');
      
      // Converte para PDF
      var pdfBlob = _htmlToPdf(html, nomeArquivo);
      
      if (!pdfBlob) {
        return { success: false, error: 'Erro ao gerar PDF' };
      }
      
      var resultado = {
        success: true,
        data: {
          nome: nomeArquivo + '.pdf',
          tamanho: pdfBlob.getBytes().length,
          mesAno: mesAno,
          semanas: semanas.length
        }
      };
      
      // Salva no Drive se solicitado
      if (options.salvarDrive !== false) {
        var folder = _getOrCreateFolder();
        if (folder) {
          var arquivo = folder.createFile(pdfBlob);
          resultado.data.arquivoId = arquivo.getId();
          resultado.data.url = arquivo.getUrl();
        }
      }
      
      // Retorna blob para download
      resultado.blob = pdfBlob;
      
      // Auditoria
      if (typeof AuditService !== 'undefined') {
        AuditService.log('CARDAPIO_EXPORTADO', {
          mesAno: mesAno,
          escola: options.escola,
          arquivo: nomeArquivo
        });
      }
      
      return resultado;
      
    } catch (e) {
      console.error('Erro ao exportar PDF: ' + e.message);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Exporta cardápio semanal para PDF
   * @param {Object} options - Opções
   * @param {Date} options.dataInicio - Data de início da semana
   * @param {string} options.escola - Nome da escola
   * @returns {Object} Resultado
   */
  function exportarSemanaPDF(options) {
    options = options || {};
    
    try {
      var dataInicio = options.dataInicio || new Date();
      if (typeof dataInicio === 'string') {
        dataInicio = new Date(dataInicio);
      }
      
      // Ajusta para segunda-feira
      var dia = dataInicio.getDay();
      var diff = dia === 0 ? -6 : 1 - dia;
      dataInicio.setDate(dataInicio.getDate() + diff);
      
      // Busca dados da semana
      var dias = [];
      for (var i = 0; i < 5; i++) {
        var data = new Date(dataInicio);
        data.setDate(data.getDate() + i);
        
        var dadosDia = _buscarDadosDia(null, data);
        dias.push({
          data: data,
          refeicoes: dadosDia
        });
      }
      
      var dataFim = new Date(dataInicio);
      dataFim.setDate(dataFim.getDate() + 4);
      
      var cardapio = {
        mesAno: dataInicio,
        semanas: [{
          dias: dias,
          periodo: _formatarDataCurta(dataInicio) + ' a ' + _formatarDataCurta(dataFim)
        }]
      };
      
      // Gera HTML
      var html = _gerarHTMLCardapio(cardapio, options);
      
      // Nome do arquivo
      var nomeArquivo = 'Cardapio_Semana_' + 
                        Utilities.formatDate(dataInicio, 'America/Sao_Paulo', 'yyyy_MM_dd');
      
      // Converte para PDF
      var pdfBlob = _htmlToPdf(html, nomeArquivo);
      
      if (!pdfBlob) {
        return { success: false, error: 'Erro ao gerar PDF' };
      }
      
      var resultado = {
        success: true,
        data: {
          nome: nomeArquivo + '.pdf',
          periodo: cardapio.semanas[0].periodo
        }
      };
      
      // Salva no Drive
      if (options.salvarDrive !== false) {
        var folder = _getOrCreateFolder();
        if (folder) {
          var arquivo = folder.createFile(pdfBlob);
          resultado.data.arquivoId = arquivo.getId();
          resultado.data.url = arquivo.getUrl();
        }
      }
      
      resultado.blob = pdfBlob;
      
      return resultado;
      
    } catch (e) {
      console.error('Erro ao exportar semana: ' + e.message);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Gera cardápio para impressão (HTML)
   * @param {Object} options - Opções
   * @returns {Object} HTML para impressão
   */
  function gerarHTMLImpressao(options) {
    options = options || {};
    
    try {
      var mesAno = options.mesAno || new Date();
      var dadosCardapio = _buscarCardapioMes(mesAno);
      var semanas = _organizarEmSemanas(dadosCardapio, mesAno);
      
      var cardapio = {
        mesAno: mesAno,
        semanas: semanas
      };
      
      var html = _gerarHTMLCardapio(cardapio, options);
      
      return {
        success: true,
        data: {
          html: html,
          mesAno: mesAno
        }
      };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Lista PDFs gerados
   * @param {Object} options - Opções de filtro
   * @returns {Object} Lista de arquivos
   */
  function listarPDFsGerados(options) {
    options = options || {};
    
    try {
      var folder = _getOrCreateFolder();
      if (!folder) {
        return { success: false, error: 'Pasta não encontrada' };
      }
      
      var arquivos = [];
      var files = folder.getFiles();
      
      while (files.hasNext()) {
        var file = files.next();
        if (file.getMimeType() === 'application/pdf') {
          arquivos.push({
            id: file.getId(),
            nome: file.getName(),
            url: file.getUrl(),
            tamanho: file.getSize(),
            criado: file.getDateCreated(),
            atualizado: file.getLastUpdated()
          });
        }
      }
      
      // Ordena por data de criação (mais recente primeiro)
      arquivos.sort(function(a, b) {
        return new Date(b.criado) - new Date(a.criado);
      });
      
      // Limita resultados
      if (options.limite) {
        arquivos = arquivos.slice(0, options.limite);
      }
      
      return {
        success: true,
        data: {
          arquivos: arquivos,
          total: arquivos.length,
          pastaId: folder.getId(),
          pastaUrl: folder.getUrl()
        }
      };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Envia cardápio por email
   * @param {Object} options - Opções
   * @param {string} options.email - Email destinatário
   * @param {string|Date} options.mesAno - Mês/ano
   * @param {string} options.escola - Nome da escola
   * @returns {Object} Resultado
   */
  function enviarPorEmail(options) {
    if (!options || !options.email) {
      return { success: false, error: 'Email é obrigatório' };
    }
    
    try {
      // Gera PDF
      var resultado = exportarPDF({
        mesAno: options.mesAno,
        escola: options.escola,
        salvarDrive: false
      });
      
      if (!resultado.success) {
        return resultado;
      }
      
      var mesFormatado = _formatarData(options.mesAno || new Date());
      
      // Envia email
      MailApp.sendEmail({
        to: options.email,
        subject: 'Cardápio Escolar - ' + mesFormatado,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2E7D32;">🍎 Cardápio Escolar</h2>
            <p>Segue em anexo o cardápio de <strong>${mesFormatado}</strong>.</p>
            ${options.escola ? '<p>Escola: ' + options.escola + '</p>' : ''}
            <hr style="border: 1px solid #E8F5E9; margin: 20px 0;">
            <p style="color: #757575; font-size: 12px;">
              Sistema de Alimentação Escolar - CRE Plano Piloto<br>
              Este é um email automático, não responda.
            </p>
          </div>
        `,
        attachments: [resultado.blob]
      });
      
      return {
        success: true,
        data: {
          email: options.email,
          mesAno: mesFormatado,
          enviado: new Date().toISOString()
        }
      };
      
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
  
  // =========================================================================
  // API PÚBLICA DO MÓDULO
  // =========================================================================
  
  return {
    // Exportação
    exportarPDF: exportarPDF,
    exportarSemanaPDF: exportarSemanaPDF,
    
    // HTML
    gerarHTMLImpressao: gerarHTMLImpressao,
    
    // Gestão
    listarPDFsGerados: listarPDFsGerados,
    
    // Envio
    enviarPorEmail: enviarPorEmail
  };
  
})();

// ============================================================================
// FUNÇÕES GLOBAIS - API para Frontend
// ============================================================================

/**
 * Exporta cardápio mensal para PDF
 */
function api_cardapio_exportarPDF(options) {
  var resultado = MenuExporter.exportarPDF(options);
  // Remove blob da resposta (não serializável)
  if (resultado.blob) delete resultado.blob;
  return resultado;
}

/**
 * Exporta cardápio semanal para PDF
 */
function api_cardapio_exportarSemanaPDF(options) {
  var resultado = MenuExporter.exportarSemanaPDF(options);
  if (resultado.blob) delete resultado.blob;
  return resultado;
}

/**
 * Gera HTML para impressão
 */
function api_cardapio_gerarHTMLImpressao(options) {
  return MenuExporter.gerarHTMLImpressao(options);
}

/**
 * Lista PDFs gerados
 */
function api_cardapio_listarPDFs(options) {
  return MenuExporter.listarPDFsGerados(options);
}

/**
 * Envia cardápio por email
 */
function api_cardapio_enviarPorEmail(options) {
  return MenuExporter.enviarPorEmail(options);
}

// ============================================================================
// REGISTRO DO MÓDULO
// ============================================================================

(function() {
  var moduleName = 'MenuExporter';
  var moduleVersion = '1.0.0';
  
  try {
    if (typeof ServiceContainer !== 'undefined') {
      ServiceContainer.register(moduleName, MenuExporter);
    }
    
    console.log('[' + moduleName + ' v' + moduleVersion + '] Módulo carregado');
    console.log('[' + moduleName + '] Funções: exportarPDF, exportarSemanaPDF, enviarPorEmail');
    
  } catch (e) {
    console.error('[' + moduleName + '] Erro ao registrar: ' + e.message);
  }
})();
