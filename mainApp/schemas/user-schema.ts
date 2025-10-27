import { z } from 'zod';

// 出張先入力欄スキーマ
export const DestinationSchema = z.string().min(1, '※出張先を入力してください');

// 出張目的入力欄スキーマ
export const PurposeSchema = z.string().min(1, '※出張の目的を入力してください');

// 出発日入力欄スキーマ
export const DepartureDateSchema = z.string().min(1, '※出発日を選択してください');

// 帰着日入力欄スキーマ
export const ReturnDateSchema = z.string().min(1, '※帰着日を選択してください');

// 公共交通機関の詳細スキーマ
export const PublicTransportDetailSchema = z.object({
  date: z.string().min(1, '※日付を選択してください'),
  transportMethod: z.string().min(1, '※交通手段を選択してください'),
  departure: z.string().min(1, '※出発地を入力してください'),
  arrival: z.string().min(1, '※到着地を入力してください'),
  oneWayFare: z.string()
    .min(1, '※片道の交通費を入力してください')
    .refine(
      (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
      '※有効な金額を入力してください'
    ),
});

// 車両利用の詳細スキーマ
export const CarUsageDetailSchema = z.object({
  date: z.string().min(1, '※日付を選択してください'),
  transportMethod: z.string().min(1, '※交通手段を選択してください'),
  departure: z.string().min(1, '※出発地を入力してください'),
  arrival: z.string().min(1, '※到着地を入力してください'),
  distance: z.string().optional(),
  rentalFee: z.string().optional(),
  tolls: z.array(z.object({
    id: z.string(),
    amount: z.string()
      .min(1, '※金額を入力してください')
      .refine(
        (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
        '※有効な金額を入力してください'
      ),
  })).optional(),
  gasoline: z.array(z.object({
    id: z.string(),
    amount: z.string()
      .min(1, '※金額を入力してください')
      .refine(
        (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
        '※有効な金額を入力してください'
      ),
  })).optional(),
  parking: z.array(z.object({
    id: z.string(),
    amount: z.string()
      .min(1, '※金額を入力してください')
      .refine(
        (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
        '※有効な金額を入力してください'
      ),
  })).optional(),
}).superRefine((data, ctx) => {
  // 自家用車の場合、distanceは必須
  if (data.transportMethod === '自家用車') {
    if (!data.distance || data.distance.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '※移動距離を入力してください',
        path: ['distance'],
      });
    } else if (isNaN(Number(data.distance)) || Number(data.distance) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '※有効な距離を入力してください',
        path: ['distance'],
      });
    }
  }
  
  // レンタカーの場合、rentalFeeは必須
  if (data.transportMethod === 'レンタカー') {
    if (!data.rentalFee || data.rentalFee.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '※レンタカー代を入力してください',
        path: ['rentalFee'],
      });
    } else if (isNaN(Number(data.rentalFee)) || Number(data.rentalFee) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '※有効な金額を入力してください',
        path: ['rentalFee'],
      });
    }
  }
});

// その他交通手段の詳細スキーマ
export const OtherTransportDetailSchema = z.object({
  date: z.string().min(1, '※日付を選択してください'),
  transportMethod: z.string().min(1, '※交通手段を選択してください'),
  departure: z.string().min(1, '※出発地を入力してください'),
  arrival: z.string().min(1, '※到着地を入力してください'),
  totalAmount: z.string()
    .min(1, '※合計金額を入力してください')
    .refine(
      (val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0),
      '※有効な金額を入力してください'
    ),
});

// 日当区分の詳細スキーマ
export const DailyAllowanceDetailSchema = z.object({
  dailyAllowanceCategory: z.string().min(1, '※日当区分を選択してください'),
});

// 宿泊の詳細スキーマ
export const LodgingDetailSchema = z.object({
  lodgingCategory: z.string().min(1, '※宿泊区分を選択してください'),
});

// メインの出張旅費書スキーマ
export const TravelExpenseFormSchema = z.object({
  destination: DestinationSchema,
  purpose: PurposeSchema,
  departureDate: DepartureDateSchema,
  returnDate: ReturnDateSchema,
  publicTransportDetails: z.array(PublicTransportDetailSchema).optional(),
  carUsageDetails: z.array(CarUsageDetailSchema).optional(),
  otherTransportDetails: z.array(OtherTransportDetailSchema).optional(),
  dailyAllowanceDetails: z.array(DailyAllowanceDetailSchema).optional(),
  lodgingDetails: z.array(LodgingDetailSchema).optional(),
  receipts: z.array(z.string()).optional(),
});

// 型のエクスポート
export type TravelExpenseFormData = z.infer<typeof TravelExpenseFormSchema>;
export type PublicTransportDetailData = z.infer<typeof PublicTransportDetailSchema>;
export type CarUsageDetailData = z.infer<typeof CarUsageDetailSchema>;
export type OtherTransportDetailData = z.infer<typeof OtherTransportDetailSchema>;
export type DailyAllowanceDetailData = z.infer<typeof DailyAllowanceDetailSchema>;
export type LodgingDetailData = z.infer<typeof LodgingDetailSchema>;