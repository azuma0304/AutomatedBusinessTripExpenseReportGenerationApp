function createDocumentFromTemplate(templateDocId, spreadsheetId, sheetName, newDocName, saveFolderId) {
    // テンプレートドキュメントを開く
    const templateFile = DriveApp.getFileById(templateDocId);
    const newDocFile = templateFile.makeCopy(newDocName);
    
    // フォルダが指定されている場合は、そのフォルダに移動
    if (saveFolderId) {
        try {
            const folder = DriveApp.getFolderById(saveFolderId);
            DriveApp.getFileById(newDocFile.getId()).moveTo(folder);
        } catch (e) {
            console.error('フォルダへの移動に失敗しました:', e);
            // フォルダ移動に失敗しても処理は続行
        }
    }
    
    const newDoc = DocumentApp.openById(newDocFile.getId());
    const body = newDoc.getBody();

    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        throw new Error('旅費精算書作成用データシートが見つかりません');
    }

    // データマップを作成
    const dataMap = readSpreadsheetData(sheet);

    // 交通費テーブルを挿入（プレースホルダ置換の前に行う）
    insertTransportTable(body, dataMap.transportDetails);

    // 日当区分テーブルを挿入（プレースホルダ置換の前に行う）
    insertDailyAllowanceTable(body, dataMap.dailyAllowanceDetailsData);

    // 宿泊区分テーブルを挿入（プレースホルダー置換の前に行う）
    insertLodgingTable(body, dataMap.lodgingDetailsData);

    // プレースホルダを置換
    replacePlaceholders(body, dataMap);

    newDoc.saveAndClose();
    
    // ドキュメントを「リンクを知っている全員が閲覧可能」に設定
    const docFile = DriveApp.getFileById(newDocFile.getId());
    try {
        docFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
        console.error('ドキュメントの共有設定に失敗しました:', e);
        // 共有設定に失敗しても処理は続行
    }
    
    return newDoc.getId();
}

