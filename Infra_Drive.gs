'use strict';

/**
 * INFRA_DRIVE
 * Consolidado de : DriveFileCreator.gs, DriveFileManager.gs
 * @version 2.0.0
 * @created 2025-11-04
 */


// ---- DriveFileCreator.gs ----
/**
 * DriveFileCreator.gs
 * Funções para criar arquivos no Drive ao invés de abas
 * Pasta do Drive : 1w1_45AjB_wB4KMZbP6JevqD382FyBZ53
 * Gerado automaticamente por transform_sheets_to_drive.py
 */


// Transformado : Criar arquivo no Drive ao invés de aba
function criarPrecos_AntieconomicosNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Precos_Antieconomicos_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Precos_Antieconomicos');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Precos_Antieconomicos'
    };

  } catch (error) {
    Logger.log('Erro ao criar Precos_Antieconomicos no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAnalise_GenerativaNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Analise_Generativa_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Analise_Generativa');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Analise_Generativa'
    };

  } catch (error) {
    Logger.log('Erro ao criar Analise_Generativa no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarnomeAbaNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'nomeAba_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('nomeAba');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'nomeAba'
    };

  } catch (error) {
    Logger.log('Erro ao criar nomeAba no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarConfig_ComissaoNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Config_Comissao_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Config_Comissao');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Config_Comissao'
    };

  } catch (error) {
    Logger.log('Erro ao criar Config_Comissao no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarConfig_Textos_PadraoNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Config_Textos_Padrao_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Config_Textos_Padrao');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Config_Textos_Padrao'
    };

  } catch (error) {
    Logger.log('Erro ao criar Config_Textos_Padrao no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAtesto_GEVMONNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Atesto_GEVMON_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Atesto_GEVMON');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Atesto_GEVMON'
    };

  } catch (error) {
    Logger.log('Erro ao criar Atesto_GEVMON no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar relatório no Drive ao invés de aba
function criarRelatorio_ComissaoNoDrive(dados) {
  try {
    var folderId = '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = 'Relatorio_Comissao_' + timestamp;

    // Criar arquivo no Drive
    var file;
    if ('spreadsheet' == 'spreadsheet') {
      var ss = SpreadsheetApp.create(fileName);
      var sheet = ss.getActiveSheet();

      // Escrever dados
      if (dados && dados.length > 0) {
        sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);
      }

      // Mover para pasta correta
      var fileId = ss.getId();
      file = DriveApp.getFileById(fileId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      return {
        success : true,
        fileId : fileId,
        fileName : fileName,
        url : ss.getUrl()
      };
    } else {
      // Criar documento
      var doc = DocumentApp.create(fileName);
      var body = doc.getBody();

      // Escrever dados
      if (dados && dados.length > 0) {
        dados.forEach(function(row) {
          body.appendParagraph(row.join(' | '));
        });
      }

      // Mover para pasta correta
      var fileId = doc.getId();
      file = DriveApp.getFileById(fileId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      return {
        success : true,
        fileId : fileId,
        fileName : fileName,
        url : doc.getUrl()
      };
    }

   catch (error) {
    Logger.log('Erro ao criar Relatorio_Comissao no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarDemonstrativo_ConsumoNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Demonstrativo_Consumo_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Demonstrativo_Consumo');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Demonstrativo_Consumo'
    };

  } catch (error) {
    Logger.log('Erro ao criar Demonstrativo_Consumo no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarExportacao_SEINoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Exportacao_SEI_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Exportacao_SEI');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Exportacao_SEI'
    };

  } catch (error) {
    Logger.log('Erro ao criar Exportacao_SEI no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarEntregasNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Entregas_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Entregas');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Entregas'
    };

  } catch (error) {
    Logger.log('Erro ao criar Entregas no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarRecusasNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Recusas_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Recusas');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Recusas'
    };

  } catch (error) {
    Logger.log('Erro ao criar Recusas no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAnalise_QualidadeNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Analise_Qualidade_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Analise_Qualidade');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Analise_Qualidade'
    };

  } catch (error) {
    Logger.log('Erro ao criar Analise_Qualidade no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAtrasos_EntregasNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Atrasos_Entregas_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Atrasos_Entregas');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Atrasos_Entregas'
    };

  } catch (error) {
    Logger.log('Erro ao criar Atrasos_Entregas no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarSubstituicoesNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Substituicoes_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Substituicoes');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Substituicoes'
    };

  } catch (error) {
    Logger.log('Erro ao criar Substituicoes no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAvaliacao_FornecedoresNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Avaliacao_Fornecedores_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Avaliacao_Fornecedores');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Avaliacao_Fornecedores'
    };

  } catch (error) {
    Logger.log('Erro ao criar Avaliacao_Fornecedores no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarProblemas_FornecedoresNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Problemas_Fornecedores_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Problemas_Fornecedores');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Problemas_Fornecedores'
    };

  } catch (error) {
    Logger.log('Erro ao criar Problemas_Fornecedores no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarGlosasNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Glosas_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Glosas');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Glosas'
    };

  } catch (error) {
    Logger.log('Erro ao criar Glosas no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba
function criarRelatorio_GlosasNoDrive(dados) {
  try {
    var folderId = '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = 'Relatorio_Glosas_' + timestamp;

    // Criar arquivo no Drive
    var file;
    if ('spreadsheet' == 'spreadsheet') {
      var ss = SpreadsheetApp.create(fileName);
      var sheet = ss.getActiveSheet();

      // Escrever dados
      if (dados && dados.length > 0) {
        sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);
      }

      // Mover para pasta correta
      var fileId = ss.getId();
      file = DriveApp.getFileById(fileId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      return {
        success : true,
        fileId : fileId,
        fileName : fileName,
        url : ss.getUrl()
      };
    } else {
      // Criar documento
      var doc = DocumentApp.create(fileName);
      var body = doc.getBody();

      // Escrever dados
      if (dados && dados.length > 0) {
        dados.forEach(function(row) {
          body.appendParagraph(row.join(' | '));
        });
      }

      // Mover para pasta correta
      var fileId = doc.getId();
      file = DriveApp.getFileById(fileId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      return {
        success : true,
        fileId : fileId,
        fileName : fileName,
        url : doc.getUrl()
      };
    }

   catch (error) {
    Logger.log('Erro ao criar Relatorio_Glosas no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarCalculo_GlosasNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Calculo_Glosas_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Calculo_Glosas');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Calculo_Glosas'
    };

  } catch (error) {
    Logger.log('Erro ao criar Calculo_Glosas no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarnameNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'name_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('name');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'name'
    };

  } catch (error) {
    Logger.log('Erro ao criar name no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarHistorico_FornecedoresNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Historico_Fornecedores_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Historico_Fornecedores');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Historico_Fornecedores'
    };

  } catch (error) {
    Logger.log('Erro ao criar Historico_Fornecedores no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarProblemas_por_FornecedorNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Problemas_por_Fornecedor_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Problemas_por_Fornecedor');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Problemas_por_Fornecedor'
    };

  } catch (error) {
    Logger.log('Erro ao criar Problemas_por_Fornecedor no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarNotas_FiscaisNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Notas_Fiscais_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Notas_Fiscais');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Notas_Fiscais'
    };

  } catch (error) {
    Logger.log('Erro ao criar Notas_Fiscais no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarDivergencias_NFNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Divergencias_NF_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Divergencias_NF');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
      success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Divergencias_NF'
    };

  } catch (error) {
    Logger.log('Erro ao criar Divergencias_NF no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba
function criarResumo_RelatoriosNoDrive(dados) {
  try {
    var folderId = '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = 'Resumo_Relatorios_' + timestamp;

    // Criar arquivo no Drive
    var file;
    if ('spreadsheet' == 'spreadsheet') {
      var ss = SpreadsheetApp.create(fileName);
      var sheet = ss.getActiveSheet();

      // Escrever dados
      if (dados && dados.length > 0) {
        sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);
      }

      // Mover para pasta correta
      var fileId = ss.getId();
      file = DriveApp.getFileById(fileId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      return {
        success : true,
        fileId : fileId,
        fileName : fileName,
        url : ss.getUrl()
      };
    } else {
      // Criar documento
      var doc = DocumentApp.create(fileName);
      var body = doc.getBody();

      // Escrever dados
      if (dados && dados.length > 0) {
        dados.forEach(function(row) {
          body.appendParagraph(row.join(' | '));
        });
      }

      // Mover para pasta correta
      var fileId = doc.getId();
      file = DriveApp.getFileById(fileId);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      return {
        success : true,
        fileId : fileId,
        fileName : fileName,
        url : doc.getUrl()
      };
    }

   catch (error) {
    Logger.log('Erro ao criar Resumo_Relatorios no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarsheetNameNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'sheetName_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('sheetName');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'sheetName'
    };

  } catch (error) {
    Logger.log('Erro ao criar sheetName no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAuditoria_LogNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Auditoria_Log_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Auditoria_Log');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Auditoria_Log'
    };

  } catch (error) {
    Logger.log('Erro ao criar Auditoria_Log no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarreportNameNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'reportName_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('reportName');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'reportName'
    };

  } catch (error) {
    Logger.log('Erro ao criar reportName no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarAtestos_MissingNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Atestos_Missing_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Atestos_Missing');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Atestos_Missing'
    };

  } catch (error) {
    Logger.log('Erro ao criar Atestos_Missing no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criaroutNameNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'outName_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('outName');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'outName'
    };

  } catch (error) {
    Logger.log('Erro ao criar outName no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarresumoNameNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'resumoName_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('resumoName');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'resumoName'
    };

  } catch (error) {
    Logger.log('Erro ao criar resumoName no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar relatório no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarDemoNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'Demo_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Demo');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'Demo'
    };

  } catch (error) {
    Logger.log('Erro ao criar Demo no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo de teste no Drive
function criarTeste_IntegracaoNoDrive(dados) {
  try {
    var folderId = '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = 'Teste_Integracao_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Teste_Integracao');

    // Escrever dados de teste
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      message : 'Arquivo de teste criado no Drive'
    };

  } catch (error) {
    Logger.log('Erro ao criar teste no Drive : ' + error.message);
      chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
      return {
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
      };
    };


// Transformado : Criar arquivo no Drive ao invés de aba


// Transformado : Criar arquivo no Drive ao invés de aba
function criarSTUBS_GERADOSNoDrive(dados, opcoes) {
  try {
    opcoes = opcoes || {};
    var folderId = opcoes.folderId || '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = opcoes.fileName || 'STUBS_GERADOS_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('STUBS_GERADOS');

    // Escrever dados
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);

      // Formatar cabeçalho se especificado
      if (opcoes.formatHeader) {
        sheet.getRange(1, 1, 1, dados[0].length)
          .setFontWeight('bold')
          .setBackground('#eeeeee');
      }

      // Auto-resize colunas
      if (opcoes.autoResize != false) {
        for (var i = 1; i <= dados[0].length; i++) {
          sheet.autoResizeColumn(i);
        }
      }
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      sheetName : 'STUBS_GERADOS'
    };

  } catch (error) {
    Logger.log('Erro ao criar STUBS_GERADOS no Drive : ' + error.message);
    return {
      success : false,
      error : error.message
    };
  }


// Transformado : Criar arquivo de teste no Drive
function criarTeste_TemporarioNoDrive(dados) {
  try {
    var folderId = '1w1_45AjB_wB4KMZbP6JevqD382FyBZ53';
    var folder = DriveApp.getFolderById(folderId);

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var fileName = 'Teste_Temporario_' + timestamp;

    var ss = SpreadsheetApp.create(fileName);
    var sheet = ss.getActiveSheet();
    sheet.setName('Teste_Temporario');

    // Escrever dados de teste
    if (dados && dados.length > 0) {
      sheet.getRange(1, 1, dados.length, dados[0].length).setValues(dados);
    }

    // Mover para pasta
    var fileId = ss.getId();
    var file = DriveApp.getFileById(fileId);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

      // success : true,
      fileId : fileId,
      fileName : fileName,
      url : ss.getUrl(),
      message : 'Arquivo de teste criado no Drive'
    };

  } catch (error) {
    Logger.log('Erro ao criar teste no Drive : ' + error.message);
      chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
      return {
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
      };
    };


// ---- DriveFileManager.gs ----
/**
 * DriveFileManager.gs
 * Gerenciamento centralizado de arquivos no Google Drive
 * Canaliza todas as criações de planilhas para arquivos separados no Drive
 * Sistema UNIAE CRE PP/Cruzeiro
 */

// Função helper para obter DRIVE_FOLDER_ID de forma segura
function getDriveFolderId() {
  // Tentar obter de Properties primeiro
  var propId = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  if (propId) return propId;

  // Fallback para DRIVE_CONFIG se existir
  if (typeof DRIVE_CONFIG != 'undefined' && DRIVE_CONFIG.FOLDER_ID) {
    return DRIVE_CONFIG.FOLDER_ID;
  }

  // Fallback final
}

/**
 * Configurar pasta do Drive
 */
function configurarPastaDrive(folderId) {
  try {
    // Verificar se a pasta existe
    var folder = DriveApp.getFolderById(folderId);

    // Salvar ID
    PropertiesService.getScriptProperties().setProperty('DRIVE_FOLDER_ID', folderId);

    return {
      success : true,
      message : 'Pasta configurada com sucesso',
      folderName : folder.getName(),
      folderId : folderId
    };

  } catch (e) {
      success : false,
      message : 'Erro ao configurar pasta : ' + e.message,
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
        return {
          chaveAcesso : chaveAcesso,
          situacao : "ERRO",
          valida : false
        };
      };
    };


/**
 * Obter pasta configurada
 */
function getPastaDrive() {
  var folderId = getDriveFolderId();

  if (!folderId) {
    throw new Error('Pasta do Drive não configurada. Execute configurarPastaDrive(folderId)');
  }

  try {
    return DriveApp.getFolderById(folderId);
  } catch (e) {
    throw new Error('Pasta do Drive não encontrada : ' + e.message);
    return {
      chaveAcesso : chaveAcesso,
      situacao : "ERRO",
      valida : false
    };
  }
}

/**
 * Criar nova planilha no Drive (ao invés de aba)
 */
function criarPlanilhaDrive(nome, estrutura) {
  try {
    var folder = getPastaDrive();

    // Criar nova planilha
    var spreadsheet = SpreadsheetApp.create(nome);
    var file = DriveApp.getFileById(spreadsheet.getId());

    // Mover para pasta configurada
    file.moveTo(folder);

    // Configurar estrutura se fornecida
    if (estrutura && estrutura.headers) {
      var sheet = spreadsheet.getSheets()[0];
      sheet.setName(estrutura.name || nome);

      // Adicionar headers
      sheet.getRange(1, 1, 1, estrutura.headers.length)
        .setValues([estrutura.headers])
        .setFontWeight('bold')
        .setBackground('#1c4587')
        .setFontColor('#ffffff');

      sheet.setFrozenRows(1);
    }

      // success : true,
      spreadsheetId : spreadsheet.getId(),
      spreadsheetUrl : spreadsheet.getUrl(),
      fileName : nome,
      folderId : folder.getId()
    };

  } catch (e) {
    Logger.log('Erro criarPlanilhaDrive : ' + e.message);
      success : false,
      error : e.message,
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
        return {
          chaveAcesso : chaveAcesso,
          situacao : "ERRO",
          valida : false
        };
      };


/**
 * Criar planilha para tipo de dado específico
 */
function criarPlanilhaPorTipo(tipo, dados) {
  var estruturas = getAllSheetStructures();
  var estrutura = estruturas[tipo];

  if (!estrutura) {
    return {
      success : false,
      error : 'Tipo de planilha não reconhecido : ' + tipo
    };
  }

  var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
  var nome = tipo + '_' + timestamp;

  var resultado = criarPlanilhaDrive(nome, estrutura);

  // Se dados foram fornecidos, adicionar
  if (resultado.success && dados && dados.length > 0) {
    try {
      var spreadsheet = SpreadsheetApp.openById(resultado.spreadsheetId);
      var sheet = spreadsheet.getSheets()[0];

      // Adicionar dados
      sheet.getRange(2, 1, dados.length, dados[0].length).setValues(dados);

      resultado.rowsAdded = dados.length;
    } catch (e) {
      resultado.warning = 'Planilha criada mas erro ao adicionar dados : ' + e.message;
      return {
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
      };
    }
  }

}

/**
 * Listar planilhas na pasta do Drive
 */
function listarPlanilhasDrive() {
  try {
    var folder = getPastaDrive();
    var files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
    var planilhas = [];

    while (files.hasNext()) {
      var file = files.next();
      planilhas.push({
        id : file.getId(),
        name : file.getName(),
        url : file.getUrl(),
        dateCreated : file.getDateCreated(),
        lastUpdated : file.getLastUpdated(),
        size : file.getSize()
      });
    }

    // Ordenar por data de criação (mais recente primeiro)
    planilhas.sort(function(a, b) {});

      // success : true,
      planilhas : planilhas,
      total : planilhas.length,
      folderId : folder.getId(),
      folderName : folder.getName()
    };

  } catch (e) {
      success : false,
      error : e.message,
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
        return {
          chaveAcesso : chaveAcesso,
          situacao : "ERRO",
          valida : false
        };
      };


/**
 * Exportar dados de aba para planilha no Drive
 */
function exportarAbaParaDrive(nomeAba) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(nomeAba);

    if (!sheet) {
      return {
        success : false,
        error : 'Aba não encontrada : ' + nomeAba
      };
    }

    // Obter dados
    var data = sheet.getDataRange().getValues();

    if (data.length == 0) {
        success : false,
        error : 'Aba vazia'
      };
    }

    // Criar estrutura
    var estrutura = {
      name : nomeAba,
      headers : data[0]
    };

    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var nome = nomeAba + '_Export_' + timestamp;

    // Criar planilha
    var resultado = criarPlanilhaDrive(nome, estrutura);

    if (resultado.success && data.length > 1) {
      // Adicionar dados (exceto header)
      var spreadsheet = SpreadsheetApp.openById(resultado.spreadsheetId);
      var newSheet = spreadsheet.getSheets()[0];

      var dataRows = data.slice(1);
      newSheet.getRange(2, 1, dataRows.length, dataRows[0].length).setValues(dataRows);

      resultado.rowsExported = dataRows.length;
    }


  } catch (e) {
      success : false,
      error : e.message,
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
        return {
          chaveAcesso : chaveAcesso,
          situacao : "ERRO",
          valida : false
        };
      };


/**
 * Criar relatório em arquivo separado
 */
function criarRelatorioNoDrive(tipoRelatorio, dados, headers) {
  try {
    var timestamp = Utilities.formatDate(new Date(), 'GMT-3', 'yyyyMMdd_HHmmss');
    var nome = 'Relatorio_' + tipoRelatorio + '_' + timestamp;

    var estrutura = {
      name : tipoRelatorio,
      headers : headers || ['Dados']
    };

    var resultado = criarPlanilhaDrive(nome, estrutura);

    if (resultado.success && dados && dados.length > 0) {
      var spreadsheet = SpreadsheetApp.openById(resultado.spreadsheetId);
      var sheet = spreadsheet.getSheets()[0];

      // Adicionar dados
      sheet.getRange(2, 1, dados.length, dados[0].length).setValues(dados);

      // Formatação adicional
      sheet.autoResizeColumns(1, headers.length);

      resultado.rowsAdded = dados.length;
    }


  } catch (e) {
      success : false,
      error : e.message,
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
        return {
          chaveAcesso : chaveAcesso,
          situacao : "ERRO",
          valida : false
        };
      };
    };


/**
 * Obter informações da pasta configurada
 */
function getInfoPastaDrive() {
  try {
    var folder = getPastaDrive();
    var files = folder.getFiles();
    var totalFiles = 0;
    var totalSize = 0;

    while (files.hasNext()) {
      var file = files.next();
      totalFiles++;
      totalSize += file.getSize();
    }

      // success : true,
      folderId : folder.getId(),
      folderName : folder.getName(),
      folderUrl : folder.getUrl(),
      totalFiles : totalFiles,
      totalSize : totalSize,
      totalSizeMB : (totalSize / 1024 / 1024).toFixed(2)
    };

  } catch (e) {
      success : false,
      error : e.message,
        chaveAcesso : chaveAcesso,
        situacao : "ERRO",
        valida : false
        return {
          chaveAcesso : chaveAcesso,
          situacao : "ERRO",
          valida : false
        };
      };


/**
 * Menu helper - Configurar pasta do Drive via UI
 */
function configurarPastaDriveUI() {
  var ui = getSafeUi();

  var response = ui.prompt(
    'Configurar Pasta do Drive',
    'Cole o ID da pasta do Google Drive onde os arquivos serão salvos : \n\n' +
    'Para obter o ID : \n' +
    '1. Abra a pasta no Drive\n' +
    '2. Copie o ID da URL (após /folders/)\n\n' +
    'Exemplo : 1a2b3c4d5e6f7g8h9i0j',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() == ui.Button.OK) {
    var folderId = response.getResponseText().trim();

    if (!folderId) {
      safeAlert('Erro', 'ID da pasta não pode estar vazio', ui.ButtonSet.OK);
      return;
    }

    var resultado = configurarPastaDrive(folderId);

    if (resultado.success) {
      safeAlert()
        'Sucesso',
        'Pasta configurada com sucesso!\n\n' +
        'Nome : ' + resultado.folderName + '\n' +
        'ID : ' + resultado.folderId,
        ui.ButtonSet.OK
      );
    } else {
      safeAlert('Erro', resultado.message, ui.ButtonSet.OK);
    }
  }
}

/**
 * Menu helper - Listar arquivos na pasta
 */
function listarArquivosDriveUI() {
  var ui = getSafeUi();

  var resultado = listarPlanilhasDrive();

  if (!resultado.success) {
    ui.alert('Erro', resultado.error, ui.ButtonSet.OK);
    return;
  }

  var mensagem = 'Arquivos na pasta : ' + resultado.folderName + '\n\n';
  mensagem += 'Total : ' + resultado.total + ' planilhas\n\n';

  if (resultado.planilhas.length > 0) {
    mensagem += 'Últimos 10 arquivos : \n';
    resultado.planilhas.slice(0, 10).forEach(function(p, idx) {
      mensagem += (idx + 1) + '. ' + p.name + '\n';
    });
  } else {
    mensagem += 'Nenhuma planilha encontrada.';
  }

  safeAlert('Arquivos no Drive', mensagem, ui.ButtonSet.OK);
}

