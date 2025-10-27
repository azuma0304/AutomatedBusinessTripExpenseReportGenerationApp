// AsyncStorageのキー
export const STORAGE_KEYS = {
  DRAFTS: 'drafts',
} as const;

// API関連の定数
export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30秒
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1秒
} as const;

// 日付フォーマット
export const DATE_FORMATS = {
  DISPLAY: 'YYYY/MM/DD',
  ISO: 'YYYY-MM-DD',
} as const;

// バリデーションエラーメッセージ
export const VALIDATION_MESSAGES = {
  REQUIRED: {
    DESTINATION: '※出張先を入力してください',
    PURPOSE: '※出張の目的を入力してください',
    DEPARTURE_DATE: '※出発日を選択してください',
    RETURN_DATE: '※帰着日を選択してください',
    DATE: '※日付を選択してください',
    TRANSPORT_METHOD: '※交通手段を選択してください',
    DEPARTURE: '※出発地を入力してください',
    ARRIVAL: '※到着地を入力してください',
    ONE_WAY_FARE: '※片道の交通費を入力してください',
    DAILY_ALLOWANCE_CATEGORY: '※日当区分を選択してください',
    LODGING_CATEGORY: '※宿泊区分を選択してください',
    AMOUNT: '※金額を入力してください',
  },
  INVALID: {
    AMOUNT: '※有効な金額を入力してください',
  },
} as const;
