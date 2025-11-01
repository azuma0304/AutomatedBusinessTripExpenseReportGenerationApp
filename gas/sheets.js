/**
 * スプレッドシート操作の共通ユーティリティ
 * Apps Script ではファイル間で import は不要/不可。グローバル関数として利用します。
 */

/**
 * スプレッドシートを開く
 * @param {string} spreadsheetId - スプレッドシートID
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function openSpreadsheetById(spreadsheetId) {
  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * シートを取得（なければ作成）
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} sheetName
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * 指定範囲の値を2次元配列で取得
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row
 * @param {number} col
 * @param {number} numRows
 * @param {number} numCols
 * @returns {any[][]}
 */
function getValues(sheet, row, col, numRows, numCols) {
  return sheet.getRange(row, col, numRows, numCols).getValues();
}

/**
 * 指定範囲に2次元配列を書き込み
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row
 * @param {number} col
 * @param {any[][]} values
 */
function setValues(sheet, row, col, values) {
  sheet.getRange(row, col, values.length, values[0].length).setValues(values);
}

/**
 * 空行をスキップし、指定列の値のみ抽出
 * @param {any[][]} rows
 * @param {number} colIdx - 0ベースの列インデックス
 * @returns {string[]}
 */
function mapColumn(rows, colIdx) {
  return rows
    .map(function (r) { return r[colIdx]; })
    .filter(function (v) { return v !== null && v !== undefined && String(v).trim() !== ''; })
    .map(function (v) { return String(v).trim(); });
}


