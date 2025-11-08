# 緊急修正: GAS CORS エラー

## 現在の問題
`TypeError: response.setHeader is not a function（行 91）`

## 原因
ローカルの修正がApps Scriptに反映されていない

## 解決手順（確実な方法）

### ステップ1: 完全に新しいデプロイメントを作成

1. Apps Scriptエディタを開く
   https://script.google.com/home/projects/1CHGT7o5yhQl5WwDTmH6Ov07WWa9gvYptoGiHNzni4KDGpKss73lYNtMX/edit

2. 左側の`main`ファイルを開く

3. 91行目付近の`addCorsHeaders`関数を以下に置き換え:

```javascript
function addCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Max-Age', '86400');
  return response;
}
```

4. **保存** (Ctrl+S)

5. **デプロイ** → **新しいデプロイ**

6. ⚙️アイコン → **ウェブアプリ**を選択

7. 設定:
   - 説明: `CORS修正版 final`
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**

8. **デプロイ**をクリック

9. 新しいURLをコピー（例: `https://script.google.com/macros/s/AKfycby新しいID/exec`）

### ステップ2: フロントエンドのURLを更新

`mainApp/services/api/config.ts`の12行目を新しいURLに変更:

```typescript
GAS_ENDPOINT: 'https://script.google.com/macros/s/新しいID/exec',
```

### ステップ3: アプリを再起動

1. 開発サーバーを停止（Ctrl+C）
2. 再起動: `npm start` または `npx expo start`
3. キャッシュをクリア: `r`キーを押す

---

## 代替案: clasp でプッシュ

claspがインストールされている場合:

```bash
cd gas
clasp push
clasp deploy --deploymentId AKfycbxfT71JyGw4CfTgbbCaimlXyoG2xpLBRLDbtX4DxkgkyemYAEONiFDR-gl3rxB2NQ --description "CORS fix"
```

---

## 確認方法

ブラウザのコンソールで実行:

```javascript
fetch('新しいURL', {
  method: 'OPTIONS'
}).then(r => {
  console.log('Status:', r.status);
  r.headers.forEach((v, k) => console.log(k + ':', v));
});
```

`access-control-allow-origin: *`が表示されればOK。

