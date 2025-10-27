import { useState, useEffect, useCallback } from 'react';
import { TravelExpenseFormData } from '../schemas/user-schema';

/**
 * フォーム管理カスタムフック
 * 
 * 出張旅費書のフォームデータ管理を担当するカスタムフックです。
 * フォームの状態管理、バリデーション、動的な項目の追加・削除などの機能を提供します。
 * 
 * @returns {Object} フォーム管理に必要な状態と関数
 * @returns {TravelExpenseFormData} formData - フォームデータ
 * @returns {Function} setFormData - フォームデータ更新関数
 * @returns {Object} errors - バリデーションエラー
 * @returns {Function} setErrors - エラー更新関数
 * @returns {Object} detailErrors - 詳細項目のエラー
 * @returns {Function} setDetailErrors - 詳細エラー更新関数
 * @returns {number[]} publicTransportEntryIds - 公共交通機関エントリID配列
 * @returns {number[]} carUsageEntryIds - 車利用エントリID配列
 * @returns {number[]} otherTransportEntryIds - その他交通手段エントリID配列
 * @returns {number[]} dailyAllowanceEntryIds - 日当エントリID配列
 * @returns {number[]} lodgingEntryIds - 宿泊エントリID配列
 * @returns {any[]} publicTransportDetails - 公共交通機関詳細データ
 * @returns {any[]} carUsageDetails - 車利用詳細データ
 * @returns {any[]} otherTransportDetails - その他交通手段詳細データ
 * @returns {any[]} dailyAllowanceDetails - 日当詳細データ
 * @returns {any[]} lodgingDetails - 宿泊詳細データ
 * @returns {Function} resetForm - フォームリセット関数
 * @returns {Function} initializeFormData - フォームデータ初期化関数
 * @returns {Function} updateDailyAllowanceAndLodgingItems - 日当・宿泊項目自動生成関数
 * @returns {Function} handleAddPublicTransportItem - 公共交通機関項目追加関数
 * @returns {Function} handleAddCarUsageItem - 車利用項目追加関数
 * @returns {Function} handleAddOtherTransportItem - その他交通手段項目追加関数
 * @returns {Function} handleAddDailyAllowanceItem - 日当項目追加関数
 * @returns {Function} handleAddLodgingItem - 宿泊項目追加関数
 * @returns {Function} removePublicTransportItem - 公共交通機関項目削除関数
 * @returns {Function} removeCarUsageItem - 車利用項目削除関数
 * @returns {Function} removeOtherTransportItem - その他交通手段項目削除関数
 * @returns {Function} removeDailyAllowanceItem - 日当項目削除関数
 * @returns {Function} removeLodgingItem - 宿泊項目削除関数
 * @returns {Function} handlePublicTransportChange - 公共交通機関変更ハンドラー
 * @returns {Function} handleCarUsageChange - 車利用変更ハンドラー
 * @returns {Function} handleOtherTransportChange - その他交通手段変更ハンドラー
 * @returns {Function} handleDailyAllowanceChange - 日当変更ハンドラー
 * @returns {Function} handleLodgingChange - 宿泊変更ハンドラー
 * 
 * @example
 * ```typescript
 * const {
 *   formData,
 *   setFormData,
 *   errors,
 *   resetForm,
 *   handleAddPublicTransportItem,
 *   removePublicTransportItem
 * } = useFormManagement();
 * 
 * // フォームデータの更新
 * setFormData({ ...formData, destination: '東京' });
 * 
 * // 項目の追加
 * handleAddPublicTransportItem();
 * 
 * // 項目の削除
 * removePublicTransportItem(0);
 * 
 * // フォームのリセット
 * resetForm();
 * ```
 * 
 * @features
 * - フォームデータの状態管理
 * - バリデーションエラーの管理
 * - 動的な項目の追加・削除
 * - 日当・宿泊項目の自動生成
 * - 詳細データの更新ハンドリング
 * - フォームの初期化とリセット
 * 
 * @dependencies
 * - React (useState, useEffect)
 * - TravelExpenseFormData (型定義)
 */