function readSpreadsheetData(sheet) {
    const dataMap = {};

    // 基本情報を読み取る
    const basicBlock = sheet.getRange(1, 1, 2, 2).getValues();
    dataMap['destination'] = basicBlock[0][1] || '';
    dataMap['purpose'] = basicBlock[1][1] || '';

    const daysBlock = sheet.getRange(4, 1, 2, 4).getValues();
    dataMap['departureDate'] = daysBlock[0][1] || '';
    dataMap['lodgingDays'] = daysBlock[0][2] || '';
    dataMap['returnDate'] = daysBlock[1][1] || '';
    dataMap['travelDays'] = daysBlock[1][2] || '';

    // 交通費諸々データを読み取る
    const transportDetailHeaderRow = 7;
    const headers = sheet.getRange(transportDetailHeaderRow, 1, 1, 12).getValues()[0];

    let dataStartRow = transportDetailHeaderRow + 1;
    const transportDetails = [];
    // 合計列（L列、12列目）に値がある行まで読み取る
    // または、いずれかの列に値がある行を読み取る
    while (dataStartRow <= sheet.getLastRow()) {
        // 合計列（12列目）をチェック
        const totalValue = sheet.getRange(dataStartRow, 12).getValue();

        // 合計列が空で、かつA列（日付）も空の場合、データ終了と判断
        if (!totalValue && sheet.getRange(dataStartRow, 1).getValue() === '') {
            // さらに下の行を確認して、本当に空行かチェック
            let isEmpty = true;
            for (let col = 1; col <= 12; col++) {
                if (sheet.getRange(dataStartRow, col).getValue() !== '') {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                break;
            }
        }

        // 合計列に値がある場合、または他の列に値がある場合は読み込む
        const rowData = sheet.getRange(dataStartRow, 1, 1, 12).getValues()[0];

        // 行に何らかのデータがあるかチェック
        const hasData = rowData.some(cell => cell !== '' && cell !== null);
        if (hasData) {
        transportDetails.push(rowData);
        } else {
            // 完全に空の行が見つかったら終了
            break;
        }

        dataStartRow++;
    }

    // 交通費詳細データをdataMapに保存（テーブル生成用）
    dataMap['transportDetails'] = transportDetails;

    // 日当・宿泊情報を読み取る
    const allowanceStartRow = transportDetailHeaderRow + transportDetails.length + 3;
    const dailyAllowanceRow = allowanceStartRow;
    const lodgingHeaderRow = allowanceStartRow + 1;

    // 日当データ
    const travelDays = parseInt(dataMap['travelDays']) || 0;
    const dailyAllowanceDetailsData = [];
    if (travelDays > 0) {
        const dailyRow = sheet.getRange(dailyAllowanceRow, 2, 1, travelDays).getValues()[0];
        dataMap['dailyAllowanceDetails'] = dailyRow.join('、') || '';

        // テーブル生成用に日当区分データを保存
        // 各区分の出現回数をカウントし、グループ化
        const categoryCountsForDaily = {};
        dailyRow.forEach(category => {
            if (category && category !== '') {
                categoryCountsForDaily[category] = (categoryCountsForDaily[category] || 0) + 1;
            }
        });

        // カテゴリー別の金額マッピング（calclate.jsと同じ）
        const defaultRates = {
            "平日 日帰り 近地": 2500,
            "平日 日帰り 遠地": 3500,
            "休日 日帰り 近地": 3750,
            "休日 日帰り 遠地": 5250,
            "平日 宿泊 (戻りが22:00までの場合)": 4000,
            "休日 宿泊 (戻りが22:00までの場合)": 6000,
            "平日 深夜 (22:00~以降になる場合)": 8000,
            "休日 深夜 (22:00~以降になる場合)": 12000
        };

        // グループ化したデータを配列に変換
        for (const [category, count] of Object.entries(categoryCountsForDaily)) {
            const unitPrice = defaultRates[category] || 0;
            const total = unitPrice * count;
            dailyAllowanceDetailsData.push({
                category: category,
                unitPrice: unitPrice,
                quantity: count,
                total: total
            });
        }
    }
    dataMap['dailyAllowanceDetailsData'] = dailyAllowanceDetailsData;

    // 宿泊データ
    const lodgingDays = parseInt(dataMap['lodgingDays']) || 0;
    const lodgingDetailsData = [];
    if (lodgingDays > 0) {
        const lodgingRow = sheet.getRange(lodgingHeaderRow, 2, 1, lodgingDays).getValues()[0];
        dataMap['lodgingDetails'] = lodgingRow.join('、') || '';
        const categoryCountsForLodging = {}
        lodgingRow.forEach(category => {
            if (category && category != '') {
                categoryCountsForLodging[category] = (categoryCountsForLodging[category] || 0) + 1;
            }
        });

        const defaultRates = {
            "平日": 8000,
            "休日": 12000
        }

        for (const [category, count] of Object.entries(categoryCountsForLodging)) {
            const unitPrice = defaultRates[category] || 0;
            const total = unitPrice * count;
            lodgingDetailsData.push({
                category: category,
                unitPrice: unitPrice,
                quantity: count,
                total: total
            });
        }
    }
    dataMap['lodgingDetailsData'] = lodgingDetailsData;


    // 合計値を読み取る
    const dailyAllowanceTotalCol = travelDays > 0 ? travelDays + 2 : 12;

    // 日当合計
    const dailyAllowanceTotal = sheet.getRange(dailyAllowanceRow, dailyAllowanceTotalCol).getValue();
    dataMap['dailyAllowanceTotal'] = dailyAllowanceTotal || 0;

    // 宿泊合計
    const lodgingTotal = sheet.getRange(lodgingHeaderRow, dailyAllowanceTotalCol).getValue();
    dataMap['lodgingTotal'] = lodgingTotal || 0;

    // 交通費合計（各明細行のL列の合計）
    let transportTotal = 0;
    transportDetails.forEach((_, index) => {
        const rowIndex = transportDetailHeaderRow + 1 + index;
        const rowTotal = sheet.getRange(rowIndex, 12).getValue();
        transportTotal += parseFloat(rowTotal) || 0;
    });
    dataMap['transportTotal'] = transportTotal;

    // 全合計
    const grandTotalRow = lodgingHeaderRow + 2;
    const grandTotal = sheet.getRange(grandTotalRow, 2).getValue();
    dataMap['grandTotal'] = grandTotal || 0;

    return dataMap;
}

function replacePlaceholders(body, dataMap) {
    for (const [key, value] of Object.entries(dataMap)) {
        // transportDetails、dailyAllowanceDetailsData、lodgingDetailsDataはテーブルとして別処理しているのでスキップ
        if (key === 'transportDetails' || key === 'dailyAllowanceDetailsData' || key === 'lodgingDetailsData') {
            continue;
        }

        const placeholder = `{{${key}}}`;
        let replacement = String(value || '');

        // 日付フィールドはformatDateForTableでフォーマット
        if (key === 'departureDate' || key === 'returnDate') {
            replacement = formatDateForTable(value);
        }

        // プレースホルダをすべて置換（複数回出現する可能性があるため、ループで処理）
        let maxIterations = 100; // 無限ループ防止
        let found = true;
        while (found && maxIterations > 0) {
            const searchResult = body.findText(placeholder);
            if (searchResult) {
                const element = searchResult.getElement();
                if (element.getType() === DocumentApp.ElementType.TEXT) {
                    const text = element.asText();
                    const startOffset = searchResult.getStartOffset();
                    const endOffset = searchResult.getEndOffsetInclusive();
                    text.deleteText(startOffset, endOffset);
                    text.insertText(startOffset, replacement);
                    maxIterations--;
                } else {
                    // テキスト要素でない場合は通常の置換を試行
        body.replaceText(placeholder, replacement);
                    found = false;
                }
            } else {
                found = false;
            }
        }
    }
}

/**
 * 交通費詳細テーブルを挿入する関数
 * テンプレート内の{{transportTable}}プレースホルダを探して、その位置にテーブルを挿入
 */
function insertTransportTable(body, transportDetails) {
    if (!transportDetails || transportDetails.length === 0) {
        // データがない場合は、プレースホルダだけ削除
        body.replaceText('{{transportTable}}', '');
        return;
    }

    // {{transportTable}}プレースホルダを検索
    const searchResult = body.findText('{{transportTable}}');

    if (!searchResult) {
        // プレースホルダが見つからない場合は何もしない
        return;
    }

    // プレースホルダが見つかった要素を取得
    const foundElement = searchResult.getElement();
    const parent = foundElement.getParent();
    const parentIndex = body.getChildIndex(parent);

    // プレースホルダを削除
    foundElement.removeFromParent();

    // ヘッダー行を準備
    const tableRows = [
        ['日付', '発地', '着地', '交通機関', '運賃（￥）', 'レンタカー代（￥）', '距離（㎞）', '高速料金（￥）', 'ガソリン代（￥）', '駐車場代（￥）', 'その他交通手段による合計金額（￥）', '合計（￥）']
    ];

    // データ行を準備
    let currentDate = '';

    // 空の値を斜線で表示するヘルパー関数
    const formatCellValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return '／';
        }
        const strValue = String(value).trim();
        return strValue === '' ? '／' : strValue;
    };

    // 数値セル用のフォーマット関数（空の場合は斜線）
    const formatNumberCell = (value) => {
        if (!value || value === '' || value === null || value === undefined) {
            return '／';
        }
        const num = parseFloat(value);
        if (isNaN(num)) {
            return '／';
        }
        return num.toLocaleString('ja-JP');
    };

    // 通貨セル用のフォーマット関数（空の場合は斜線）
    const formatCurrencyCell = (value) => {
        if (!value || value === '' || value === null || value === undefined) {
            return '／';
        }
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) {
            return '／';
        }
        return num.toLocaleString('ja-JP');
    };

    transportDetails.forEach((rowData, index) => {
        // スプレッドシートの列順: 日付(0), 交通手段(1), 発地(2), 着地(3), 運賃(4), レンタカー代(5), 
        // 距離(6), 高速料金(7), ガソリン(8), 駐車場代(9), 合計金額(その他)(10), 合計(11)

        const date = rowData[0] ? formatDateForTable(rowData[0]) : '';
        const transportMethod = rowData[1] || '';
        const departure = rowData[2] || '';
        const arrival = rowData[3] || '';
        const fare = rowData[4] || '';
        const rentalFee = rowData[5] || '';
        const distance = rowData[6] || '';
        const tolls = rowData[7] || '';
        const gasoline = rowData[8] || '';
        const parking = rowData[9] || '';
        const otherTotal = rowData[10] || '';
        const total = rowData[11] || '';

        // 日付は同じ日付の場合は空欄にする（最初の行のみ表示）
        let displayDate = '';
        if (date && date !== currentDate) {
            displayDate = date;
            currentDate = date;
        }

        // データ行を配列に追加（12列）
        tableRows.push([
            displayDate,                                // 日付
            formatCellValue(departure),                 // 発地
            formatCellValue(arrival),                   // 着地
            formatCellValue(transportMethod),          // 交通機関
            formatNumberCell(fare),                     // 運賃
            formatNumberCell(rentalFee),               // レンタカー代
            formatNumberCell(distance),                // 距離
            formatNumberCell(tolls),                    // 高速料金
            formatNumberCell(gasoline),                 // ガソリン代
            formatNumberCell(parking),                  // 駐車場代
            formatCurrencyCell(otherTotal),            // 合計金額（その他）
            formatCurrencyCell(total)                   // 合計
        ]);
    });

    // テーブルを一度に作成（ヘッダー + 全データ行）
    const table = body.insertTable(parentIndex, tableRows);

    // ヘッダー行のスタイル設定
    const headerRow = table.getRow(0);
    const numColumns = headerRow.getNumCells();
    for (let i = 0; i < numColumns; i++) {
        const cell = headerRow.getCell(i);
        // セル内のテキストを太字にする
        if (cell.getNumChildren() > 0) {
            try {
                const paragraph = cell.getChild(0);
                if (paragraph && paragraph.getType() === DocumentApp.ElementType.PARAGRAPH) {
                    paragraph.asParagraph().editAsText().setBold(true);
                }
            } catch (e) {
                // 段落がない場合は無視
            }
        }
        // 背景色を設定
        cell.setBackgroundColor('#E8F0FE');
    }

    // テーブルのスタイル設定
    table.setBorderWidth(1);

    // 列幅を縮小（全体的に小さくする）
    table.setColumnWidth(0, 53);   // 日付
    table.setColumnWidth(1, 40);  // 発地
    table.setColumnWidth(2, 40);  // 着地
    table.setColumnWidth(3, 50);  // 交通機関
    table.setColumnWidth(4, 40);  // 運賃（￥）
    table.setColumnWidth(5, 45);  // レンタカー代（￥）
    table.setColumnWidth(6, 40);  // 距離（㎞）
    table.setColumnWidth(7, 50);  // 高速料金（￥）
    table.setColumnWidth(8, 59);  // ガソリン代（￥）
    table.setColumnWidth(9, 50);  // 駐車場代（￥）
    table.setColumnWidth(10, 59); // その他交通手段による合計金額（￥）
    table.setColumnWidth(11, 38); // 合計（￥）

    // 全セルに対してテキストの折り返しとフォントサイズを設定
    const numRows = table.getNumRows();
    const numCols = table.getRow(0).getNumCells();

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            try {
                const cell = row.getCell(colIndex);

                // セル内のすべての段落に対して設定
                const numChildren = cell.getNumChildren();
                for (let i = 0; i < numChildren; i++) {
                    const element = cell.getChild(i);
                    if (element && element.getType() === DocumentApp.ElementType.PARAGRAPH) {
                        const paragraph = element.asParagraph();
                        const text = paragraph.editAsText();

                        // テキストの折り返し（WordWrapはGoogle Apps Scriptでは直接設定できないが、
                        // フォントサイズを小さくすることで収まりやすくする）
                        // ヘッダー行は少し大きく、データ行は小さめに
                        if (rowIndex === 0) {
                            text.setFontSize(9); // ヘッダー行
                        } else {
                            text.setFontSize(8); // データ行
                        }
                    }
                }
            } catch (e) {
                // スタイル設定エラーは無視
            }
        }
    }
}

