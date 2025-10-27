// 宿泊区分
export const LODGING_CATEGORIES = {
    weekday: '平日',
    holiday: '休日'
} as const;

export const LODGING_CATEGORY_LIST = Object.values(LODGING_CATEGORIES);

// 公共交通機関の選択肢
export const PUBLIC_TRANSPORT_METHODS = [
    '電車',
    'バス',
    '飛行機',
] as const;

// 車利用の選択肢
export const CAR_USAGE_METHODS = [
    'レンタカー',
    '自家用車'
] as const;

// その他交通手段の選択肢
export const OTHER_TRANSPORT_METHODS = [
    'タクシー',
    'バス',
    '電車',
    '飛行機',
    '船',
    'その他'
] as const;

// 日当区分の選択肢
export const DAILY_ALLOWANCE_CATEGORIES = [
    '国内出張',
    '海外出張',
    '特別出張',
    '研修出張',
    'その他'
] as const;