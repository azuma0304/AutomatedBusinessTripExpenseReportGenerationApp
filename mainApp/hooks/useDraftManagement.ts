import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelExpenseFormData } from '../schemas/user-schema';
import { STORAGE_KEYS, ALERT_MESSAGES } from '../app/constants';

/**
 * 下書き管理カスタムフック
 * 
 * 出張旅費書の下書き機能を管理するためのカスタムフックです。
 * 下書きの保存、更新、編集モードの切り替えなどの機能を提供します。
 * 
 * @returns {Object} 下書き管理に必要な状態と関数
 * @returns {boolean} isEditMode - 編集モードかどうか
 * @returns {string|null} editingDraftId - 編集中の下書きID
 * @returns {Function} saveDraft - 下書き保存関数
 * @returns {Function} updateDraft - 下書き更新関数
 * @returns {Function} showConfirmDialog - 確認ダイアログ表示関数
 * 
 * @example
 * ```typescript
 * const { isEditMode, saveDraft, updateDraft } = useDraftManagement();
 * 
 * // 下書き保存
 * await saveDraft(formData, resetForm);
 * 
 * // 下書き更新
 * await updateDraft(formData, resetForm);
 * ```
 * 
 * @features
 * - 新規下書きの保存
 * - 既存下書きの更新
 * - 編集モードの自動切り替え
 * - プラットフォーム別確認ダイアログ
 * - AsyncStorageを使用したローカル保存
 * - ナビゲーション状態の管理
 * 
 * @dependencies
 * - React Navigation (useRoute, useNavigation)
 * - AsyncStorage (ローカルストレージ)
 * - React Native (Alert, Platform)
 * - カスタム定数 (STORAGE_KEYS, ALERT_MESSAGES)
 */



