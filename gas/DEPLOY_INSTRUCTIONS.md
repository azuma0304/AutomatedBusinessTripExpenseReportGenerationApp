# GAS デプロイ手順とトラブルシューティング

## CORSエラーが解決しない場合

デプロイを更新してもCORSエラーが出続ける場合、以下を試してください:

### 1. デプロイメントキャッシュのクリア

GASはデプロイメント後もキャッシュが残る場合があります。

#### 確認方法
ブラウザのコンソールで以下を実行:

```javascript
fetch('https://script.google.com/macros/s/AKfycbxfT71JyGw4CfTgbbCaimlXyoG2xpLBRLDbtX4DxkgkyemYAEONiFDR-gl3rxB2NQ/exec', {
  method: 'OPTIONS'
}).then(r => {
  console.log('Status:', r.status);
  r.headers.forEach((value, key) => console.log(`${key}: ${value}`));
});
```

**期待される結果**: `access-control-allow-origin: *` が表示される

**実際の結果**: CORSヘッダーが表示されない → キャッシュ問題

### 2. 解決方法

#### オプション1: 新しいデプロイメントを作成（推奨）

1. Apps Scriptエディタを開く
   - https://script.google.com/home/projects/1CHGT7o5yhQl5WwDTmH6Ov07WWa9gvYptoGiHNzni4KDGpKss73lYNtMX/edit

2. **デプロイ** → **新しいデプロイ**

3. 歯車アイコン（⚙️）→ **ウェブアプリ**

4. 設定:
   - 説明: `CORS対応版 - ${新しい日時}`
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**

5. **デプロイ**をクリック

6. 新しいURL（例: `https://script.google.com/macros/s/AKfycby...新しいID.../exec`）をコピー

7. `mainApp/services/api/config.ts`を更新:
   ```typescript
   export const API_CONFIG = {
     GAS_ENDPOINT: '新しいURL',
     // ...
   };
   ```

#### オプション2: 既存デプロイメントの完全な再作成

1. **デプロイ** → **デプロイを管理**

2. 既存のデプロイメントを**アーカイブ**（削除）

3. **新しいデプロイ**を作成（上記オプション1と同じ手順）

### 3. ブラウザキャッシュのクリア

- Ctrl + Shift + Delete（Windows/Linux）
- Cmd + Shift + Delete（Mac）
- **キャッシュされた画像とファイル**にチェック
- **全期間**を選択
- クリア

または、シークレットモード/プライベートブラウジングでテスト

### 4. 待機時間

GASのデプロイメント反映には **5-10分** かかる場合があります。
- デプロイ直後にテストしない
- 5分待ってから再度テスト

### 5. デバッグ情報の確認

ブラウザのNetwork タブで確認:
1. F12 を押して開発者ツールを開く
2. **Network** タブ
3. リクエストを送信
4. `exec` リクエストをクリック
5. **Headers** タブで `Response Headers` を確認
6. `Access-Control-Allow-Origin` があるか確認

### 6. GASログの確認

Apps Scriptエディタで:
1. **実行** → **実行ログ**
2. `doOptions` 関数が呼ばれているか確認
3. エラーがないか確認

## 現在のデプロイメント情報

- Script ID: `1CHGT7o5yhQl5WwDTmH6Ov07WWa9gvYptoGiHNzni4KDGpKss73lYNtMX`
- Deployment ID: `AKfycbxfT71JyGw4CfTgbbCaimlXyoG2xpLBRLDbtX4DxkgkyemYAEONiFDR-gl3rxB2NQ`
- Endpoint: `https://script.google.com/macros/s/AKfycbxfT71JyGw4CfTgbbCaimlXyoG2xpLBRLDbtX4DxkgkyemYAEONiFDR-gl3rxB2NQ/exec`

## CORS対応コードの確認

`main.js`に以下が含まれていることを確認:

```javascript
function addCorsHeaders(response) {
  return response
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

function doOptions(e) {
  const response = ContentService.createTextOutput('');
  return addCorsHeaders(response);
}
```

すべての `return ContentService.createTextOutput(...)` の後に `addCorsHeaders(response)` を呼んでいることを確認。

