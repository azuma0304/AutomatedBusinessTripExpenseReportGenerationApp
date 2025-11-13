GAS フォルダ構成 (出張旅費書 自動生成)

- コード.js
  - 受信したフォームデータをスプレッドシートへ整形出力するメインのエンドポイント (doPost)
  - シートのレイアウト/書式設定もここで実施

- sheets.js
  - スプレッドシート操作の共通ユーティリティ関数（シート取得、値の読み書き など）

- calculations.js
  - スプレッドシート内の表から合計/小計などを計算するロジックを集約
  - 例: calculateTransportTotals(spreadsheetId, sheetName, headerRow)
  - 例: countDailyAndLodging(spreadsheetId, sheetName, dailyHeaderRow, lodgingHeaderRow)

- docs.js
  - 集計結果を Google ドキュメントへ自動出力するロジックを集約
  - 例: generateReportDocFromSheet(spreadsheetId, sheetName, docId, headerRow)

今後の実装ガイド

1. スプレッドシート内データで計算
   - calculations.js の関数を拡張/追加し、必要な集計(運賃合計、車両費合計、総合計など)を返す
   - 既存の コード.js から必要に応じて呼び出し可能

2. Google Docs へ自動書き込み
   - docs.js の generateReportDocFromSheet を呼び出し
   - Sheet → 集計 → Docs への表/段落出力を一括で実行

メモ: Apps Script では同一プロジェクト内の .js ファイルはグローバル空間で読み込まれます。import は不要です。




