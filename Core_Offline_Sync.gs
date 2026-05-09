/**
 * @fileoverview Sincronização Offline-First - Alimentação Escolar CRE-PP
 * @version 1.0.0
 * 
 * Intervenção 7/38: SyncEngine conforme Prompt 7
 * 
 * Mecanismo de sincronização para suporte offline que permite:
 * - Unidades Escolares (UE) registrarem recebimento de alimentos sem internet
 * - Armazenamento no localStorage do dispositivo
 * - Sincronização automática quando a conexão for restabelecida
 * - Resolução de conflitos
 * 
 * @author UNIAE CRE Team
 * @created 2025-12-25
 */

'use strict';

// ============================================================================
// SYNC ENGINE - Motor de Sincronização Offline-First
// ============================================================================

var SyncEngine = (function() {
  
  // =========================================================================
  // CONFIGURAÇÃO
  // =========================================================================
  
  var CONFIG = {
    // Aba para fila de sincronização
    SYNC_QUEUE_SHEET: 'Sync_Queue',
    
    // Prefixos para identificação
    PREFIX_OFFLINE: 'OFF_',
    PREFIX_PENDING: 'PEND_',
    
    // Limites
    MAX_QUEUE_SIZE: 500,
    MAX_RETRY_ATTEMPTS: 3,
    BATCH_SIZE: 50,
    
    // Timeouts (ms)
    SYNC_TIMEOUT: 30000,
    
    // Entidades sincronizáveis
    SYNCABLE_ENTITIES: [
      'Recebimento_Generos',
      'Entregas',
      'Recusas',
      'Ocorrencias_Descarte',
      'Estoque_Escolar'
    ],
    
    // Status de sincronização
    STATUS: {
      PENDING: 'PENDING',
      SYNCING: 'SYNCING',
      SYNCED: 'SYNCED',
      CONFLICT: 'CONFLICT',
      ERROR: 'ERROR'
    }
  };
  
  // =========================================================================
  // FUNÇÕES PRIVADAS
  // =========================================================================
  
  /**
   * Obtém ou cria aba de fila de sincronização
   * @private
   */
  function _getSyncQueueSheet() {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) return null;
      
      var sheet = ss.getSheetByName(CONFIG.SYNC_QUEUE_SHEET);
      
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.SYNC_QUEUE_SHEET);
        
        var headers = [
          'ID',
          'Entidade',
          'Operacao',           // CREATE, UPDATE, DELETE
          'Dados_JSON',
          'ID_Local',           // ID gerado offline
          'ID_Servidor',        // ID após sync
          'Usuario',
          'Dispositivo',
          'Data_Criacao_Local',
          'Data_Sync',
          'Status',
          'Tentativas',
          'Erro',
          'Checksum'
        ];
        
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length)
          .setBackground('#EF6C00')
          .setFontColor('white')
          .setFontWeight('bold');
        
        sheet.setFrozenRows(1);
        sheet.setTabColor('#EF6C00');
      }
      
      return sheet;
    } catch (e) {
      console.error('Erro ao obter sheet de sync: ' + e.message);
      return null;
    }
  }
  
  /**
   * Gera ID offline único
   * @private
   */
  function _generateOfflineId() {
    var timestamp = Date.now().toString(36);
    var random = Math.random().toString(36).substr(2, 8);
    return CONFIG.PREFIX_OFFLINE + timestamp + '_' + random;
  }
  
  /**
   * Gera checksum para detecção de conflitos
   * @private
   */
  function _generateChecksum(data) {
    var str = JSON.stringify(data);
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Obtém usuário atual
   * @private
   */
  function _getCurrentUser() {
    try {
      return Session.getActiveUser().getEmail() || 'offline_user';
    } catch (e) {
      return 'offline_user';
    }
  }
  
  // =========================================================================
  // API PÚBLICA
  // =========================================================================
  
  return {
    
    /**
     * Expõe configuração
     */
    CONFIG: CONFIG,
    
    // -----------------------------------------------------------------------
    // ENFILEIRAMENTO DE OPERAÇÕES OFFLINE
    // -----------------------------------------------------------------------
    
    /**
     * Adiciona operação à fila de sincronização
     * @param {string} entity - Nome da entidade
     * @param {string} operation - CREATE, UPDATE, DELETE
     * @param {Object} data - Dados da operação
     * @param {Object} [options] - Opções { localId, device }
     * @returns {Object} Resultado com ID local
     */
    enqueue: function(entity, operation, data, options) {
      options = options || {};
      
      try {
        // Valida entidade
        if (CONFIG.SYNCABLE_ENTITIES.indexOf(entity) === -1) {
          return {
            success: false,
            error: 'Entidade não sincronizável: ' + entity
          };
        }
        
        var sheet = _getSyncQueueSheet();
        if (!sheet) {
          return { success: false, error: 'Não foi possível acessar fila de sync' };
        }
        
        // Verifica limite da fila
        var queueSize = sheet.getLastRow() - 1;
        if (queueSize >= CONFIG.MAX_QUEUE_SIZE) {
          return { success: false, error: 'Fila de sincronização cheia' };
        }
        
        var localId = options.localId || _generateOfflineId();
        var now = new Date();
        
        var queueItem = [
          Utilities.getUuid(),           // ID
          entity,                         // Entidade
          operation,                      // Operação
          JSON.stringify(data),           // Dados JSON
          localId,                        // ID Local
          '',                             // ID Servidor (vazio até sync)
          _getCurrentUser(),              // Usuário
          options.device || 'unknown',    // Dispositivo
          now,                            // Data Criação Local
          '',                             // Data Sync (vazio)
          CONFIG.STATUS.PENDING,          // Status
          0,                              // Tentativas
          '',                             // Erro
          _generateChecksum(data)         // Checksum
        ];
        
        sheet.appendRow(queueItem);
        
        return {
          success: true,
          localId: localId,
          queueId: queueItem[0],
          message: 'Operação enfileirada para sincronização'
        };
        
      } catch (e) {
        console.error('Erro ao enfileirar: ' + e.message);
        return { success: false, error: e.message };
      }
    },
    
    /**
     * Obtém itens pendentes na fila
     * @param {Object} [filters] - Filtros { entity, status, limit }
     * @returns {Object} Resultado com itens
     */
    getPendingItems: function(filters) {
      filters = filters || {};
      
      try {
        var sheet = _getSyncQueueSheet();
        if (!sheet || sheet.getLastRow() <= 1) {
          return { success: true, items: [], count: 0 };
        }
        
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var items = [];
        
        for (var i = 1; i < data.length; i++) {
          var row = {};
          headers.forEach(function(h, idx) {
            row[h] = data[i][idx];
          });
          row._rowIndex = i + 1;
          
          // Aplica filtros
          var match = true;
          
          if (filters.entity && row.Entidade !== filters.entity) match = false;
          if (filters.status && row.Status !== filters.status) match = false;
          if (!filters.status && row.Status !== CONFIG.STATUS.PENDING) match = false;
          
          if (match) {
            // Parse dados JSON
            try {
              row.Dados = JSON.parse(row.Dados_JSON);
            } catch (e) {
              row.Dados = {};
            }
            items.push(row);
          }
        }
        
        // Aplica limite
        if (filters.limit && items.length > filters.limit) {
          items = items.slice(0, filters.limit);
        }
        
        return {
          success: true,
          items: items,
          count: items.length
        };
        
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    
    // -----------------------------------------------------------------------
    // SINCRONIZAÇÃO
    // -----------------------------------------------------------------------
    
    /**
     * Processa fila de sincronização
     * @param {Object} [options] - Opções { batchSize, entity }
     * @returns {Object} Resultado da sincronização
     */
    processQueue: function(options) {
      options = options || {};
      var batchSize = options.batchSize || CONFIG.BATCH_SIZE;
      
      var result = {
        success: true,
        processed: 0,
        synced: 0,
        errors: 0,
        conflicts: 0,
        details: []
      };
      
      try {
        var pendingResult = this.getPendingItems({
          entity: options.entity,
          status: CONFIG.STATUS.PENDING,
          limit: batchSize
        });
        
        if (!pendingResult.success || pendingResult.items.length === 0) {
          result.message = 'Nenhum item pendente para sincronizar';
          return result;
        }
        
        var sheet = _getSyncQueueSheet();
        var items = pendingResult.items;
        
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          result.processed++;
          
          // Atualiza status para SYNCING
          this._updateQueueItemStatus(sheet, item._rowIndex, CONFIG.STATUS.SYNCING);
          
          try {
            // Executa operação
            var syncResult = this._syncItem(item);
            
            if (syncResult.success) {
              result.synced++;
              this._updateQueueItemStatus(sheet, item._rowIndex, CONFIG.STATUS.SYNCED, {
                serverId: syncResult.serverId,
                syncDate: new Date()
              });
              
              result.details.push({
                localId: item.ID_Local,
                serverId: syncResult.serverId,
                status: 'SYNCED'
              });
              
            } else if (syncResult.conflict) {
              result.conflicts++;
              this._updateQueueItemStatus(sheet, item._rowIndex, CONFIG.STATUS.CONFLICT, {
                error: syncResult.error
              });
              
              result.details.push({
                localId: item.ID_Local,
                status: 'CONFLICT',
                error: syncResult.error
              });
              
            } else {
              throw new Error(syncResult.error || 'Erro desconhecido');
            }
            
          } catch (e) {
            result.errors++;
            
            // Incrementa tentativas
            var tentativas = (item.Tentativas || 0) + 1;
            var newStatus = tentativas >= CONFIG.MAX_RETRY_ATTEMPTS 
              ? CONFIG.STATUS.ERROR 
              : CONFIG.STATUS.PENDING;
            
            this._updateQueueItemStatus(sheet, item._rowIndex, newStatus, {
              error: e.message,
              tentativas: tentativas
            });
            
            result.details.push({
              localId: item.ID_Local,
              status: 'ERROR',
              error: e.message,
              tentativas: tentativas
            });
          }
        }
        
        result.message = 'Sincronização concluída: ' + result.synced + '/' + result.processed + ' itens';
        
      } catch (e) {
        result.success = false;
        result.error = e.message;
      }
      
      return result;
    },
    
    /**
     * Sincroniza um item específico
     * @private
     */
    _syncItem: function(item) {
      var entity = item.Entidade;
      var operation = item.Operacao;
      var data = item.Dados;
      
      // Usa DatabaseEngine se disponível
      if (typeof DatabaseEngine !== 'undefined') {
        switch (operation) {
          case 'CREATE':
            // Remove ID local, deixa o servidor gerar
            delete data.ID;
            data._offlineId = item.ID_Local;
            
            var createResult = DatabaseEngine.create(entity, data, { skipAudit: false });
            if (createResult.success) {
              return { success: true, serverId: createResult.data ? createResult.data.ID : createResult.id };
            }
            return { success: false, error: createResult.error };
            
          case 'UPDATE':
            var updateResult = DatabaseEngine.update(entity, data.ID, data, { skipAudit: false });
            if (updateResult.success) {
              return { success: true, serverId: data.ID };
            }
            
            // Verifica conflito (checksum diferente)
            if (updateResult.error && updateResult.error.indexOf('não encontrado') !== -1) {
              return { success: false, conflict: true, error: 'Registro não encontrado no servidor' };
            }
            return { success: false, error: updateResult.error };
            
          case 'DELETE':
            var deleteResult = DatabaseEngine.delete(entity, data.ID, { skipAudit: false });
            return deleteResult;
            
          default:
            return { success: false, error: 'Operação desconhecida: ' + operation };
        }
      }
      
      // Fallback para CRUD básico
      if (typeof CRUDService !== 'undefined') {
        var sheetName = typeof SCHEMA !== 'undefined' ? SCHEMA.getSheetName(entity) : entity;
        
        switch (operation) {
          case 'CREATE':
            return CRUDService.create(sheetName, data);
          case 'UPDATE':
            return CRUDService.update(sheetName, data._rowIndex || data.ID, data);
          case 'DELETE':
            return CRUDService.delete(sheetName, data._rowIndex || data.ID, true);
          default:
            return { success: false, error: 'Operação desconhecida' };
        }
      }
      
      return { success: false, error: 'Nenhum serviço de persistência disponível' };
    },
    
    /**
     * Atualiza status de item na fila
     * @private
     */
    _updateQueueItemStatus: function(sheet, rowIndex, status, extras) {
      extras = extras || {};
      
      try {
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // Status
        var statusCol = headers.indexOf('Status');
        if (statusCol !== -1) {
          sheet.getRange(rowIndex, statusCol + 1).setValue(status);
        }
        
        // Data Sync
        if (extras.syncDate) {
          var syncDateCol = headers.indexOf('Data_Sync');
          if (syncDateCol !== -1) {
            sheet.getRange(rowIndex, syncDateCol + 1).setValue(extras.syncDate);
          }
        }
        
        // ID Servidor
        if (extras.serverId) {
          var serverIdCol = headers.indexOf('ID_Servidor');
          if (serverIdCol !== -1) {
            sheet.getRange(rowIndex, serverIdCol + 1).setValue(extras.serverId);
          }
        }
        
        // Erro
        if (extras.error) {
          var erroCol = headers.indexOf('Erro');
          if (erroCol !== -1) {
            sheet.getRange(rowIndex, erroCol + 1).setValue(extras.error);
          }
        }
        
        // Tentativas
        if (extras.tentativas !== undefined) {
          var tentCol = headers.indexOf('Tentativas');
          if (tentCol !== -1) {
            sheet.getRange(rowIndex, tentCol + 1).setValue(extras.tentativas);
          }
        }
        
      } catch (e) {
        console.error('Erro ao atualizar status: ' + e.message);
      }
    },
    
    // -----------------------------------------------------------------------
    // RESOLUÇÃO DE CONFLITOS
    // -----------------------------------------------------------------------
    
    /**
     * Obtém itens com conflito
     * @returns {Object} Itens em conflito
     */
    getConflicts: function() {
      return this.getPendingItems({ status: CONFIG.STATUS.CONFLICT });
    },
    
    /**
     * Resolve conflito mantendo versão local
     * @param {string} queueId - ID do item na fila
     * @returns {Object} Resultado
     */
    resolveConflictKeepLocal: function(queueId) {
      try {
        var sheet = _getSyncQueueSheet();
        if (!sheet) return { success: false, error: 'Sheet não encontrada' };
        
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var idCol = headers.indexOf('ID');
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][idCol] === queueId) {
            // Força re-sync com dados locais
            this._updateQueueItemStatus(sheet, i + 1, CONFIG.STATUS.PENDING, {
              error: '',
              tentativas: 0
            });
            
            return { success: true, message: 'Conflito marcado para re-sincronização' };
          }
        }
        
        return { success: false, error: 'Item não encontrado' };
        
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    
    /**
     * Resolve conflito descartando versão local
     * @param {string} queueId - ID do item na fila
     * @returns {Object} Resultado
     */
    resolveConflictKeepServer: function(queueId) {
      try {
        var sheet = _getSyncQueueSheet();
        if (!sheet) return { success: false, error: 'Sheet não encontrada' };
        
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var idCol = headers.indexOf('ID');
        
        for (var i = 1; i < data.length; i++) {
          if (data[i][idCol] === queueId) {
            // Marca como resolvido (descartado)
            this._updateQueueItemStatus(sheet, i + 1, CONFIG.STATUS.SYNCED, {
              error: 'Descartado - mantida versão do servidor'
            });
            
            return { success: true, message: 'Versão local descartada' };
          }
        }
        
        return { success: false, error: 'Item não encontrado' };
        
      } catch (e) {
        return { success: false, error: e.message };
      }
    },
    
    // -----------------------------------------------------------------------
    // ESTATÍSTICAS E MANUTENÇÃO
    // -----------------------------------------------------------------------
    
    /**
     * Obtém estatísticas da fila de sincronização
     * @returns {Object} Estatísticas
     */
    getStats: function() {
      try {
        var sheet = _getSyncQueueSheet();
        if (!sheet || sheet.getLastRow() <= 1) {
          return {
            total: 0,
            pending: 0,
            synced: 0,
            conflicts: 0,
            errors: 0
          };
        }
        
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var statusCol = headers.indexOf('Status');
        
        var stats = {
          total: data.length - 1,
          pending: 0,
          syncing: 0,
          synced: 0,
          conflicts: 0,
          errors: 0,
          byEntity: {}
        };
        
        var entityCol = headers.indexOf('Entidade');
        
        for (var i = 1; i < data.length; i++) {
          var status = data[i][statusCol];
          var entity = data[i][entityCol];
          
          switch (status) {
            case CONFIG.STATUS.PENDING: stats.pending++; break;
            case CONFIG.STATUS.SYNCING: stats.syncing++; break;
            case CONFIG.STATUS.SYNCED: stats.synced++; break;
            case CONFIG.STATUS.CONFLICT: stats.conflicts++; break;
            case CONFIG.STATUS.ERROR: stats.errors++; break;
          }
          
          if (!stats.byEntity[entity]) {
            stats.byEntity[entity] = { pending: 0, synced: 0, errors: 0 };
          }
          
          if (status === CONFIG.STATUS.PENDING) stats.byEntity[entity].pending++;
          else if (status === CONFIG.STATUS.SYNCED) stats.byEntity[entity].synced++;
          else if (status === CONFIG.STATUS.ERROR) stats.byEntity[entity].errors++;
        }
        
        return stats;
        
      } catch (e) {
        return { error: e.message };
      }
    },
    
    /**
     * Limpa itens sincronizados antigos
     * @param {number} [daysOld=30] - Dias para considerar antigo
     * @returns {Object} Resultado
     */
    cleanupSynced: function(daysOld) {
      daysOld = daysOld || 30;
      
      try {
        var sheet = _getSyncQueueSheet();
        if (!sheet || sheet.getLastRow() <= 1) {
          return { success: true, removed: 0 };
        }
        
        var data = sheet.getDataRange().getValues();
        var headers = data[0];
        var statusCol = headers.indexOf('Status');
        var syncDateCol = headers.indexOf('Data_Sync');
        var cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        var rowsToDelete = [];
        
        for (var i = 1; i < data.length; i++) {
          var status = data[i][statusCol];
          var syncDate = new Date(data[i][syncDateCol]);
          
          if (status === CONFIG.STATUS.SYNCED && syncDate < cutoffDate) {
            rowsToDelete.push(i + 1);
          }
        }
        
        // Remove de baixo para cima
        rowsToDelete.reverse().forEach(function(row) {
          sheet.deleteRow(row);
        });
        
        return {
          success: true,
          removed: rowsToDelete.length,
          message: rowsToDelete.length + ' itens antigos removidos'
        };
        
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  };
})();


// ============================================================================
// FUNÇÕES PARA RECEBIMENTO DE ALIMENTOS (UE)
// ============================================================================

/**
 * Registra recebimento de alimentos (offline-capable)
 * @param {Object} dados - Dados do recebimento
 * @returns {Object} Resultado
 */
function registrarRecebimentoOffline(dados) {
  // Valida dados mínimos
  if (!dados.Unidade_Escolar || !dados.Fornecedor || !dados.Data_Entrega) {
    return {
      success: false,
      error: 'Dados obrigatórios: Unidade_Escolar, Fornecedor, Data_Entrega'
    };
  }
  
  // Adiciona metadados
  dados.Data_Registro = new Date();
  dados.Registrado_Por = Session.getActiveUser().getEmail() || 'offline';
  dados.Status = dados.Status || 'REGISTRADO';
  
  // Enfileira para sincronização
  return SyncEngine.enqueue('Recebimento_Generos', 'CREATE', dados, {
    device: dados._device || 'mobile'
  });
}

/**
 * Registra recusa de entrega (offline-capable)
 * @param {Object} dados - Dados da recusa
 * @returns {Object} Resultado
 */
function registrarRecusaOffline(dados) {
  if (!dados.Motivo || !dados.Produto) {
    return {
      success: false,
      error: 'Dados obrigatórios: Motivo, Produto'
    };
  }
  
  dados.Data_Recusa = dados.Data_Recusa || new Date();
  dados.Responsavel = Session.getActiveUser().getEmail() || 'offline';
  dados.Status = 'PENDENTE';
  
  return SyncEngine.enqueue('Recusas', 'CREATE', dados, {
    device: dados._device || 'mobile'
  });
}

/**
 * Registra ocorrência de descarte (offline-capable)
 * @param {Object} dados - Dados da ocorrência
 * @returns {Object} Resultado
 */
function registrarDescarteOffline(dados) {
  if (!dados.Produto || !dados.Motivo_Descarte || !dados.Quantidade) {
    return {
      success: false,
      error: 'Dados obrigatórios: Produto, Motivo_Descarte, Quantidade'
    };
  }
  
  dados.Data_Ocorrencia = dados.Data_Ocorrencia || new Date();
  dados.Responsavel_Registro = Session.getActiveUser().getEmail() || 'offline';
  dados.Status = 'PENDENTE';
  
  return SyncEngine.enqueue('Ocorrencias_Descarte', 'CREATE', dados, {
    device: dados._device || 'mobile'
  });
}

/**
 * Atualiza estoque escolar (offline-capable)
 * @param {Object} dados - Dados do estoque
 * @returns {Object} Resultado
 */
function atualizarEstoqueOffline(dados) {
  if (!dados.Unidade_Escolar_ID || !dados.Item_ID) {
    return {
      success: false,
      error: 'Dados obrigatórios: Unidade_Escolar_ID, Item_ID'
    };
  }
  
  dados.Data_Ultima_Atualizacao = new Date();
  dados.Responsavel_Atualizacao = Session.getActiveUser().getEmail() || 'offline';
  
  var operation = dados.ID ? 'UPDATE' : 'CREATE';
  
  return SyncEngine.enqueue('Estoque_Escolar', operation, dados, {
    device: dados._device || 'mobile'
  });
}

// ============================================================================
// FUNÇÕES DE API PARA FRONTEND
// ============================================================================

/**
 * API: Sincroniza dados pendentes
 */
function api_sync_process() {
  return SyncEngine.processQueue();
}

/**
 * API: Obtém itens pendentes
 */
function api_sync_pending(entity) {
  return SyncEngine.getPendingItems({ entity: entity });
}

/**
 * API: Obtém estatísticas de sync
 */
function api_sync_stats() {
  return SyncEngine.getStats();
}

/**
 * API: Obtém conflitos
 */
function api_sync_conflicts() {
  return SyncEngine.getConflicts();
}

/**
 * API: Resolve conflito (keep local)
 */
function api_sync_resolve_local(queueId) {
  return SyncEngine.resolveConflictKeepLocal(queueId);
}

/**
 * API: Resolve conflito (keep server)
 */
function api_sync_resolve_server(queueId) {
  return SyncEngine.resolveConflictKeepServer(queueId);
}

/**
 * API: Registra recebimento offline
 */
function api_registrar_recebimento(dados) {
  return registrarRecebimentoOffline(dados);
}

/**
 * API: Registra recusa offline
 */
function api_registrar_recusa(dados) {
  return registrarRecusaOffline(dados);
}

/**
 * API: Registra descarte offline
 */
function api_registrar_descarte(dados) {
  return registrarDescarteOffline(dados);
}

/**
 * API: Atualiza estoque offline
 */
function api_atualizar_estoque(dados) {
  return atualizarEstoqueOffline(dados);
}

// ============================================================================
// CÓDIGO JAVASCRIPT PARA FRONTEND (localStorage)
// ============================================================================

/**
 * Retorna código JavaScript para sincronização offline no frontend
 * @returns {string} Código JS
 */
function getOfflineSyncCode() {
  return `
// ============================================================================
// OFFLINE SYNC CLIENT - Alimentação Escolar
// ============================================================================

var OfflineSync = (function() {
  var STORAGE_KEY = 'AE_offline_queue';
  var SYNC_STATUS_KEY = 'AE_sync_status';
  
  // Verifica se está online
  function isOnline() {
    return navigator.onLine;
  }
  
  // Obtém fila do localStorage
  function getQueue() {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  // Salva fila no localStorage
  function saveQueue(queue) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    updateSyncStatus();
  }
  
  // Atualiza indicador de status
  function updateSyncStatus() {
    var queue = getQueue();
    var status = {
      pending: queue.length,
      lastCheck: new Date().toISOString(),
      online: isOnline()
    };
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
    
    // Dispara evento customizado
    window.dispatchEvent(new CustomEvent('syncStatusChanged', { detail: status }));
  }
  
  // Gera ID offline
  function generateOfflineId() {
    return 'OFF_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
  }
  
  return {
    // Verifica conexão
    isOnline: isOnline,
    
    // Adiciona item à fila offline
    enqueue: function(entity, operation, data) {
      var queue = getQueue();
      var item = {
        id: generateOfflineId(),
        entity: entity,
        operation: operation,
        data: data,
        timestamp: new Date().toISOString(),
        synced: false
      };
      queue.push(item);
      saveQueue(queue);
      
      console.log('[OfflineSync] Enfileirado:', item.id);
      return item;
    },
    
    // Obtém itens pendentes
    getPending: function() {
      return getQueue().filter(function(item) { return !item.synced; });
    },
    
    // Sincroniza com servidor
    sync: function(callback) {
      var self = this;
      var queue = getQueue();
      var pending = queue.filter(function(item) { return !item.synced; });
      
      if (pending.length === 0) {
        console.log('[OfflineSync] Nada para sincronizar');
        if (callback) callback({ success: true, synced: 0 });
        return;
      }
      
      if (!isOnline()) {
        console.log('[OfflineSync] Offline - sincronização adiada');
        if (callback) callback({ success: false, error: 'Offline' });
        return;
      }
      
      console.log('[OfflineSync] Sincronizando ' + pending.length + ' itens...');
      
      // Envia para o servidor
      google.script.run
        .withSuccessHandler(function(result) {
          if (result.success) {
            // Marca itens como sincronizados
            pending.forEach(function(item) {
              item.synced = true;
              item.syncedAt = new Date().toISOString();
            });
            saveQueue(queue);
            
            // Limpa itens sincronizados antigos (mais de 7 dias)
            self.cleanup(7);
          }
          
          console.log('[OfflineSync] Resultado:', result);
          if (callback) callback(result);
        })
        .withFailureHandler(function(error) {
          console.error('[OfflineSync] Erro:', error);
          if (callback) callback({ success: false, error: error.message });
        })
        .api_sync_process();
    },
    
    // Limpa itens antigos
    cleanup: function(daysOld) {
      daysOld = daysOld || 7;
      var cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysOld);
      
      var queue = getQueue();
      var filtered = queue.filter(function(item) {
        if (!item.synced) return true;
        return new Date(item.syncedAt || item.timestamp) > cutoff;
      });
      
      if (filtered.length < queue.length) {
        saveQueue(filtered);
        console.log('[OfflineSync] Removidos ' + (queue.length - filtered.length) + ' itens antigos');
      }
    },
    
    // Obtém status
    getStatus: function() {
      var data = localStorage.getItem(SYNC_STATUS_KEY);
      return data ? JSON.parse(data) : { pending: 0, online: isOnline() };
    },
    
    // Registra recebimento (offline-first)
    registrarRecebimento: function(dados, callback) {
      var self = this;
      
      if (isOnline()) {
        // Tenta enviar direto
        google.script.run
          .withSuccessHandler(function(result) {
            if (callback) callback(result);
          })
          .withFailureHandler(function(error) {
            // Falhou - enfileira offline
            var item = self.enqueue('Recebimento_Generos', 'CREATE', dados);
            if (callback) callback({ success: true, offline: true, localId: item.id });
          })
          .api_registrar_recebimento(dados);
      } else {
        // Offline - enfileira
        var item = this.enqueue('Recebimento_Generos', 'CREATE', dados);
        if (callback) callback({ success: true, offline: true, localId: item.id });
      }
    },
    
    // Registra recusa (offline-first)
    registrarRecusa: function(dados, callback) {
      var self = this;
      
      if (isOnline()) {
        google.script.run
          .withSuccessHandler(function(result) { if (callback) callback(result); })
          .withFailureHandler(function(error) {
            var item = self.enqueue('Recusas', 'CREATE', dados);
            if (callback) callback({ success: true, offline: true, localId: item.id });
          })
          .api_registrar_recusa(dados);
      } else {
        var item = this.enqueue('Recusas', 'CREATE', dados);
        if (callback) callback({ success: true, offline: true, localId: item.id });
      }
    },
    
    // Inicializa listeners
    init: function() {
      var self = this;
      
      // Listener para mudança de conexão
      window.addEventListener('online', function() {
        console.log('[OfflineSync] Conexão restaurada - iniciando sync...');
        updateSyncStatus();
        self.sync();
      });
      
      window.addEventListener('offline', function() {
        console.log('[OfflineSync] Conexão perdida');
        updateSyncStatus();
      });
      
      // Atualiza status inicial
      updateSyncStatus();
      
      // Tenta sincronizar ao iniciar
      if (isOnline()) {
        setTimeout(function() { self.sync(); }, 2000);
      }
      
      console.log('[OfflineSync] Inicializado');
    }
  };
})();

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { OfflineSync.init(); });
} else {
  OfflineSync.init();
}
`;
}

// ============================================================================
// TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA
// ============================================================================

/**
 * Função para trigger periódico (a cada 5 minutos)
 * Processa fila de sincronização automaticamente
 */
function autoSyncQueue() {
  var result = SyncEngine.processQueue({ batchSize: 100 });
  Logger.log('Auto-sync: ' + JSON.stringify(result));
  return result;
}

/**
 * Função para trigger diário
 * Limpa itens sincronizados antigos
 */
function dailySyncCleanup() {
  var result = SyncEngine.cleanupSynced(30);
  Logger.log('Sync cleanup: ' + JSON.stringify(result));
  return result;
}

// ============================================================================
// REGISTRO DO MÓDULO
// ============================================================================

Logger.log('✅ Core_Offline_Sync carregado - SyncEngine disponível');