export const useFormManagement = () => {
  // メインフォームデータの状態管理
  const [formData, setFormData] = useState<TravelExpenseFormData>({
    destination: '',
    purpose: '',
    departureDate: '',
    returnDate: '',
    publicTransportDetails: [],
    carUsageDetails: [],
    otherTransportDetails: [],
    dailyAllowanceDetails: [],
    lodgingDetails: [],
    receipts: [],
  });

  // バリデーションエラーの状態管理
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [detailErrors, setDetailErrors] = useState<{ [key: string]: { [key: string]: string } }>({});

  // エントリIDの状態管理（動的項目の管理用）
  const [publicTransportEntryIds, setPublicTransportEntryIds] = useState<number[]>([]);
  const [carUsageEntryIds, setCarUsageEntryIds] = useState<number[]>([]);
  const [otherTransportEntryIds, setOtherTransportEntryIds] = useState<number[]>([]);
  const [dailyAllowanceEntryIds, setDailyAllowanceEntryIds] = useState<number[]>([]);
  const [lodgingEntryIds, setLodgingEntryIds] = useState<number[]>([]);

  // 詳細データの状態管理（各項目の具体的なデータ）
  const [publicTransportDetails, setPublicTransportDetails] = useState<any[]>([]);
  const [carUsageDetails, setCarUsageDetails] = useState<any[]>([]);
  const [otherTransportDetails, setOtherTransportDetails] = useState<any[]>([]);
  const [dailyAllowanceDetails, setDailyAllowanceDetails] = useState<any[]>([]);
  const [lodgingDetails, setLodgingDetails] = useState<any[]>([]);

  /**
   * フォームリセット関数
   * 
   * すべてのフォームデータと状態を初期値にリセットします。
   * 下書き保存後や送信完了後に使用されます。
   * 
   * @process
   * 1. メインフォームデータを初期値にリセット
   * 2. すべてのエントリID配列を空配列にリセット
   * 3. すべての詳細データ配列を空配列にリセット
   */
  const resetForm = () => {
    setFormData({
      destination: '',
      purpose: '',
      departureDate: '',
      returnDate: '',
      publicTransportDetails: [],
      carUsageDetails: [],
      otherTransportDetails: [],
      dailyAllowanceDetails: [],
      lodgingDetails: [],
      receipts: [],
    });

    setPublicTransportEntryIds([]);
    setCarUsageEntryIds([]);
    setOtherTransportEntryIds([]);
    setDailyAllowanceEntryIds([]);
    setLodgingEntryIds([]);

    setPublicTransportDetails([]);
    setCarUsageDetails([]);
    setOtherTransportDetails([]);
    setDailyAllowanceDetails([]);
    setLodgingDetails([]);
  };

  /**
   * フォームデータの初期化関数
   * 
   * 下書きデータでフォームを初期化します。
   * 下書き編集時に使用されます。
   * 
   * @param {TravelExpenseFormData} draftData - 初期化する下書きデータ
   */
  const initializeFormData = useCallback((draftData: TravelExpenseFormData) => {
    setFormData(draftData);
    
    // 詳細データの配列を初期化
    if (draftData.publicTransportDetails !== undefined) {
      setPublicTransportEntryIds(draftData.publicTransportDetails.map((_, i) => i));
      setPublicTransportDetails(draftData.publicTransportDetails);
    }
    
    if (draftData.carUsageDetails !== undefined) {
      setCarUsageEntryIds(draftData.carUsageDetails.map((_, i) => i));
      setCarUsageDetails(draftData.carUsageDetails);
    }
    
    if (draftData.otherTransportDetails !== undefined) {
      setOtherTransportEntryIds(draftData.otherTransportDetails.map((_, i) => i));
      setOtherTransportDetails(draftData.otherTransportDetails);
    }
    
    if (draftData.dailyAllowanceDetails !== undefined) {
      setDailyAllowanceEntryIds(draftData.dailyAllowanceDetails.map((_, i) => i));
      setDailyAllowanceDetails(draftData.dailyAllowanceDetails);
    }
    
    if (draftData.lodgingDetails !== undefined) {
      setLodgingEntryIds(draftData.lodgingDetails.map((_, i) => i));
      setLodgingDetails(draftData.lodgingDetails);
    }
  }, []);

  /**
   * 日当と宿泊の項目を自動生成する関数
   * 
   * 出発日と帰着日から出張日数と宿泊日数を計算し、
   * それに応じて日当と宿泊の項目を自動生成します。
   * 
   * @param {string} departureDate - 出発日 (YYYY/MM/DD形式)
   * @param {string} returnDate - 帰着日 (YYYY/MM/DD形式)
   * 
   * @process
   * 1. 日付の妥当性チェック
   * 2. 出張日数の計算（帰着日 - 出発日）
   * 3. 宿泊日数の計算（出張日数 - 1）
   * 4. 日当項目を出張日数分生成
   * 5. 宿泊項目を宿泊日数分生成
   * 6. エントリID配列を更新
   * 7. フォームデータを更新
   */
  const updateDailyAllowanceAndLodgingItems = (departureDate: string, returnDate: string) => {
    if (!departureDate || !returnDate) return;
    
    try {
      const departure = new Date(departureDate);
      const returnDateObj = new Date(returnDate);
      
      const timeDiff = returnDateObj.getTime() - departure.getTime();
      const travelDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
      const lodgingDays = Math.max(0, travelDays - 1);
      
      const newDailyAllowanceDetails: any[] = [];
      for (let i = 0; i < travelDays; i++) {
        newDailyAllowanceDetails.push({
          dailyAllowanceCategory: ''
        });
      }
      
      const newLodgingDetails: any[] = [];
      for (let i = 0; i < lodgingDays; i++) {
        newLodgingDetails.push({
          lodgingCategory: ''
        });
      }
      
      setFormData(prev => ({
        ...prev,
        dailyAllowanceDetails: newDailyAllowanceDetails,
        lodgingDetails: newLodgingDetails
      }));
      
      setDailyAllowanceEntryIds(Array.from({ length: travelDays }, (_, i) => i));
      setLodgingEntryIds(Array.from({ length: lodgingDays }, (_, i) => i));
      
    } catch (error) {
      console.error('日当・宿泊項目の自動生成エラー:', error);
    }
  };

  /**
   * アイテム追加関数群
   * 
   * 各カテゴリの項目を動的に追加する関数群です。
   * 新しいエントリIDを生成し、対応する詳細データ配列に空のオブジェクトを追加します。
   */
  const handleAddPublicTransportItem = () => {
    const newIndex = publicTransportEntryIds.length;
    setPublicTransportEntryIds([...publicTransportEntryIds, newIndex]);
    setPublicTransportDetails([...publicTransportDetails, {}]);
  };

  const handleAddCarUsageItem = () => {
    const newIndex = carUsageEntryIds.length;
    setCarUsageEntryIds([...carUsageEntryIds, newIndex]);
    setCarUsageDetails([...carUsageDetails, {}]);
  };

  const handleAddOtherTransportItem = () => {
    const newIndex = otherTransportEntryIds.length;
    setOtherTransportEntryIds([...otherTransportEntryIds, newIndex]);
    setOtherTransportDetails([...otherTransportDetails, {}]);
  };

  const handleAddDailyAllowanceItem = () => {
    const newIndex = dailyAllowanceEntryIds.length;
    setDailyAllowanceEntryIds([...dailyAllowanceEntryIds, newIndex]);
    setDailyAllowanceDetails([...dailyAllowanceDetails, {}]);
  };

  const handleAddLodgingItem = () => {
    const newIndex = lodgingEntryIds.length;
    setLodgingEntryIds([...lodgingEntryIds, newIndex]);
    setLodgingDetails([...lodgingDetails, {}]);
  };

  /**
   * アイテム削除関数群
   * 
   * 各カテゴリの項目を動的に削除する関数群です。
   * 指定されたインデックスの項目をエントリID配列と詳細データ配列から削除します。
   * 
   * @param {number} indexToRemove - 削除する項目のインデックス
   */
  const removePublicTransportItem = (indexToRemove: number) => {
    setPublicTransportEntryIds(publicTransportEntryIds.filter((_, index) => index !== indexToRemove));
    setPublicTransportDetails(publicTransportDetails.filter((_, index) => index !== indexToRemove));
  };

  const removeCarUsageItem = (indexToRemove: number) => {
    setCarUsageEntryIds(carUsageEntryIds.filter((_, index) => index !== indexToRemove));
    setCarUsageDetails(carUsageDetails.filter((_, index) => index !== indexToRemove));
  };

  const removeOtherTransportItem = (indexToRemove: number) => {
    setOtherTransportEntryIds(otherTransportEntryIds.filter((_, index) => index !== indexToRemove));
    setOtherTransportDetails(otherTransportDetails.filter((_, index) => index !== indexToRemove));
  };

  const removeDailyAllowanceItem = (indexToRemove: number) => {
    setDailyAllowanceEntryIds(dailyAllowanceEntryIds.filter((_, index) => index !== indexToRemove));
    setDailyAllowanceDetails(dailyAllowanceDetails.filter((_, index) => index !== indexToRemove));
  };

  const removeLodgingItem = (indexToRemove: number) => {
    setLodgingEntryIds(lodgingEntryIds.filter((_, index) => index !== indexToRemove));
    setLodgingDetails(lodgingDetails.filter((_, index) => index !== indexToRemove));
  };

  /**
   * 詳細データの更新ハンドラー群
   * 
   * 各カテゴリの詳細データを更新するハンドラー群です。
   * 指定されたインデックスの項目のデータを更新し、フォームデータも同期します。
   * 
   * @param {number} index - 更新する項目のインデックス
   * @param {any} value - 更新する値
   */
  const handlePublicTransportChange = (index: number, value: any) => {
    const newDetails = [...publicTransportDetails];
    newDetails[index] = value;
    setPublicTransportDetails(newDetails);
    setFormData(prev => ({ ...prev, publicTransportDetails: newDetails }));
  };

  const handleCarUsageChange = (index: number, value: any) => {
    const newDetails = [...carUsageDetails];
    newDetails[index] = value;
    setCarUsageDetails(newDetails);
    setFormData(prev => ({ ...prev, carUsageDetails: newDetails }));
  };

  const handleOtherTransportChange = (index: number, value: any) => {
    const newDetails = [...otherTransportDetails];
    newDetails[index] = value;
    setOtherTransportDetails(newDetails);
    setFormData(prev => ({ ...prev, otherTransportDetails: newDetails }));
  };

  const handleDailyAllowanceChange = (index: number, value: any) => {
    const newDetails = [...dailyAllowanceDetails];
    newDetails[index] = value;
    setDailyAllowanceDetails(newDetails);
    setFormData(prev => ({ ...prev, dailyAllowanceDetails: newDetails }));
  };

  const handleLodgingChange = (index: number, value: any) => {
    const newDetails = [...lodgingDetails];
    newDetails[index] = value;
    setLodgingDetails(newDetails);
    setFormData(prev => ({ ...prev, lodgingDetails: newDetails }));
  };

  /**
   * フックの戻り値
   * 
   * フォーム管理に必要な状態と関数を返します。
   * コンポーネントからはこのオブジェクトを分割代入で使用します。
   * 
   * @returns {Object} フォーム管理の状態と関数を含むオブジェクト
   */
  return {
    // State - メインの状態管理
    formData,                    // フォームデータ
    setFormData,                 // フォームデータ更新関数
    errors,                      // バリデーションエラー
    setErrors,                   // エラー更新関数
    detailErrors,                // 詳細項目のエラー
    setDetailErrors,             // 詳細エラー更新関数
    
    // Entry IDs - 動的項目のID管理
    publicTransportEntryIds,     // 公共交通機関エントリID配列
    carUsageEntryIds,            // 車利用エントリID配列
    otherTransportEntryIds,      // その他交通手段エントリID配列
    dailyAllowanceEntryIds,      // 日当エントリID配列
    lodgingEntryIds,             // 宿泊エントリID配列
    
    // Details - 詳細データの管理
    publicTransportDetails,      // 公共交通機関詳細データ
    carUsageDetails,             // 車利用詳細データ
    otherTransportDetails,       // その他交通手段詳細データ
    dailyAllowanceDetails,       // 日当詳細データ
    lodgingDetails,              // 宿泊詳細データ
    
    // Functions - フォーム操作関数
    resetForm,                   // フォームリセット関数
    initializeFormData,          // フォームデータ初期化関数
    updateDailyAllowanceAndLodgingItems, // 日当・宿泊項目自動生成関数
    
    // Add handlers - 項目追加ハンドラー
    handleAddPublicTransportItem,    // 公共交通機関項目追加
    handleAddCarUsageItem,           // 車利用項目追加
    handleAddOtherTransportItem,     // その他交通手段項目追加
    handleAddDailyAllowanceItem,     // 日当項目追加
    handleAddLodgingItem,            // 宿泊項目追加
    
    // Remove handlers - 項目削除ハンドラー
    removePublicTransportItem,       // 公共交通機関項目削除
    removeCarUsageItem,              // 車利用項目削除
    removeOtherTransportItem,        // その他交通手段項目削除
    removeDailyAllowanceItem,        // 日当項目削除
    removeLodgingItem,               // 宿泊項目削除
    
    // Change handlers - データ変更ハンドラー
    handlePublicTransportChange,     // 公共交通機関変更
    handleCarUsageChange,            // 車利用変更
    handleOtherTransportChange,      // その他交通手段変更
    handleDailyAllowanceChange,      // 日当変更
    handleLodgingChange,             // 宿泊変更
  };
};
