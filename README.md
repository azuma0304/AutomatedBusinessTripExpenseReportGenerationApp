# 自動出張旅費精算書生成アプリ

本アプリケーションは、従業員がスマートフォンから出張旅費精算を簡易かつ正確に行えるようにするためのツールです。  
入力された情報はバリデーションを通じて確認されたうえで、Google Apps Script（GAS）を通じてGoogleスプレッドシートに自動保存されます。
次にGASを通じてGoogleDocsのテンプレートから出張旅費書を自動生成し、ユーザーがプレビューから確認できるようになります。

---

## 📌 使用技術スタック

- **Expo（React Native）**  
  クロスプラットフォームでのアプリケーション開発を目的とする。  
  ※FlutterではなくExpoを採用した理由：Dart未経験のため。ただし必要があれば検討可能。  

- **TypeScript**  
  型安全性の担保。  

- **Zod**  
  入力値バリデーションに利用。  

- **Google Apps Script（GAS）**  
  Googleスプレッドシートとの連携。API的な役割を果たす。  

---

## 📂 プロジェクト概要

- 従業員（10名程度）がサインインし、それぞれのユーザーごとにデータを入力。  
- 入力内容はZodでバリデーション後、GASに送信。  
- GASが受け取ったデータをスプレッドシートの対応セルに自動で貼り付ける。  
- 別途サーバーやデータベースは不要。スプレッドシートをデータストアとして利用。  

---

## 🖥️ 開発環境

- Node.js（推奨 LTS バージョン）  
- Expo CLI  
- TypeScript  
- ESLint / Prettier（コード整形・静的解析用）  

---

## 🚀 セットアップ手順

1. リポジトリをクローン
   ```bash
   git clone git@github.com:azuma0304/AutomatedBusinessTripExpenseReportGenerationApp.git
   
2. 依存関係をインストール
   ```
   npm install

4. Expo 開発サーバーを起動
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
