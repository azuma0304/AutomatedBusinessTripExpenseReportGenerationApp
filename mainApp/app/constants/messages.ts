// アラートメッセージ
export const ALERT_MESSAGES = {
  // エラーメッセージ
  ERROR: {
    NO_DRAFT_CONTENT: '下書きする内容がありません',
    DRAFT_NOT_FOUND: '編集する下書きが見つかりません',
    VALIDATION_FAILED: '入力内容に不備があります',
    SAVE_FAILED: '一時保存に失敗しました',
    UPDATE_FAILED: '下書きの更新に失敗しました',
    DELETE_FAILED: '下書きの削除に失敗しました',
    DUPLICATE_FAILED: '下書きの複製に失敗しました',
    LOAD_FAILED: '下書きの読み込みに失敗しました',
    CONNECTION_FAILED: 'サーバーに接続できませんでした',
  },
  
  // 成功メッセージ
  SUCCESS: {
    DRAFT_SAVED: '一時保存しました。',
    DRAFT_UPDATED: '下書きが更新されました。新規作成モードに戻りました。',
    DRAFT_DELETED: '下書きが削除されました',
    DRAFT_DUPLICATED: '下書きが複製されました',
    SUBMITTED: '旅費精算書が発行されました',
  },
  
  // 確認メッセージ
  CONFIRM: {
    DRAFT_SAVE: '一時保存しますか？',
    DRAFT_UPDATE: '下書きを更新しますか？',
    FINAL_CONFIRM: '入力内容を確認しますか？',
    SUBMIT_CONFIRM: '旅費精算書を発行しますか？',
    DELETE_CONFIRM: 'この下書きを削除しますか？',
    EDIT_CONFIRM: 'この下書きを修正しますか？',
    DUPLICATE_CONFIRM: 'この下書きを複製しますか？',
  },
} as const;

// ボタンテキスト
export const BUTTON_TEXTS = {
  DRAFT_SAVE: '一時保存',
  DRAFT_UPDATE: '下書き更新',
  FINAL_CONFIRM: '最終確認',
  SUBMIT: '送信',
  EDIT: '修正',
  DELETE: '下書きの削除',
  DUPLICATE: '複製',
  CANCEL: 'キャンセル',
  OK: 'OK',
} as const;

// プレースホルダーテキスト
export const PLACEHOLDER_TEXTS = {
  SELECT_PLEASE: '選択してください',
  INPUT_PLEASE: '入力してください',
  NO_INPUT: '未入力',
} as const;

// ラベルテキスト
export const LABEL_TEXTS = {
  DESTINATION: '出張先',
  PURPOSE: '出張の目的',
  DEPARTURE_DATE: '出発日',
  RETURN_DATE: '帰着日',
  TRANSPORT_METHOD: '交通手段',
  DEPARTURE: '出発地',
  ARRIVAL: '到着地',
  ONE_WAY_FARE: '片道の交通費',
  DAILY_ALLOWANCE_CATEGORY: '日当区分',
  LODGING_CATEGORY: '宿泊区分',
  CATEGORY: '区分',
} as const;
