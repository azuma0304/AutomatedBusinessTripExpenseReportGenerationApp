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
    createSheetLayout(sheet, data);
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: "success", 
        message: "データが正常に保存されました",
        sheetName: sheetName
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error("エラー:", err);
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: "error", 
        message: err.toString(),
        stack: err.stack
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// 日付フォーマット関数
function formatDate(dateString) {
  if (!dateString) return "";
  
  // Dateオブジェクトの場合
  if (dateString instanceof Date) {
    const year = dateString.getFullYear();
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const day = String(dateString.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  
  // 文字列の場合
  if (typeof dateString === 'string') {
    // ISO形式(YYYY-MM-DD)やその他のハイフン区切りをスラッシュに変換
    return dateString.split('T')[0].replace(/-/g, '/');
  }
  
  // 数値（タイムスタンプ）の場合
  if (typeof dateString === 'number') {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
  
  // その他の場合は文字列に変換してから処理
  try {
    return String(dateString).split('T')[0].replace(/-/g, '/');
  } catch (e) {
    return "";
  }
}

// シートレイアウトを作成する関数
function createSheetLayout(sheet, data) {
  // 出張日数と宿泊日数を自動計算
  const travelDays = calculateTravelDays(data);
  const lodgingDays = calculateLodgingDays(data);
  
  // 基本情報セクション（上部）
  const basicInfo = [
    ["出張先", data.destination || ""],
    ["出張目的", data.purpose || ""],
    ["出発日", formatDate(data.departureDate) || ""],
    ["帰着日", formatDate(data.returnDate) || ""],
    ["出張日数", travelDays],
    ["宿泊日数", lodgingDays]
  ];
  
  // A1からB6に基本情報を設定
  sheet.getRange(1, 1, basicInfo.length, 2).setValues(basicInfo);
  
  // 基本情報セクションの書式設定
  sheet.getRange(1, 1, basicInfo.length, 1).setFontWeight("bold").setBackground("#E8F0FE");
  sheet.getRange(1, 1, basicInfo.length, 2).setBorder(true, true, true, true, true, true);
  
  // 交通費明細セクション（下部）
  const headerRow = 8; // ヘッダーは8行目から
  const headers = [
    "日付",
    "交通手段", 
    "発地",
    "着地",
    "金額",
    "高速料金（自家用車・レンタカー利用）",
    "ガソリン（自家用車・レンタカー利用）",
    "駐車場代（自家用車・レンタカー利用）",
    "距離（自家用車車利用）"
  ];
  
  sheet.getRange(headerRow, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(headerRow, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#E8F0FE")
    .setBorder(true, true, true, true, true, true);
  
  // 明細データを収集
  let detailRows = [];
  
  // 公共交通機関のデータを追加
  if (data.publicTransportDetails && data.publicTransportDetails.length > 0) {
    data.publicTransportDetails.forEach(detail => {
      detailRows.push([
        formatDate(detail.date) || "",
        detail.transportMethod || "",
        detail.departure || "",
        detail.arrival || "",
        detail.oneWayFare ? `${detail.oneWayFare}円` : "",
        "", // 高速料金
        "", // ガソリン
        "", // 駐車場代
        "" // 距離
      ]);
    });
  }
  
  // 車両利用のデータを追加
  if (data.carUsageDetails && data.carUsageDetails.length > 0) {
    data.carUsageDetails.forEach(detail => {
      const tollsTotal = detail.tolls ? detail.tolls.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0;
      const gasolineTotal = detail.gasoline ? detail.gasoline.reduce((sum, g) => sum + (parseFloat(g.amount) || 0), 0) : 0;
      const parkingTotal = detail.parking ? detail.parking.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0;
      
      detailRows.push([
        formatDate(detail.date) || "",
        detail.transportMethod || "",
        detail.departure || "",
        detail.arrival || "",
        detail.rentalFee ? `${detail.rentalFee}円` : "",
        tollsTotal > 0 ? `${tollsTotal}円` : "",
        gasolineTotal > 0 ? `${gasolineTotal}円` : "",
        parkingTotal > 0 ? `${parkingTotal}円` : "",
        detail.distance ? `${detail.distance}km` : ""
      ]);
    });
  }
  
  // その他交通手段のデータを追加
  if (data.otherTransportDetails && data.otherTransportDetails.length > 0) {
    data.otherTransportDetails.forEach(detail => {
      detailRows.push([
        formatDate(detail.date) || "",
        detail.transportMethod || "",
        detail.departure || "",
        detail.arrival || "",
        detail.totalAmount ? `${detail.totalAmount}円` : "",
        "", // 高速料金
        "", // ガソリン
        "", // 駐車場代
        "" // 距離
      ]);
    });
  }
  
  // 明細データをシートに追加
  if (detailRows.length > 0) {
    const dataStartRow = headerRow + 1;
    sheet.getRange(dataStartRow, 1, detailRows.length, headers.length).setValues(detailRows);
    sheet.getRange(dataStartRow, 1, detailRows.length, headers.length)
      .setBorder(true, true, true, true, true, true);
  }
  
  // 日当・宿泊・領収書セクション（交通費明細の下）
  const allowanceStartRow = headerRow + detailRows.length + 3; // 2行空けて配置
  const allowanceHeaders = ["日当区分", "宿泊区分", "領収書"];
  
  sheet.getRange(allowanceStartRow, 1, 1, allowanceHeaders.length).setValues([allowanceHeaders]);
  sheet.getRange(allowanceStartRow, 1, 1, allowanceHeaders.length)
    .setFontWeight("bold")
    .setBackground("#E8F0FE")
    .setBorder(true, true, true, true, true, true);
  
  // 日当・宿泊・領収書のデータを追加
  let allowanceRows = [];
  
  // 日当区分のデータ（出張日数分）
  for (let i = 0; i < travelDays; i++) {
    const dailyAllowanceDetail = data.dailyAllowanceDetails && data.dailyAllowanceDetails[i] 
      ? data.dailyAllowanceDetails[i] 
      : null;
    
    allowanceRows.push([
      dailyAllowanceDetail ? dailyAllowanceDetail.dailyAllowanceCategory : "",
      "", // 宿泊区分
      "" // 領収書
    ]);
  }
  
  // 宿泊区分のデータ（宿泊日数分）
  for (let i = 0; i < lodgingDays; i++) {
    const lodgingDetail = data.lodgingDetails && data.lodgingDetails[i] 
      ? data.lodgingDetails[i] 
      : null;
    
    // 日当区分が既に存在する場合は宿泊区分のみ更新、なければ新しい行を追加
    if (i < allowanceRows.length) {
      allowanceRows[i][1] = lodgingDetail ? lodgingDetail.lodgingCategory : "";
    } else {
      allowanceRows.push([
        "", // 日当区分
        lodgingDetail ? lodgingDetail.lodgingCategory : "",
        "" // 領収書
      ]);
    }
  }
  
  // 領収書のデータ
  if (data.receipts && data.receipts.length > 0) {
    data.receipts.forEach((receipt, index) => {
      if (index < allowanceRows.length) {
        allowanceRows[index][2] = receipt;
      } else {
        allowanceRows.push([
          "", // 日当区分
          "", // 宿泊区分
          receipt
        ]);
      }
    });
  }
  
  // 日当・宿泊・領収書のデータをシートに追加
  if (allowanceRows.length > 0) {
    const allowanceDataStartRow = allowanceStartRow + 1;
    sheet.getRange(allowanceDataStartRow, 1, allowanceRows.length, allowanceHeaders.length).setValues(allowanceRows);
    sheet.getRange(allowanceDataStartRow, 1, allowanceRows.length, allowanceHeaders.length)
      .setBorder(true, true, true, true, true, true);
  }
  
  // 列幅を調整
  sheet.setColumnWidth(1, 120); // 日付
  sheet.setColumnWidth(2, 100); // 交通手段
  sheet.setColumnWidth(3, 100); // 発地
  sheet.setColumnWidth(4, 100); // 着地
  sheet.setColumnWidth(5, 100); // 金額
  sheet.setColumnWidth(6, 250); // 高速料金
  sheet.setColumnWidth(7, 250); // ガソリン
  sheet.setColumnWidth(8, 250); // 駐車場代
  sheet.setColumnWidth(9, 150); // 距離
}

// 出張日数を計算する関数
function calculateTravelDays(data) {
  if (!data.departureDate || !data.returnDate) {
    return 0;
  }

  try {
    const departureDate = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);

    // 日付の差を計算（ミリ秒単位）
    const timeDiff = returnDate.getTime() - departureDate.getTime();

    // ミリ秒を日に変換（1日 = 24 * 60 * 60 * 1000 ミリ秒）
    const daysDiff = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

    // 1日プラスして返す（例: 1泊2日は2日間の出張とする）
    return Math.max(1, daysDiff + 1);
  } catch (error) {
    console.error('出張日数計算エラー:', error);
    return 0;
  }
}

// 宿泊日数を計算する関数
function calculateLodgingDays(data) {
  if (!data.departureDate || !data.returnDate) {
    return 0;
  }
  
  try {
    const departureDate = new Date(data.departureDate);
    const returnDate = new Date(data.returnDate);
    
    // 日付の差を計算（ミリ秒単位）
    const timeDiff = returnDate.getTime() - departureDate.getTime();
    
    // ミリ秒を日に変換（1日 = 24 * 60 * 60 * 1000 ミリ秒）
    const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    
    // 宿泊日数は出張日数-1（出発日と帰着日は宿泊しない）
    return Math.max(0, daysDiff);
  } catch (error) {
    console.error('宿泊日数計算エラー:', error);
    return 0;
  }
}