/**
 * 日当区分テーブルを挿入する関数
 * テンプレート内の{{dailyAllowanceDetailsTable}}プレースホルダを探して、その位置にテーブルを挿入
 */
function insertDailyAllowanceTable(body, dailyAllowanceDetailsData) {
    if (!dailyAllowanceDetailsData || dailyAllowanceDetailsData.length === 0) {
        // データがない場合は、プレースホルダだけ削除
        body.replaceText('{{dailyAllowanceDetailsTable}}', '');
        return;
    }

    // {{dailyAllowanceDetailsTable}}プレースホルダを検索
    const searchResult = body.findText('{{dailyAllowanceDetailsTable}}');

    if (!searchResult) {
        // プレースホルダが見つからない場合は何もしない
        return;
    }

    // プレースホルダが見つかった要素を取得
    const foundElement = searchResult.getElement();
    const parent = foundElement.getParent();
    const parentIndex = body.getChildIndex(parent);

    // プレースホルダを削除
    foundElement.removeFromParent();

    // ヘッダー行を準備
    const tableRows = [
        ['日当区分', '単価（￥）']
    ];

    // データ行を準備
    dailyAllowanceDetailsData.forEach((item) => {
        tableRows.push([
            item.category || '／',                    // 区分
            item.unitPrice ? item.unitPrice.toLocaleString('ja-JP') : '／' // 単価
        ]);
    });

    // テーブルを一度に作成（ヘッダー + 全データ行）
    const table = body.insertTable(parentIndex, tableRows);

    // ヘッダー行のスタイル設定
    const headerRow = table.getRow(0);
    const numColumns = headerRow.getNumCells();
    for (let i = 0; i < numColumns; i++) {
        const cell = headerRow.getCell(i);
        // セル内のテキストを太字にする
        if (cell.getNumChildren() > 0) {
            try {
                const paragraph = cell.getChild(0);
                if (paragraph && paragraph.getType() === DocumentApp.ElementType.PARAGRAPH) {
                    paragraph.asParagraph().editAsText().setBold(true);
                }
            } catch (e) {
                // 段落がない場合は無視
            }
        }
        // 背景色を設定
        cell.setBackgroundColor('#E8F0FE');
    }

    // テーブルのスタイル設定
    table.setBorderWidth(1);

    // 列幅を設定
    table.setColumnWidth(0, 200); // 区分（長い文字列なので広めに）
    table.setColumnWidth(1, 70);  // 単価

    // 全セルに対してフォントサイズを設定
    const numRows = table.getNumRows();
    const numCols = table.getRow(0).getNumCells();

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            try {
                const cell = row.getCell(colIndex);

                // セル内のすべての段落に対して設定
                const numChildren = cell.getNumChildren();
                for (let i = 0; i < numChildren; i++) {
                    try {
                        const element = cell.getChild(i);
                        if (element && element.getType() === DocumentApp.ElementType.PARAGRAPH) {
                            const paragraph = element.asParagraph();
                            const text = paragraph.editAsText();

                            // ヘッダー行は少し大きく、データ行は小さめに
                            if (rowIndex === 0) {
                                text.setFontSize(11); // ヘッダー行
                            } else {
                                text.setFontSize(10); // データ行
                            }
                        }
                    } catch (e) {
                        // 子要素の取得エラーは無視
                    }
                }
            } catch (e) {
                // スタイル設定エラーは無視
            }
        }
    }
}

