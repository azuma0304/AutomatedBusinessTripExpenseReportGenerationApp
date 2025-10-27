import { Button, Card, Input, Text } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TravelExpenseFormSchema, TravelExpenseFormData } from "../../schemas/user-schema";
import { submitTravelExpense } from "../../services/api";
import { useDraftManagement } from "../../hooks/useDraftManagement";
import { useFormManagement } from "../../hooks/useFormManagement";
import { useRoute } from '@react-navigation/native';
import { BUTTON_COLORS, BUTTON_TEXTS, ALERT_MESSAGES } from '../constants';
// Atoms
import AddPublicTransportButton from "../components/atoms/add-public-transport-button";
import AddCarUsageButton from "../components/atoms/add-car-usage-button";
import AddOtherTransportButton from "../components/atoms/add-other-transport-button";
import AddDailyAllowanceButton from "../components/atoms/add-daily-allowance-button";
import AddLodgingButton from "../components/atoms/add-lodging-button";
import SubmitConfirmationButton from "../components/atoms/submit-confirmation-button";
import DraftSaveButton from "../components/atoms/draft-save-button";
import DraftUpdateButton from "../components/atoms/draft-update-button";

// Molecules
import PublicWebTransportDetailInput from "../components/molecules/public-transport-detail-input";
import BusinessDestinationInput from "../components/molecules/business-destination-input";
import BusinessPurposeInput from "../components/molecules/business-purpose-input";
import DepartureDateInput from "../components/molecules/departure-date-input";
import ArrivalDateInput from "../components/molecules/arrival-date-input";
import CarUsageDetailInput from "../components/molecules/car-usage-detail-input";
import OtherTransportDetailInput from "../components/molecules/other-transport-detail-input";
import DailyAllowanceDetailInput from "../components/molecules/daily-allowance-detail-input";
import LodgingDetailInput from "../components/molecules/lodging-detail-input";
import ReceiptInput from "../components/molecules/receipt-input";

// Organisms
import TravelDetailInput from "../components/organisms/travel-detail-input";
import DailyAllowanceInput from "../components/organisms/daily-allowance-input";
import LodgingInput from "../components/organisms/lodging-input";
import ConfirmationScreen from "../components/organisms/confirmation-screen";

