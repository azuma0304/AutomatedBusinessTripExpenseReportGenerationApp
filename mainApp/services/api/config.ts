/**
 * API設定ファイル
 * エンドポイントURLやタイムアウト設定などを管理
 */

/**
 * Google Apps Script (GAS) Web AppのエンドポイントURL
 * 本番環境と開発環境で切り替える場合はここを変更
 */
export const API_CONFIG = {
  // GAS Web App URL
  GAS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbxi0RHca13prrTTnCozK9HgCBHpI-A5wLcjaOKRucC-ZU84DOLEKvxeLJ8ULXpxP89N/exec',
  
  // タイムアウト設定（ミリ秒）
  TIMEOUT: 30000, // 30秒
  
  // リトライ設定
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒
};

/**
 * 環境変数から設定を読み込む（将来的な拡張用）
 */
export const getApiConfig = () => {
  // TODO: 環境変数を使用する場合はここで読み込む
  // 例: process.env.REACT_APP_GAS_ENDPOINT
  
  return API_CONFIG;
};

