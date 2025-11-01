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
function createSheetLayout(sheet, data, spreadsheetId) {
  // formDataから出張日数と宿泊日数を取得
  const travelDays = data.travelDays || 0;
  const lodgingDays = data.lodgingDays || 0;

  // 基本情報（上部）：出張先/出張目的 を A1:B2 に配置
  const basicTop = [
    ["出張先", data.destination || ""],
    ["出張目的", data.purpose || ""],
  ];
  sheet.getRange(1, 1, basicTop.length, 2).setValues(basicTop);
  sheet.getRange(1, 1, basicTop.length, 1).setFontWeight("bold");
  sheet.getRange(1, 1, basicTop.length, 1).setBackground("#E8F0FE");
  sheet.getRange(1, 1, basicTop.length, 2).setBorder(true, true, true, true, true, true);

  // 空行を1行あける（A3:B3）

  // 出張日ブロック（画像フォーマット）を A4:D5 に配置
  const daysBlock = [
    ["出張日（自）", formatDate(data.departureDate) || "", lodgingDays, "泊"],
    ["帰着日（至）", formatDate(data.returnDate) || "", travelDays, "日"],
  ];
  sheet.getRange(4, 1, daysBlock.length, 4).setValues(daysBlock);
  // 書式：1列目と4列目を太字、全体に枠線、4列目の単位は画像準拠でそのまま値を表示
  sheet.getRange(4, 1, daysBlock.length, 1).setFontWeight("bold");
  sheet.getRange(4, 1, daysBlock.length, 1).setBackground("#E8F0FE");
  sheet.getRange(4, 4, daysBlock.length, 1).setFontWeight("bold");
  sheet.getRange(4, 4, daysBlock.length, 1).setBackground("#E8F0FE");
  sheet.getRange(4, 1, daysBlock.length, 4).setBorder(true, true, true, true, true, true);

  // 交通費明細セクション（下部）
  const transportDetailHeaderRow = 7; // ヘッダーは8行目から
  const headers = [
    "日付",
    "交通手段",
    "発地",
    "着地",
    "運賃",
    "レンタカー代（レンタカー利用）",
    "距離（自家用車車利用）",
    "高速料金（自家用車・レンタカー利用）",
    "ガソリン（自家用車・レンタカー利用）",
    "駐車場代（自家用車・レンタカー利用）",
    "合計金額（その他交通手段利用時）",
    "合計"
  ];

  sheet.getRange(transportDetailHeaderRow, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(transportDetailHeaderRow, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#E8F0FE")
    .setBorder(true, true, true, true, true, true);

  // 明細データを収集
  let transportDetails = [];

  // 公共交通機関のデータを追加（列: 日付, 交通手段, 発地, 着地, 運賃, レンタカー代, 距離, 高速, ガソリン, 駐車場, 合計金額(その他)）
  if (data.publicTransportDetails && data.publicTransportDetails.length > 0) {
    data.publicTransportDetails.forEach(detail => {
      transportDetails.push([
        formatDate(detail.date) || "",
        detail.transportMethod || "",
        detail.departure || "",
        detail.arrival || "",
        detail.oneWayFare ? Number(detail.oneWayFare) : "", // 運賃
        "", // レンタカー代
        "", // 距離
        "", // 高速
        "", // ガソリン
        "", // 駐車場
        "", // 合計金額(その他)
        ""  // 合計（計算処理で埋められる）
      ]);
    });
  }

  // 車両利用のデータを追加（列: 日付, 交通手段, 発地, 着地, 運賃, レンタカー代, 距離, 高速, ガソリン, 駐車場, 合計金額(その他)）
  if (data.carUsageDetails && data.carUsageDetails.length > 0) {
    data.carUsageDetails.forEach(detail => {
      const rentalFee = parseFloat(detail.rentalFee || 0) || 0;
      const tollsTotal = detail.tolls ? detail.tolls.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0;
      const gasolineTotal = detail.gasoline ? detail.gasoline.reduce((sum, g) => sum + (parseFloat(g.amount) || 0), 0) : 0;
      const parkingTotal = detail.parking ? detail.parking.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0;

      transportDetails.push([
        formatDate(detail.date) || "",
        detail.transportMethod || "",
        detail.departure || "",
        detail.arrival || "",
        "", // 運賃
        rentalFee > 0 ? rentalFee : "",
        detail.distance ? Number(detail.distance) : "",
        tollsTotal > 0 ? tollsTotal : "",
        gasolineTotal > 0 ? gasolineTotal : "",
        parkingTotal > 0 ? parkingTotal : "",
        "", // 合計金額(その他)
        ""  // 合計（計算処理で埋められる）
      ]);
    });
  }

  // その他交通手段のデータを追加（列: 日付, 交通手段, 発地, 着地, 運賃, レンタカー代, 距離, 高速, ガソリン, 駐車場, 合計金額(その他)）
  if (data.otherTransportDetails && data.otherTransportDetails.length > 0) {
    data.otherTransportDetails.forEach(detail => {
      transportDetails.push([
        formatDate(detail.date) || "",
        detail.transportMethod || "",
        detail.departure || "",
        detail.arrival || "",
        "", // 運賃
        "", // レンタカー代
        "", // 距離
        "", // 高速
        "", // ガソリン
        "", // 駐車場
        detail.totalAmount ? Number(detail.totalAmount) : "", // 合計金額(その他)
        ""  // 合計（計算処理で埋められる）
      ]);
    });
  }

  // 明細データをシートに追加
  let transportTotal = 0; // 交通費明細の合計を保持する変数
  if (transportDetails.length > 0) {
    const dataStartRow = transportDetailHeaderRow + 1;
    sheet.getRange(dataStartRow, 1, transportDetails.length, headers.length).setValues(transportDetails);
    sheet.getRange(dataStartRow, 1, transportDetails.length, headers.length)
      .setBorder(true, true, true, true, true, true);

    // 計算処理を実行（日当区分・宿泊区分を書き込む前）
    const transportDetailsLastDataRow = dataStartRow + transportDetails.length - 1; // 明細データの最終行（日当区分の前）
    
    // 交通手段ごとに使用した交通料金諸々の合計計算と書き込み
    transportTotal = transportDetailsCalculateAndWrite(
      spreadsheetId,
      sheet.getName(),
      transportDetailHeaderRow,
      transportDetailsLastDataRow // 明細データの最終行を指定
    );
  }

  // 日当・宿泊セクション（交通費明細の下）: 1列に縦積み
  const allowanceStartRow = transportDetailHeaderRow + transportDetails.length + 3; // 3行空けて配置
  
  // 日当・宿泊用のヘッダー行を作成（合計列用）
  const allowanceHeaderRow = allowanceStartRow - 1;

  // 日当 見出し（1列）
  sheet.getRange(allowanceStartRow, 1, 1, 1).setValues([["日当"]]);
  sheet.getRange(allowanceStartRow, 1).setFontWeight("bold");
  sheet.getRange(allowanceStartRow, 1).setBackground("#E8F0FE");

  // 日当データ（見出しと同じ行の右隣から横1行に並べる）
  if (travelDays > 0) {
    const dailyRow = [];
    for (let i = 0; i < travelDays; i++) {
      const v = (data.dailyAllowanceDetails && data.dailyAllowanceDetails[i])
        ? data.dailyAllowanceDetails[i].dailyAllowanceCategory
        : "";
      dailyRow.push(v); // 横並びで1行
    }
    // B列から右に配置
    sheet.getRange(allowanceStartRow, 2, 1, dailyRow.length).setValues([dailyRow]);
    // 見出しセルとデータ全体に枠線
    sheet.getRange(allowanceStartRow, 1, 1, 1 + dailyRow.length).setBorder(true, true, true, true, true, true);
    // 見やすさのため、日当ブロックのデータ6セル分の列幅を広げる（B〜G）
    sheet.setColumnWidths(2, 6, 140);
  }

  // 宿泊 見出し（空行1行あけて配置、1列）
  const lodgingHeaderRow = allowanceStartRow + 1;
  sheet.getRange(lodgingHeaderRow, 1, 1, 1).setValues([["宿泊"]]);
  sheet.getRange(lodgingHeaderRow, 1).setFontWeight("bold");
  sheet.getRange(lodgingHeaderRow, 1).setBackground("#E8F0FE");

  // 宿泊データ（見出しと同じ行の右隣から横1行に並べる）
  if (lodgingDays > 0) {
    const lodgRow = [];
    for (let i = 0; i < lodgingDays; i++) {
      const v = (data.lodgingDetails && data.lodgingDetails[i])
        ? data.lodgingDetails[i].lodgingCategory
        : "";
      lodgRow.push(v); // 横並びで1行
    }
    // B列から右に配置
    sheet.getRange(lodgingHeaderRow, 2, 1, lodgRow.length).setValues([lodgRow]);
    // 見出しセルとデータ全体に枠線
    sheet.getRange(lodgingHeaderRow, 1, 1, 1 + lodgRow.length).setBorder(true, true, true, true, true, true);
  }

  // 日当・宿泊の合計を計算して書き込み
  // 日当の合計: 見出し(A列) + データ列数(travelDays) + 1 = travelDays + 2列目
  // 宿泊の合計: 日当の合計と同じ列に配置
  const dailyAllowanceTotalCol = travelDays > 0 ? travelDays + 2 : 12; // デフォルトはL列
  
  const allowanceAndLodgingTotals = calculateDailyAllowanceAndLodgingTotals(
    spreadsheetId,
    sheet.getName(),
    data,
    allowanceStartRow,
    lodgingHeaderRow,
    allowanceHeaderRow,
    dailyAllowanceTotalCol
  );

  // 全合計を計算
  const grandTotal = transportTotal + allowanceAndLodgingTotals.dailyTotal + allowanceAndLodgingTotals.lodgingTotal;

  sheet.getRange(lodgingHeaderRow + 2, 1, 1, 1).setValues([["合計"]]);
  sheet.getRange(lodgingHeaderRow + 2, 1).setFontWeight("bold");
  sheet.getRange(lodgingHeaderRow + 2, 1).setBackground("#E8F0FE");

  sheet.getRange(lodgingHeaderRow + 2, 2, 1, 1).setValue(grandTotal);
  sheet.getRange(lodgingHeaderRow + 2, 1, 1, 2).setBorder(true, true, true, true, true, true);

  // 列幅を調整
  sheet.setColumnWidth(1, 200); // 日付
  sheet.setColumnWidth(2, 200); // 交通手段
  sheet.setColumnWidth(3, 200); // 発地
  sheet.setColumnWidth(4, 200); // 着地
  sheet.setColumnWidth(5, 200); // 金額
  // F7〜K7（列F〜K）の横幅を広げる
  sheet.setColumnWidth(6, 250); // F: 運賃/レンタカー等
  sheet.setColumnWidth(7, 250); // G
  sheet.setColumnWidth(8, 250); // H
  sheet.setColumnWidth(9, 250); // I
  sheet.setColumnWidth(10, 250); // J
  sheet.setColumnWidth(11, 250); // K
  sheet.setColumnWidth(12, 100); // L（合計列）
}