export default function NewScreen() {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const route = useRoute();
  
  // カスタムフックを使用
  const { isEditMode, saveDraft, updateDraft, showConfirmDialog } = useDraftManagement();
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    detailErrors,
    setDetailErrors,
    publicTransportEntryIds,
    carUsageEntryIds,
    otherTransportEntryIds,
    dailyAllowanceEntryIds,
    lodgingEntryIds,
    publicTransportDetails,
    carUsageDetails,
    otherTransportDetails,
    dailyAllowanceDetails,
    lodgingDetails,
    resetForm,
    initializeFormData,
    updateDailyAllowanceAndLodgingItems,
    handleAddPublicTransportItem,
    handleAddCarUsageItem,
    handleAddOtherTransportItem,
    handleAddDailyAllowanceItem,
    handleAddLodgingItem,
    removePublicTransportItem,
    removeCarUsageItem,
    removeOtherTransportItem,
    removeDailyAllowanceItem,
    removeLodgingItem,
    handlePublicTransportChange,
    handleCarUsageChange,
    handleOtherTransportChange,
    handleDailyAllowanceChange,
    handleLodgingChange,
  } = useFormManagement();

  // 下書きデータでフォームを初期化
  useEffect(() => {
    const params = route.params as { draftData?: TravelExpenseFormData; draftId?: string };
    if (params?.draftData) {
      console.log('Initializing form with draft data:', params.draftData);
      initializeFormData(params.draftData);
    }
  }, [route.params]);



  // バリデーション関数
  const validateForm = () => {
    try {
      TravelExpenseFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path.join(".")] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // 最終確認画面を表示
  const handleShowConfirmation = () => {
    showConfirmDialog(
      '最終確認',
      '入力内容を確認しますか？',
      () => {
        setShowConfirmation(true);
      }
    );
  };

  // 修正ボタン（確認画面から戻る）
  const handleEdit = () => {
    setShowConfirmation(false);
  };

  // 確定ボタン（GASに送信）
  const handleConfirm = async () => {
    showConfirmDialog(
      '送信確認',
      'スプレッドシートに送信しますか？',
      async () => {
        // バリデーションチェック
        if (!validateForm()) {
          console.log('バリデーションエラー', errors);
          Alert.alert("入力エラー", ALERT_MESSAGES.ERROR.VALIDATION_FAILED);
          return;
        }

        console.log('バリデーション成功', formData);

        try {
          // API サービスを使用してGASに送信
          const result = await submitTravelExpense(formData);

          if (result.status === "success") {
            Alert.alert("送信成功", ALERT_MESSAGES.SUCCESS.SUBMITTED);
            
            // フォームをリセット
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
            
            // 入力画面に戻る
            setShowConfirmation(false);
          } else {
            Alert.alert(
              "エラー", 
              result.message || "保存に失敗しました"
            );
          }
        } catch (error: any) {
          console.error('送信エラー:', error);
          Alert.alert(
            "通信エラー", 
            "サーバーに接続できませんでした"
          );
        }
      }
    );
  };


  // 確認画面を表示している場合
  if (showConfirmation) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <ConfirmationScreen
            formData={formData}
            onEdit={handleEdit}
            onConfirm={handleConfirm}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // 通常の入力画面
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>

          {/* 出張先 */}
          <BusinessDestinationInput
            value={formData.destination}
            onChange={(value: string) => setFormData({ ...formData, destination: value })}
          />

          {/* 出張の目的 */}
          <BusinessPurposeInput
            value={formData.purpose}
            onChange={(value: string) => setFormData({ ...formData, purpose: value })}
          />

          {/* 出発日 */}
          <DepartureDateInput
            value={formData.departureDate}
            onChange={(value: string) => setFormData({ ...formData, departureDate: value })}
          />

          {/* 帰着日 */}
          <ArrivalDateInput
            value={formData.returnDate}
            onChange={(value: string) => {
              setFormData({ ...formData, returnDate: value });
              // 出張日数と宿泊日数を計算して日当・宿泊項目を自動生成
              updateDailyAllowanceAndLodgingItems(formData.departureDate, value);
            }}
          />

          {/* 移動した日付と詳細情報の入力 */}
          <TravelDetailInput
            publicTransportEntryIds={publicTransportEntryIds}
            carUsageEntryIds={carUsageEntryIds}
            otherTransportEntryIds={otherTransportEntryIds}
            publicTransportDetails={publicTransportDetails}
            carUsageDetails={carUsageDetails}
            otherTransportDetails={otherTransportDetails}
            handleAddPublicTransportItem={handleAddPublicTransportItem}
            handleAddCarUsageItem={handleAddCarUsageItem}
            handleAddOtherTransportItem={handleAddOtherTransportItem}
            removePublicTransportItem={removePublicTransportItem}
            removeCarUsageItem={removeCarUsageItem}
            removeOtherTransportItem={removeOtherTransportItem}
            handlePublicTransportChange={handlePublicTransportChange}
            handleCarUsageChange={handleCarUsageChange}
            handleOtherTransportChange={handleOtherTransportChange}
            detailErrors={detailErrors}
          />

          {/* 日当区分及び宿泊日数の入力 */}
          <DailyAllowanceInput
            dailyAllowanceEntryIds={dailyAllowanceEntryIds}
            dailyAllowanceDetails={dailyAllowanceDetails}
            handleAddDailyAllowanceItem={handleAddDailyAllowanceItem}
            removeDailyAllowanceItem={removeDailyAllowanceItem}
            handleDailyAllowanceChange={handleDailyAllowanceChange}
            detailErrors={detailErrors}
          />

          {/* 宿泊区分及び日数を入力 */}
          <LodgingInput
            lodgingEntryIds={lodgingEntryIds}
            lodgingDetails={lodgingDetails}
            handleAddLodgingItem={handleAddLodgingItem}
            removeLodgingItem={removeLodgingItem}
            handleLodgingChange={handleLodgingChange}
            detailErrors={detailErrors}
          />

          {/* 領収書の添付 */}
          <ReceiptInput />

          {/* 最終確認と一時保存ボタン */}
          <Button 
            title={BUTTON_TEXTS.FINAL_CONFIRM} 
            buttonStyle={{ backgroundColor: BUTTON_COLORS.CONFIRM, marginBottom: 10 }} 
            onPress={handleShowConfirmation}
          />
          
          {/* 編集モードかどうかでボタンを切り替え */}
          {isEditMode ? (
            <DraftUpdateButton onPress={() => updateDraft(formData, resetForm)} />
          ) : (
            <DraftSaveButton onPress={() => saveDraft(formData, resetForm)} />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}




