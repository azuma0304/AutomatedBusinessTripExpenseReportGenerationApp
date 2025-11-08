// このファイルは gas/main.js の完全なバックアップです
// もしApps Scriptエディタで全体をコピーする必要がある場合、
// このファイルの内容をすべてコピーしてください
// 
// 重要: これはmain.jsの一部のみです。
// 完全なコードは calclate.js, sheets.js, docs.js も必要です。

function doPost(e) {
  try {
    // POSTされたデータをパース
    const data = JSON.parse(e.postData.contents);
    /**
     * @typedef {Object} TravelExpenseData
     * @property {string} destination - 出張先
     * @property {string} purpose - 出張目的
     * @property {string} departureDate - 出発日
     * @property {string} returnDate - 帰着日
     * @property {number} travelDays - 出張日数
     * @property {number} lodgingDays - 宿泊日数
     * @property {Array} publicTransportDetails - 公共交通機関の詳細
     * @property {Array} carUsageDetails - 自動車利用明細
     * @property {Array} otherTransportDetails - その他交通手段
     * @property {Array} dailyAllowanceDetails - 日当区分
     * @property {Array} lodgingDetails - 宿泊区分
     * @property {Array} receipts - 領収書リスト
     * @property {string} submittedAt - 申請日時（ISO文字列）
     * @property {boolean} [isDraft] - 下書きフラグ（任意）
     */
    /** @type {TravelExpenseData} */
    // data: 出張旅費申請データ

    // スプレッドシートを開く
    const spreadsheet = SpreadsheetApp.openById("1x37-WMX5C5kmcjr4u8gMzwIoaeT3MJL2lQY-Xf57UBo");

    // 各出張申請ごとに新しいシートを作成
    const timestamp = new Date();
    const sheetName = `${formatDate(data.departureDate || timestamp)}_${data.destination || '出張'}`;

    // 既存のシートがあれば削除（上書き）、なければ新規作成
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (sheet) {
      spreadsheet.deleteSheet(sheet);
    }
    sheet = spreadsheet.insertSheet(sheetName);

    // シートのレイアウトを作成
    createSheetLayout(sheet, data, "1x37-WMX5C5kmcjr4u8gMzwIoaeT3MJL2lQY-Xf57UBo");

    // Googleドキュメントを作成（テンプレートから）
    const templateDocId = "1NuJG_LJQUr27bnKyCeuuG37kx2xmaTTO6Us2lfs_PQY";
    // 保存先フォルダID（ここを変更するだけで保存先を変更できます）
    const SAVE_FOLDER_ID = "19Uh-bv4P_fM5Y1sdyQs4XwezFPX2MaWA"
    const docId = createDocumentFromTemplate(
      templateDocId,
      "1x37-WMX5C5kmcjr4u8gMzwIoaeT3MJL2lQY-Xf57UBo",
      sheetName,
      `${sheetName}_出張旅費書`,
      SAVE_FOLDER_ID
    );

    // プレビューURLを生成
    const documentUrl = `https://docs.google.com/document/d/${docId}/preview`;

    const response = ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "データが正常に保存されました",
        sheetName: sheetName,
        documentId: docId,
        documentUrl: documentUrl
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
    // CORSヘッダーを追加
    return addCorsHeaders(response);

  } catch (err) {
    console.error("エラー:", err);
    const response = ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: err.toString(),
        stack: err.stack
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
    // CORSヘッダーを追加
    return addCorsHeaders(response);
  }
}

/**
 * CORSヘッダーを追加する共通関数
 * @param {ContentService.TextOutput} response - レスポンスオブジェクト
 * @returns {ContentService.TextOutput} - CORSヘッダー付きレスポンス
 */
function addCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Max-Age', '86400');
  return response;
}

/**
 * OPTIONSリクエストハンドラー（プリフライトリクエスト対応）
 */
function doOptions(e) {
  const response = ContentService.createTextOutput('');
  return addCorsHeaders(response);
}

/**
 * GETリクエストハンドラー
 * 提出済み旅費書一覧を取得
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getSubmitted') {
      // スプレッドシートを開く
      const spreadsheet = SpreadsheetApp.openById("1x37-WMX5C5kmcjr4u8gMzwIoaeT3MJL2lQY-Xf57UBo");
      const sheets = spreadsheet.getSheets();
      
      const submittedExpenses = [];
      
      // 各シートをチェック
      sheets.forEach((sheet) => {
        const sheetName = sheet.getName();
        
        // シート名が「日付_目的地_出張旅費書」のパターンかチェック
        // または「日付_目的地」のパターンかチェック
        if (sheetName.includes('_出張旅費書') || sheetName.match(/^\d{4}\/\d{2}\/\d{2}_/)) {
          try {
            // シートの基本情報を読み取る
            const basicBlock = sheet.getRange(1, 1, 2, 2).getValues();
            const destination = basicBlock[0][1] || '';
            const purpose = basicBlock[1][1] || '';
            
            const daysBlock = sheet.getRange(4, 1, 2, 4).getValues();
            const departureDate = daysBlock[0][1] || '';
            const returnDate = daysBlock[1][1] || '';
            
            // シート名からドキュメント名を推測（「シート名_出張旅費書」）
            const docName = sheetName.includes('_出張旅費書') ? sheetName : `${sheetName}_出張旅費書`;
            
            // ドキュメントを検索（名前で検索）
            const files = DriveApp.getFilesByName(docName);
            let documentId = null;
            let documentUrl = null;
            
            if (files.hasNext()) {
              const file = files.next();
              documentId = file.getId();
              
              // ドキュメントが共有設定されているか確認し、共有設定を追加
              try {
                file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
              } catch (shareError) {
                console.error('共有設定エラー:', shareError);
              }
              
              documentUrl = `https://docs.google.com/document/d/${documentId}/preview`;
            }
            
            submittedExpenses.push({
              sheetName: sheetName,
              documentId: documentId,
              documentUrl: documentUrl,
              destination: destination,
              purpose: purpose,
              departureDate: departureDate,
              returnDate: returnDate,
              createdAt: sheet.getRange(1, 1).getValue() || new Date().toISOString()
            });
          } catch (sheetError) {
            console.error(`シート ${sheetName} の処理エラー:`, sheetError);
            // エラーが発生したシートはスキップ
          }
        }
      });
      
      // 作成日時でソート（新しい順）
      submittedExpenses.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      const response = ContentService.createTextOutput(
        JSON.stringify({
          status: "success",
          data: submittedExpenses
        })
      ).setMimeType(ContentService.MimeType.JSON);
      
      // CORSヘッダーを追加
      return addCorsHeaders(response);
    }
    
    const response = ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: "不明なアクション"
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
    // CORSヘッダーを追加
    return addCorsHeaders(response);
    
  } catch (err) {
    console.error("エラー:", err);
    const response = ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: err.toString(),
        stack: err.stack
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
    // CORSヘッダーを追加
    return addCorsHeaders(response);
  }
}

// 注意: これ以降の関数(formatDate, createSheetLayout等)は
// gas/main.jsの残りの部分を参照してください