/**
 * 宿泊区分テーブルを挿入する関数
 * テンプレート内の{{lodgingDetailsTable}}プレースホルダを探して、その位置にテーブルを挿入
 */
function insertLodgingTable(body, lodgingDetailsData) {
    if (!lodgingDetailsData || lodgingDetailsData.length === 0) {
        // データがない場合は、プレースホルダーだけ削除
        body.replaceText('{{lodgingDetailsTable}}', '');
        return;
    }

    // {{lodgingDetailsTable}}プレースホルダーを検索
    const searchResult = body.findText('{{lodgingDetailsTable}}');

    if (!searchResult) {
        // プレースホルダーがない場合は何もしない
        return;
    }

    // プレースホルダーが見つかった要素を取得
    const foundElement = searchResult.getElement();
    const parent = foundElement.getParent();
    const parentIndex = body.getChildIndex(parent);

    // プレースホルダーを削除
    foundElement.removeFromParent();

    // ヘッダー行を準備
    const tableRows = [
        ['宿泊区分', '単価（￥）']
    ];

    // データ行を準備
    lodgingDetailsData.forEach((item) => {
        tableRows.push([
            item.category || '/', // 区分
            item.unitPrice ? item.unitPrice.toLocaleString('ja-JP') : '/' // 単価
        ]);
    });

    // テーブルを一度に作成(ヘッダー　＋　全データ行)
    const table = body.insertTable(parentIndex, tableRows);

    // ヘッダー行のスタイル設定
    const headerRow = table.getRow(0);
    const numColumns = headerRow.getNumCells();
    for (let i = 0; i < numColumns; i++) {
        const cell = headerRow.getCell(i);
        // セル内のテキストを太字にする
        if (cell.getNumChildren() > 0) {
            try {
                const paragraph = cell.getChild(0);
                if (paragraph && paragraph.getType() === DocumentApp.ElementType.PARAGRAPH) {
                    paragraph.asParagraph().editAsText().setBold(true);
                }
            } catch (e) {
                // 段落がない場合は無視
            }
        }
        // 背景色を設定
        cell.setBackgroundColor('#E8F0FE');
    }

    // テーブルのスタイル設定
    table.setBorderWidth(1);

    // 列幅を設定
    table.setColumnWidth(0, 200); // 宿泊区分
    table.setColumnWidth(1, 70); // 単価

    // 全セルに対してフォントサイズを設定
    const numRows = table.getNumRows();
    const numCols = table.getRow(0).getNumCells();

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const row = table.getRow(rowIndex);
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            try {
                const cell = row.getCell(colIndex);

                // セル内の全ての段落に対して設定
                const numChildren = cell.getNumChildren();
                for (let i = 0; i < numChildren; i++) {
                    try {
                        const element = cell.getChild(i);
                        if (element && element.getType() === DocumentApp.ElementType.PARAGRAPH) {
                            const paragraph = element.asParagraph();
                            const text = paragraph.editAsText();

                            // ヘッダー行は少し大きく、データ行は小さめに
                            if (rowIndex === 0) {
                                text.setFontSize(11); // ヘッダー行
                            } else {
                                text.setFontSize(10); // データ行
                            }
                        }
                    } catch (e) {
                        // 子要素の取得エラーは無視
                    }
                }

            } catch (e) {
                // スタイル設定エラーは無視
            }
        }
    }
}

/**
 * テーブル用の日付フォーマット関数
 */
function formatDateForTable(dateValue) {
    if (!dateValue) return '';

    if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const dayOfWeek = days[dateValue.getDay()];
        return `${year}/${month}/${day}(${dayOfWeek})`;
    }

    if (typeof dateValue === 'string') {
        // スラッシュ区切りの日付をそのまま返す（既にフォーマット済みの場合）
        if (dateValue.includes('/')) {
            return dateValue;
        }
        // ISO形式やその他の形式を変換
        try {
            const date = new Date(dateValue);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const days = ['日', '月', '火', '水', '木', '金', '土'];
            const dayOfWeek = days[date.getDay()];
            return `${year}/${month}/${day}(${dayOfWeek})`;
        } catch (e) {
            return dateValue;
        }
    }

    return String(dateValue);
}