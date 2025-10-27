/**
 * 出張旅費書API
 * Google Apps Script (GAS) との通信を行うAPI関数群
 */

import { TravelExpenseFormData } from '../../schemas/user-schema';
import { API_CONFIG } from './config';

// GAS Web AppのエンドポイントURL
const GAS_ENDPOINT_URL = API_CONFIG.GAS_ENDPOINT;

/**
 * API レスポンスの型定義
 */
export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  data?: any;
}

/**
 * 出張旅費書データをGASに送信するためのデータ型
 */
export interface TravelExpenseSubmitData {
  destination: string;
  purpose: string;
  departureDate: string;
  returnDate: string;
  travelDays: number;
  lodgingDays: number;
  publicTransportDetails: any[];
  carUsageDetails: any[];
  otherTransportDetails: any[];
  dailyAllowanceDetails: any[];
  lodgingDetails: any[];
  receipts: any[];
  submittedAt: string;
}

/**
 * 出張旅費書を送信する
 * @param formData - フォームデータ
 * @returns API レスポンス
 */
export const submitTravelExpense = async (
  formData: TravelExpenseFormData
): Promise<ApiResponse> => {
  try {
    // GASに送信するデータオブジェクトを作成
    const dataToSend: TravelExpenseSubmitData = {
      destination: formData.destination,
      purpose: formData.purpose,
      departureDate: formData.departureDate,
      returnDate: formData.returnDate,
      travelDays: formData.travelDays || 0,
      lodgingDays: formData.lodgingDays || 0,
      publicTransportDetails: formData.publicTransportDetails || [],
      carUsageDetails: formData.carUsageDetails || [],
      otherTransportDetails: formData.otherTransportDetails || [],
      dailyAllowanceDetails: formData.dailyAllowanceDetails || [],
      lodgingDetails: formData.lodgingDetails || [],
      receipts: formData.receipts || [],
      submittedAt: new Date().toISOString(),
    };

    // デバッグ用ログ
    console.log('GASに送信するデータ:', JSON.stringify(dataToSend, null, 2));

    // GAS Web AppにPOSTリクエストを送信
    const response = await fetch(GAS_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    // レスポンスをJSON形式でパース
    const result: ApiResponse = await response.json();

    // レスポンスログ
    console.log('GASからのレスポンス:', result);

    return result;
  } catch (error: any) {
    console.error('API通信エラー:', error);
    
    return {
      status: 'error',
      message: error.message || '通信エラーが発生しました',
    };
  }
};

/**
 * 下書きを保存する（将来的な実装用）
 * @param formData - フォームデータ
 * @returns API レスポンス
 */
export const saveDraft = async (
  formData: TravelExpenseFormData
): Promise<ApiResponse> => {
  try {
    const dataToSend = {
      ...formData,
      isDraft: true,
      savedAt: new Date().toISOString(),
    };

    console.log('下書きとして保存するデータ:', JSON.stringify(dataToSend, null, 2));

    // TODO: 下書き保存用のエンドポイントを実装
    // 現在は同じエンドポイントを使用
    const response = await fetch(GAS_ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    const result: ApiResponse = await response.json();
    console.log('下書き保存レスポンス:', result);

    return result;
  } catch (error: any) {
    console.error('下書き保存エラー:', error);
    
    return {
      status: 'error',
      message: error.message || '下書き保存に失敗しました',
    };
  }
};

/**
 * 下書き一覧を取得する（将来的な実装用）
 * @returns 下書き一覧
 */
export const fetchDrafts = async (): Promise<ApiResponse> => {
  try {
    // TODO: GET リクエスト用のエンドポイントを実装
    const response = await fetch(`${GAS_ENDPOINT_URL}?action=getDrafts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse = await response.json();
    console.log('下書き一覧取得レスポンス:', result);

    return result;
  } catch (error: any) {
    console.error('下書き一覧取得エラー:', error);
    
    return {
      status: 'error',
      message: error.message || '下書き一覧の取得に失敗しました',
    };
  }
};

/**
 * 提出済み旅費書一覧を取得する（将来的な実装用）
 * @returns 提出済み旅費書一覧
 */
export const fetchSubmittedExpenses = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${GAS_ENDPOINT_URL}?action=getSubmitted`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse = await response.json();
    console.log('提出済み一覧取得レスポンス:', result);

    return result;
  } catch (error: any) {
    console.error('提出済み一覧取得エラー:', error);
    
    return {
      status: 'error',
      message: error.message || '提出済み一覧の取得に失敗しました',
    };
  }
};

