# 自動出張旅費精算書生成アプリ

本アプリケーションは、従業員がスマートフォンから出張旅費精算を簡易かつ正確に行えるようにするためのツールです。  
入力された情報はバリデーションを通じて確認されたうえで、Google Apps Script（GAS）を通じてGoogleスプレッドシートに自動保存されます。
次にGASを通じてGoogleDocsのテンプレートから出張旅費書を自動生成し、ユーザーがプレビューから確認できるようになります。

---

## 📂 プロジェクト概要

- 従業員（10名程度）がサインインし、それぞれのユーザーごとにデータを入力。  
- 入力内容はZodでバリデーション後、GASに送信。  
- GASが受け取ったデータをスプレッドシートの対応セルに自動で貼り付ける。  
- 別途サーバーやデータベースは不要。スプレッドシートをデータストアとして利用。  

---

## 📌 使用技術スタック

- **Expo（React Native）**  
  クロスプラットフォームでのアプリケーション開発を目的とする。  
  ※FlutterではなくExpoを採用した理由：Dart未経験のため。ただし必要があれば検討可能。  

- **TypeScript**  
  型安全性の担保。  

- **Zod**  
  入力値バリデーションに利用。  

- **Google Apps Script（GAS）+ clasp**  
  - Googleスプレッドシートとの連携。API的な役割を果たす。
  - claspを利用してローカル環境からGASコードをpush/deploy可能。  

---

## 🖥️ 開発環境

- Node.js（推奨 LTS バージョン）  
- Expo CLI  
- TypeScript  
- ESLint / Prettier（コード整形・静的解析用）
- clasp（Google Apps Script CLI ツール）  

---

## 📁 開発アーキテクチャ（Atomic Design 採用）

```
app/
├── (tabs)/
│   ├── page1.tsx        # ページ1 
|   ├── page2.tsx        # ページ2
|  
├── components/
│   ├── atoms/           # 最小単位UIパーツ
│   ├── molecules/       # 複数のAtomsを組み合わせた部品 
|   ├── organisms/       # 複数のMoleculesを組み合わせたまとまり
|   └── templates/       # ページレイアウトなどの大きな構造

```

## 🚀 セットアップ手順

1. リポジトリをクローン
   ```bash
   SSHリンク
   git clone git@github.com:azuma0304/AutomatedBusinessTripExpenseReportGenerationApp.git
   
   HTTPSリンク
   git clone https://github.com/azuma0304/AutomatedBusinessTripExpenseReportGenerationApp.git
   
2. 依存関係をインストール
   ```
   npm i --legacy-peer-deps  (GAS側とExpoアプリ側（mainApp）の2つ)

3. Expo 開発サーバーを起動
   ```
   npx expo start

4．表示されたQRコードをExpo Goアプリ（iOS / Android）で読み込むことで、実機で動作確認が可能。

---

## 📑 関連ドキュメント

[企画書（Google Docs）](https://docs.google.com/document/d/1SfcVXkAAZXS8XmAUIMAWHcLUuq8DjSiJcCrzxWgZTp0/edit?usp=sharing)

[UI設計（Figma）](https://www.figma.com/design/juNveyTYyMKgLROU3JMSZB/%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3?node-id=2-3&t=cDmN1uTzmbwCu36K-0)

---

## 📌 今後の検討事項(まだ考え切れていないこと)

サインイン機能の実装（ユーザーごとのデータ分離）

GAS 側のエラーハンドリング強化

スプレッドシート構成の最適化

将来的にデータベースが必要となる場合の拡張性検討

GPTに交通費を検索させるアイデア（仮）

---

## 開発者用

依存関係のインストール（2回必要）

1．Expoアプリ側（mainApp）

```
cd mainApp
npm i --legacy-peer-deps 
```

2. GAS側（gas）

```
cd ..
cd gas
npm install
```

GAS開発フロー

```
npx clasp push                    # ローカルの変更をGASへ反映
npx clasp deploy -i <デプロイID>   # デプロイ
```

※開発中は push → deploy で十分です。
※本番用は以下のフロー推奨：
```
npx clasp push
npx clasp version "fix: xxx"
npx clasp deploy -i <デプロイID>
(デプロイID : AKfycbxi0RHca13prrTTnCozK9HgCBHpI-A5wLcjaOKRucC-ZU84DOLEKvxeLJ8ULXpxP89N)
```
---

## 開発者向けオプション機能

1. フォーマットの確認と整形

```
npm run lint      # 確認だけ
npm run lint:fix  # 自動修正
```

2. EASに変更をアップデート
```
eas update --branch main --message "bugfix"  
```

アプリケーションQR

<img width="201" height="188" alt="{996EB3B6-5931-4A0E-AF31-FFCD812F21A9}" src="https://github.com/user-attachments/assets/1920605e-9388-4573-82e7-f893ab76bc46" />


