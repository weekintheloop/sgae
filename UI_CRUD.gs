/**
 * @fileoverview UI CRUD - Interface de gerenciamento
 * @version 4.0.0
 *
 * Dependências:
 * - Core_UI_Safe.gs (getSafeUi, safeAlert, safePrompt)
 * - Core_CRUD.gs (CRUD)
 */

'use strict';

// Usa funções de Core_UI_Safe.gs (getSafeUi, safeAlert, safePrompt)

function showCRUDInterface() {
  var html = HtmlService.createHtmlOutputFromFile('UI_CRUD')
    .setWidth(1200)
    .setHeight(800)
    .setTitle('Gerenciador CRUD');

  SpreadsheetApp.getUi().showModalDialog(html, 'Gerenciador CRUD');
}

function createRecord(sheetName, data) {
  return CRUD.create(sheetName, data);
}

function readRecords(sheetName, options) {
  return CRUD.read(sheetName, options);
}

function updateRecord(sheetName, rowIndex, data) {
  return CRUD.update(sheetName, rowIndex, data);
}

function deleteRecord(sheetName, rowIndex, hard) {
  return CRUD.delete(sheetName, rowIndex, hard);
}
