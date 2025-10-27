# Services

このディレクトリには、外部API通信やビジネスロジックを含むサービス層のコードが含まれています。

## 📁 ディレクトリ構造

```
services/
├── api/
│   ├── config.ts              # API設定（エンドポイントURL、タイムアウトなど）
│   ├── travelExpenseApi.ts    # 出張旅費書API通信ロジック
│   └── index.ts               # エクスポートファイル
└── README.md                  # このファイル
```

## 🔧 使用方法

### 1. 出張旅費書の送信

```typescript
import { submitTravelExpense } from '../../services/api';

const handleSubmit = async () => {
  try {
    const result = await submitTravelExpense(formData);
    
    if (result.status === 'success') {
      console.log('送信成功');
    } else {
      console.error('送信失敗:', result.message);
    }
  } catch (error) {
    console.error('通信エラー:', error);
  }
};
```

### 2. 下書きの保存（将来的な実装）

```typescript
import { saveDraft } from '../../services/api';

const handleSaveDraft = async () => {
  const result = await saveDraft(formData);
  // ...
};
```

### 3. API設定の変更

エンドポイントURLやタイムアウト設定を変更する場合は、`api/config.ts` を編集してください。

```typescript
// api/config.ts
export const API_CONFIG = {
  GAS_ENDPOINT: 'https://your-gas-endpoint-url',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};
```

## 📦 主要な関数

### `submitTravelExpense(formData: TravelExpenseFormData)`

出張旅費書データをGASに送信します。

**引数:**
- `formData`: フォームデータ（`TravelExpenseFormData`型）

**戻り値:**
- `Promise<ApiResponse>`: API レスポンス

**例:**
```typescript
const response = await submitTravelExpense({
  destination: '東京都立病院',
  purpose: 'サーバーエラーを修正する為',
  publicTransportDetails: [...],
  carUsageDetails: [...],
  otherTransportDetails: [...],
  dailyAllowanceDetails: [...],
  lodgingDetails: [...],
  receipts: [],
});
```

### `saveDraft(formData: TravelExpenseFormData)`

下書きとして保存します（将来的な実装用）。

### `fetchDrafts()`

下書き一覧を取得します（将来的な実装用）。

### `fetchSubmittedExpenses()`

提出済み旅費書一覧を取得します（将来的な実装用）。

## 🔍 デバッグ

API通信のログは自動的にコンソールに出力されます：

```
GASに送信するデータ: { ... }
GASからのレスポンス: { status: 'success' }
```

## 🚀 今後の拡張予定

- [ ] リトライ機能の実装
- [ ] タイムアウト処理の実装
- [ ] オフライン対応
- [ ] キャッシュ機能
- [ ] 認証機能
- [ ] エラーハンドリングの強化

