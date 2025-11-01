/**
 * 交通費明細の各項目を合計し、各行のL列（12列目）に書き込む
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} sheetName - シート名
 * @param {number} transportDetailHeaderRow - 交通費明細のヘッダー行番号
 * @param {number} transportDetailsLastDataRow - 交通費明細の最終データ行番号
 * @throws {Error} シートが見つからない場合にエラーをスロー
 */
function transportDetailsCalculateAndWrite(spreadsheetId, sheetName, transportDetailHeaderRow, transportDetailsLastDataRow) {
    let ss = SpreadsheetApp.openById(spreadsheetId);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        throw new Error('シートが見つかりません: ' + sheetName);
    }
    // データ行を取得（ヘッダーの次行からtransportDetailsLastDataRowまで）
    let transportDetailValues = sheet.getRange(transportDetailHeaderRow + 1, 1, transportDetailsLastDataRow - transportDetailHeaderRow, 11).getValues();

    // 列インデックス（配列は0始まり、スプレッドシートの列番号-1）
    let colFare = 4;      // E列（運賃）= 配列の5番目 = インデックス4
    let colRental = 5;    // F列（レンタカー代）
    let colDistance = 6;   // G列　（移動距離）
    let colTolls = 7;     // H列（高速料金）
    let colGasoline = 8;  // I列（ガソリン代）
    let colParking = 9;   // J列（駐車場代）
    let colOther = 10;    // K列（その他選択時の合計金額）

    function toNum(v) {
        let n = Number(v);
        return isFinite(n) && !isNaN(n) ? n : 0;
    }

    // 各行の合計を計算して、各行の12列目（L列）に書き込む
    let totalRowHeaderIndex = transportDetailHeaderRow + 1; // データ開始行
    let transportTotal = 0; // 交通費明細の合計

    transportDetailValues.forEach(function (row) {
        let transportFareTotals = toNum(row[colFare]) +
            toNum(row[colRental]) +
            toNum(row[colDistance] * 1000) +
            toNum(row[colTolls]) +
            toNum(row[colGasoline]) +
            toNum(row[colParking]) +
            toNum(row[colOther]);

        // 各行の12列目（L列）に合計を書き込み
        sheet.getRange(totalRowHeaderIndex, 12).setValue(transportFareTotals);
        totalRowHeaderIndex++;
        transportTotal += transportFareTotals; // 合計を累積
    });

    return transportTotal; // 交通費明細の合計を返す
}


/**
 * 日当区分と宿泊区分に基づいて合計を計算し、指定セルに書き込む
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} sheetName - シート名
 * @param {Object} data - フォームデータ（travelDays, lodgingDaysを含む）
 * @param {number} dailyAllowanceRow - 日当行の行番号
 * @param {number} lodgingRow - 宿泊行の行番号
 * @param {number} dailyAllowanceHeaderRow - 日当合計ヘッダーを書き込む行番号
 * @param {number} dailyAllowanceTotalCol - 合計を書き込む列番号（日当・宿泊両方に適用、デフォルト: 12 = L列）
 */
function calculateDailyAllowanceAndLodgingTotals(
    spreadsheetId,
    sheetName,
    data,
    dailyAllowanceRow,
    lodgingRow,
    dailyAllowanceHeaderRow,
    dailyAllowanceTotalCol
) {
    let ss = SpreadsheetApp.openById(spreadsheetId);
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        throw new Error('シートが見つかりません: ' + sheetName);
    }

    const dailyAllowanceColumn = dailyAllowanceTotalCol || 12; // デフォルトはL列（日当・宿泊両方に使用）

    // カテゴリー別の金額マッピング（デフォルト値、必要に応じて上書き可能）
    const defaultRates = {
        dailyAllowance: {
            "平日 日帰り 近地": 2500,
            "平日 日帰り 遠地": 3500,
            "休日 日帰り 近地": 3750,
            "休日 日帰り 遠地": 5250,
            "平日 宿泊 (戻りが22:00までの場合)": 4000,
            "休日 宿泊 (戻りが22:00までの場合)": 6000,
            "平日 深夜 (22:00~以降になる場合)": 8000,
            "休日 深夜 (22:00~以降になる場合)": 12000
        },
        lodging: {
            "平日": 8000,
            "休日": 12000
        }
    };

    function getCategoryAmount(category, type) {
        if (!category || category === "") return 0;
        const rates = type === "dailyAllowance"
            ? defaultRates.dailyAllowance
            : defaultRates.lodging;
        return rates[category] || 0;
    }

    // 日当の合計を計算
    let dailyAllowanceTotal = 0;
    if (dailyAllowanceRow && dailyAllowanceRow > 0 && data.travelDays > 0) {
        // B列以降の日当区分を取得
        const dailyRange = sheet.getRange(dailyAllowanceRow, 2, 1, data.travelDays); // B列から10列分
        const dailyValues = dailyRange.getValues()[0];

        let dailyCount = 0;
        dailyValues.forEach(function (category) {
            if (category && category !== "") {
                const amount = getCategoryAmount(category, "dailyAllowance");
                dailyAllowanceTotal += amount;
                dailyCount++;
            }
        });

        // 合計を書き込み（例: "4000×2" の形式または単純な数値）
        if (dailyCount > 0) {
            const totalValue = dailyAllowanceTotal; // または `${dailyTotal/dailyCount}×${dailyCount}` のような形式も可能

            // 合計見出しをヘッダー行に書き込み
            sheet.getRange(dailyAllowanceHeaderRow, dailyAllowanceColumn).setValue("合計");
            sheet.getRange(dailyAllowanceHeaderRow, dailyAllowanceColumn).setFontWeight("bold");
            sheet.getRange(dailyAllowanceHeaderRow, dailyAllowanceColumn).setBackground("#E8F0FE");

            // 合計値を書き込み
            sheet.getRange(dailyAllowanceRow, dailyAllowanceColumn).setValue(totalValue);

            // 枠線を設定（見出しと値の2行に枠線）
            sheet.getRange(dailyAllowanceHeaderRow, dailyAllowanceColumn, 1, 1).setBorder(true, true, true, true, true, true);
            sheet.getRange(dailyAllowanceRow, dailyAllowanceColumn, 1, 1).setBorder(true, true, true, true, true, true);
        }
    }

    // 宿泊の合計を計算
    let lodgingTotal = 0;
    if (lodgingRow && lodgingRow > 0 && data.lodgingDays > 0) {
        // B列以降の宿泊区分を取得
        const lodgingRange = sheet.getRange(lodgingRow, 2, 1, data.lodgingDays); // B列から10列分
        const lodgingValues = lodgingRange.getValues()[0];

        let lodgingCount = 0;
        lodgingValues.forEach(function (category) {
            if (category && category !== "") {
                const amount = getCategoryAmount(category, "lodging");
                lodgingTotal += amount;
                lodgingCount++;
            }
        });

        // 合計を書き込み
        if (lodgingCount > 0) {
            // 合計値を書き込み（日当の合計と同じ列に配置）
            sheet.getRange(lodgingRow, dailyAllowanceColumn).setValue(lodgingTotal);

            // 枠線を設定
            sheet.getRange(lodgingRow, dailyAllowanceColumn, 1, 1).setBorder(true, true, true, true, true, true);
        }
    }

    return {
        dailyTotal: dailyAllowanceTotal,
        lodgingTotal: lodgingTotal
    };
}
