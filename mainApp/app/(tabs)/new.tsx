import { Button, Card, Input, Text } from "@rneui/themed";
import React, { useState, useEffect } from "react";
import { Alert, ScrollView, TouchableOpacity, ActivityIndicator, View, Modal } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TravelExpenseFormSchema, TravelExpenseFormData } from "../../schemas/user-schema";
import { submitTravelExpense } from "../../services/api";
import { useDraftManagement } from "../../hooks/useDraftManagement";
import { useFormManagement } from "../../hooks/useFormManagement";
import { useRoute, useNavigation } from '@react-navigation/native';
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
  const [loading, setLoading] = useState<boolean>(false);
  const route = useRoute();
  const navigation = useNavigation();
  
  // カスタムフックを使用
  const { isEditMode, saveDraft, updateDraft, showConfirmDialog, showSuccessAlert } = useDraftManagement();
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



  // 未入力行や空金額などを削除・整形するサニタイズ
  const sanitizeFormData = (raw: TravelExpenseFormData): TravelExpenseFormData => {
    const isNonEmpty = (v?: string) => typeof v === 'string' && v.trim().length > 0;

    const sanitizedPublic = (raw.publicTransportDetails || [])
      .filter((d: any) => isNonEmpty(d?.date) || isNonEmpty(d?.transportMethod) || isNonEmpty(d?.departure) || isNonEmpty(d?.arrival) || isNonEmpty(d?.oneWayFare))
      .filter((d: any) => isNonEmpty(d?.date) && isNonEmpty(d?.transportMethod) && isNonEmpty(d?.departure) && isNonEmpty(d?.arrival) && isNonEmpty(d?.oneWayFare));

    const sanitizedCar = (raw.carUsageDetails || [])
      .filter((d: any) => isNonEmpty(d?.date) || isNonEmpty(d?.transportMethod) || isNonEmpty(d?.departure) || isNonEmpty(d?.arrival) || isNonEmpty(d?.rentalFee) || (d?.tolls && d.tolls.length) || (d?.gasoline && d.gasoline.length) || (d?.parking && d.parking.length) || isNonEmpty(d?.distance))
      .map((d: any) => ({
        ...d,
        tolls: (d?.tolls || []).filter((t: any) => isNonEmpty(t?.amount)),
        gasoline: (d?.gasoline || []).filter((g: any) => isNonEmpty(g?.amount)),
        parking: (d?.parking || []).filter((p: any) => isNonEmpty(p?.amount)),
      }))
      .filter((d: any) => isNonEmpty(d?.date) && isNonEmpty(d?.transportMethod) && isNonEmpty(d?.departure) && isNonEmpty(d?.arrival));

    const sanitizedOther = (raw.otherTransportDetails || [])
      .filter((d: any) => isNonEmpty(d?.date) || isNonEmpty(d?.transportMethod) || isNonEmpty(d?.departure) || isNonEmpty(d?.arrival) || isNonEmpty(d?.totalAmount))
      .filter((d: any) => isNonEmpty(d?.date) && isNonEmpty(d?.transportMethod) && isNonEmpty(d?.departure) && isNonEmpty(d?.arrival) && isNonEmpty(d?.totalAmount));

    const sanitizedDaily = (raw.dailyAllowanceDetails || [])
      .filter((d: any) => isNonEmpty(d?.dailyAllowanceCategory));

    const sanitizedLodging = (raw.lodgingDetails || [])
      .filter((d: any) => isNonEmpty(d?.lodgingCategory));

    // travelDays / lodgingDays を自動計算（無効なら undefined）
    let travelDaysCalc: number | undefined = undefined;
    let lodgingDaysCalc: number | undefined = undefined;
    try {
      if (isNonEmpty(raw.departureDate) && isNonEmpty(raw.returnDate)) {
        // 日付文字列をYYYY-MM-DD形式に変換してからDateオブジェクトに変換
        const start = new Date((raw.departureDate as string).replace(/\//g, '-'));
        const end = new Date((raw.returnDate as string).replace(/\//g, '-'));
        console.log('[sanitizeFormData] 日付計算:', {
          departureDate: raw.departureDate,
          returnDate: raw.returnDate,
          startValid: !isNaN(start.getTime()),
          endValid: !isNaN(end.getTime())
        });
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diff = end.getTime() - start.getTime() + 1; // +1で初日を含める
          const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
          travelDaysCalc = days;
          lodgingDaysCalc = Math.max(0, days - 1);
          console.log('[sanitizeFormData] 計算結果:', { travelDaysCalc, lodgingDaysCalc, diff, days });
        }
      }
    } catch (error) {
      console.error('[sanitizeFormData] エラー:', error);
    }

    const result: TravelExpenseFormData = {
      ...raw,
      publicTransportDetails: sanitizedPublic.length ? sanitizedPublic : undefined,
      carUsageDetails: sanitizedCar.length ? sanitizedCar : undefined,
      otherTransportDetails: sanitizedOther.length ? sanitizedOther : undefined,
      dailyAllowanceDetails: sanitizedDaily.length ? sanitizedDaily : undefined,
      lodgingDetails: sanitizedLodging.length ? sanitizedLodging : undefined,
    } as TravelExpenseFormData;

    // null や NaN を避け、数値が得られた時だけ設定
    if (typeof travelDaysCalc === 'number') {
      (result as any).travelDays = travelDaysCalc;
    } else {
      delete (result as any).travelDays;
    }
    if (typeof lodgingDaysCalc === 'number') {
      (result as any).lodgingDays = lodgingDaysCalc;
    } else {
      delete (result as any).lodgingDays;
    }

    return result;
  };

  // 画面で可視なセクションだけを含むフォームデータを構築
  const buildVisibleFormData = (raw: TravelExpenseFormData): TravelExpenseFormData => {
    const visible: TravelExpenseFormData = {
      destination: raw.destination,
      purpose: raw.purpose,
      departureDate: raw.departureDate,
      returnDate: raw.returnDate,
      travelDays: raw.travelDays,
      lodgingDays: raw.lodgingDays,
    } as TravelExpenseFormData;

    if (publicTransportEntryIds.length > 0 && (raw.publicTransportDetails?.length || 0) > 0) {
      (visible as any).publicTransportDetails = raw.publicTransportDetails;
    }
    if (carUsageEntryIds.length > 0 && (raw.carUsageDetails?.length || 0) > 0) {
      (visible as any).carUsageDetails = raw.carUsageDetails;
    }
    if (otherTransportEntryIds.length > 0 && (raw.otherTransportDetails?.length || 0) > 0) {
      (visible as any).otherTransportDetails = raw.otherTransportDetails;
    }
    if (dailyAllowanceEntryIds.length > 0 && (raw.dailyAllowanceDetails?.length || 0) > 0) {
      (visible as any).dailyAllowanceDetails = raw.dailyAllowanceDetails;
    }
    if (lodgingEntryIds.length > 0 && (raw.lodgingDetails?.length || 0) > 0) {
      (visible as any).lodgingDetails = raw.lodgingDetails;
    }
    if ((raw as any).receipts && (raw as any).receipts.length > 0) {
      (visible as any).receipts = (raw as any).receipts;
    }
    return visible;
  };

  // バリデーション関数（可視なセクションのみ + サニタイズ後に検証）
  const validateForm = () => {
    const visible = buildVisibleFormData(formData);
    const sanitized = sanitizeFormData(visible);

    const result = TravelExpenseFormSchema.safeParse(sanitized);
    if (result.success) {
      setErrors({});
      return { ok: true, data: result.data as TravelExpenseFormData } as const;
    }

    const newErrors: Record<string, string> = {};
    const messages: string[] = [];
    result.error.issues.forEach((err: any) => {
      const path = err.path.join('.') || '(root)';
      const msg = `${path}: ${err.message}`;
      newErrors[path] = err.message;
      messages.push(msg);
    });
    setErrors(newErrors);
    // 先頭数件をまとめて表示
    const display = messages.slice(0, 5).join('\n');
    Alert.alert('入力エラー', display);
    console.warn('[validate] errors:', messages);
    return { ok: false } as const;
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
      ALERT_MESSAGES.CONFIRM.SUBMIT_CONFIRM,
      async () => {
        // バリデーションチェック
        const validate = validateForm();
        if (!validate.ok) {
          console.log('バリデーションエラー');
          return;
        }

        // ローディング開始
        setLoading(true);

        try {
          // API サービスを使用してGASに送信（可視+サニタイズしたデータを送る）
          const result = await submitTravelExpense(validate.data);

          if (result.status === "success") {
            const documentUrl = result.documentUrl;
            
            // プレビューURLがある場合は、プレビューボタンを表示
            if (documentUrl) {
              showSuccessAlert(
                "送信成功",
                ALERT_MESSAGES.SUCCESS.SUBMITTED,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      resetForm();
                      setErrors({});
                      setDetailErrors({});
                      (navigation as any).navigate('new', {});
                      setShowConfirmation(false);
                    }
                  },
                  {
                    text: "プレビューを見る",
                    onPress: () => {
                      resetForm();
                      setErrors({});
                      setDetailErrors({});
                      (navigation as any).navigate('preview', { documentUrl });
                      setShowConfirmation(false);
                    }
                  }
                ]
              );
            } else {
              showSuccessAlert("送信成功", ALERT_MESSAGES.SUCCESS.SUBMITTED, [
                {
                  text: "OK",
                  onPress: () => {
                    // フォームとバリデーションを完全初期化
                    resetForm();
                    setErrors({});
                    setDetailErrors({});
                    // 編集モード由来のパラメータをクリアし、新規作成画面として再表示
                    (navigation as any).navigate('new', {});
                    // 入力画面に戻る
                    setShowConfirmation(false);
                  }
                }
              ]);
            }
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
        } finally {
          // ローディング終了
          setLoading(false);
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
          
          {/* ローディングモーダル */}
          <Modal
            transparent={true}
            visible={loading}
            animationType="fade"
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}>
              <View style={{
                backgroundColor: 'white',
                padding: 30,
                borderRadius: 10,
                alignItems: 'center'
              }}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={{ marginTop: 15, fontSize: 16 }}>送信中...</Text>
              </View>
            </View>
          </Modal>
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
            onChange={(value: string) => {
              setFormData({ ...formData, departureDate: value });
              // 出張日数と宿泊日数を計算して日当・宿泊項目を自動生成
              if (formData.returnDate) {
                updateDailyAllowanceAndLodgingItems(value, formData.returnDate);
              }
            }}
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

          {/* 最終確認ボタン */}
          <Button 
            title={BUTTON_TEXTS.FINAL_CONFIRM} 
            buttonStyle={{ backgroundColor: BUTTON_COLORS.CONFIRM, marginBottom: 10 }} 
            onPress={handleShowConfirmation}
          />
          
          {/* 編集モードかどうかで一時保存or下書き更新ボタンを切り替え */}
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