export const useDraftManagement = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const prevParamsRef = useRef<any>(null);

  /**
   * プラットフォーム別の確認ダイアログ表示関数
   * 
   * Webとモバイルで異なる確認ダイアログを表示します。
   * Webではwindow.confirm、モバイルではAlert.alertを使用します。
   * 
   * @param {string} title - ダイアログのタイトル
   * @param {string} message - ダイアログのメッセージ
   * @param {Function} onConfirm - 確認時のコールバック関数
   */
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'OK', onPress: onConfirm }
      ]);
    }
  };

  /**
   * 下書きデータでフォームを初期化するuseEffect
   * 
   * ナビゲーションパラメータの変更を監視し、
   * 下書きデータが渡された場合は編集モードに切り替えます。
   * 
   * @dependencies [route.params] - ナビゲーションパラメータの変更を監視
   */
  useEffect(() => {
    const params = route.params as { draftData?: TravelExpenseFormData; draftId?: string };

    // 初回マウント時は何もしない
    if (!prevParamsRef.current) {
      prevParamsRef.current = params;
      return;
    }
    
    if (params?.draftData && params?.draftId) {
      // 下書きデータが渡された場合のみ編集モードに切り替え
      setIsEditMode(true);
      setEditingDraftId(params.draftId);
    } else if (!params?.draftData && !params?.draftId) {
      // パラメータが空の場合、編集モードをリセット
      setIsEditMode(false);
      setEditingDraftId(null);
    }
  }, [route.params]);

  /**
   * 下書き保存機能（新規作成時のみ）
   * 
   * フォームデータを下書きとして保存します。
   * 編集モードの場合はupdateDraftを呼び出します。
   * 
   * @param {TravelExpenseFormData} formData - 保存するフォームデータ
   * @param {Function} resetForm - フォームリセット関数
   * 
   * @process
   * 1. 編集モードの場合はupdateDraftを実行
   * 2. 確認ダイアログを表示
   * 3. バリデーション（出張先の入力チェック）
   * 4. 下書きIDを生成（タイムスタンプベース）
   * 5. AsyncStorageに保存
   * 6. フォームをリセット
   * 7. 成功メッセージを表示
   */
  const saveDraft = async (formData: TravelExpenseFormData, resetForm: () => void) => {
    // 編集モードの場合はupdateDraftを実行
    if (isEditMode && editingDraftId) {
      updateDraft(formData, resetForm);
      return;
    }
    
    showConfirmDialog(
      '一時保存',
      '一時保存しますか？',
      async () => {
        try {
          if (!formData.destination) {
            Alert.alert('エラー', ALERT_MESSAGES.ERROR.NO_DRAFT_CONTENT);
            return;
          }

          const draftId = Date.now().toString();
          const draft = {
            id: draftId,
            destination: formData.destination || '未入力',
            updateDate: new Date().toISOString().split('T')[0],
            data: formData
          };

          const existingDrafts = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);
          const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
          drafts.push(draft);
          await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));

          resetForm();
          Alert.alert('一時保存', ALERT_MESSAGES.SUCCESS.DRAFT_SAVED);
        } catch (error) {
          console.error('一時保存エラー:', error);
          Alert.alert('エラー', ALERT_MESSAGES.ERROR.SAVE_FAILED);
        }
      }
    );
  };

  /**
   * 下書き更新機能（編集時のみ）
   * 
   * 既存の下書きを更新します。
   * 編集モードでのみ使用されます。
   * 
   * @param {TravelExpenseFormData} formData - 更新するフォームデータ
   * @param {Function} resetForm - フォームリセット関数
   * 
   * @process
   * 1. 確認ダイアログを表示
   * 2. バリデーション（出張先の入力チェック）
   * 3. 編集中の下書きIDの存在チェック
   * 4. 既存の下書きを検索
   * 5. 下書きデータを更新
   * 6. AsyncStorageに保存
   * 7. 編集モードをリセット（100ms遅延）
   * 8. フォームをリセット
   * 9. 成功メッセージを表示
   * 10. ナビゲーションをリセット
   */
  const updateDraft = async (formData: TravelExpenseFormData, resetForm: () => void) => {
    showConfirmDialog(
      '下書き更新',
      '下書きを更新しますか？',
      async () => {
        try {
          if (!formData.destination) {
            Alert.alert('エラー', ALERT_MESSAGES.ERROR.NO_DRAFT_CONTENT);
            return;
          }

          if (!editingDraftId) {
            Alert.alert('エラー', ALERT_MESSAGES.ERROR.DRAFT_NOT_FOUND);
            return;
          }

          const draft = {
            id: editingDraftId,
            destination: formData.destination || '未入力',
            updateDate: new Date().toISOString().split('T')[0],
            data: formData
          };

          const existingDrafts = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);
          const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];

          const draftIndex = drafts.findIndex((d: any) => d.id === editingDraftId);
          if (draftIndex !== -1) {
            drafts[draftIndex] = draft;
          }

          await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));

          // 編集モードをリセット
          setIsEditMode(false);
          setEditingDraftId(null);

          resetForm();
          
          // ナビゲーションをリセット
          (navigation as any).navigate('new', {});
          
          // 状態更新を確実にするため、遅延実行
          setTimeout(() => {
            Alert.alert('下書き更新', ALERT_MESSAGES.SUCCESS.DRAFT_UPDATED);
          }, 100);
        } catch (error) {
          console.error('下書き更新エラー:', error);
          Alert.alert('エラー', ALERT_MESSAGES.ERROR.UPDATE_FAILED);
        }
      }
    );
  };

  /**
   * フックの戻り値
   * 
   * 下書き管理に必要な状態と関数を返します。
   * コンポーネントからはこのオブジェクトを分割代入で使用します。
   */
  return {
    isEditMode,        // 編集モード状態
    editingDraftId,    // 編集中の下書きID
    saveDraft,         // 下書き保存関数
    updateDraft,       // 下書き更新関数
    showConfirmDialog  // 確認ダイアログ表示関数
  };
};
