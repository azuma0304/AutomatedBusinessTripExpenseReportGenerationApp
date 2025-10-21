import { Button, Card, Input, Text } from "@rneui/themed";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TravelExpenseFormSchema, TravelExpenseFormData } from "../../schemas/user-schema";
// Atoms
import AddPublicTransportButton from "../components/atoms/add-public-transport-button";
import AddCarUsageButton from "../components/atoms/add-car-usage-button";
import AddOtherTransportButton from "../components/atoms/add-other-transport-button";
import AddDailyAllowanceButton from "../components/atoms/add-daily-allowance-button";
import AddLodgingButton from "../components/atoms/add-lodging-button";
import SubmitConfirmationButton from "../components/atoms/submit-confirmation-button";
import DraftSaveButton from "../components/atoms/draft-save-button";

// Molecules
import PublicWebTransportDetailInput from "../components/molecules/public-transport-detail-input";
import BusinessDestinationInput from "../components/molecules/business-destination-input";
import BusinessPurposeInput from "../components/molecules/business-purpose-input";
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
import { any } from "zod";

export default function NewScreen() {
  const [name, setName] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [formData, setFormData] = useState<TravelExpenseFormData>({
    destination: '',
    purpose: '',
    publicTransportDetails: [],
    carUsageDetails: [],
    otherTransportDetails: [],
    dailyAllowanceDetails: [],
    lodgingDetails: [],
    receipts: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [detailErrors, setDetailErrors] = useState<{ [key: string]: { [key: string]: string } }>({});

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
    setShowConfirmation(true);
  };

  // 修正ボタン（確認画面から戻る）
  const handleEdit = () => {
    setShowConfirmation(false);
  };

  // 確定ボタン（GASに送信）
  const handleConfirm = async () => {
    if (validateForm()) {
      console.log('バリデーション成功', formData);
    } else {
      console.log('エラー', errors);
      Alert.alert("入力エラー", "入力内容に不備があります");
      return;
    }

    // GASに送信するデータオブジェクトを作成
    const dataToSend = {
      destination: formData.destination,
      purpose: formData.purpose,
      publicTransportDetails: formData.publicTransportDetails || [],
      carUsageDetails: formData.carUsageDetails || [],
      otherTransportDetails: formData.otherTransportDetails || [],
      dailyAllowanceDetails: formData.dailyAllowanceDetails || [],
      lodgingDetails: formData.lodgingDetails || [],
      receipts: formData.receipts || [],
      submittedAt: new Date().toISOString(),
    };

    console.log('GASに送信するデータ:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxfT71JyGw4CfTgbbCaimlXyoG2xpLBRLDbtX4DxkgkyemYAEONiFDR-gl3rxB2NQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        Alert.alert("送信成功", "スプレッドシートに保存されました");
        // フォームをリセット
        setFormData({
          destination: '',
          purpose: '',
          publicTransportDetails: [],
          carUsageDetails: [],
          otherTransportDetails: [],
          dailyAllowanceDetails: [],
          lodgingDetails: [],
          receipts: [],
        });
        setShowConfirmation(false);
      } else {
        Alert.alert("エラー", "保存に失敗しました");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("通信エラー", "サーバーに接続できませんでした");
    }
  };

  const [publicTransportEntryIds, setPublicTransportEntryIds] = useState<number[]>([]);
  const [carUsageEntryIds, setCarUsageEntryIds] = useState<number[]>([]);
  const [otherTransportEntryIds, setOtherTransportEntryIds] = useState<number[]>([]);
  const [dailyAllowanceEntryIds, setDailyAllowanceEntryIds] = useState<number[]>([]);
  const [lodgingEntryIds, setLodgingEntryIds] = useState<number[]>([]);

  // 各詳細データの状態管理
  const [publicTransportDetails, setPublicTransportDetails] = useState<any[]>([]);
  const [carUsageDetails, setCarUsageDetails] = useState<any[]>([]);
  const [otherTransportDetails, setOtherTransportDetails] = useState<any[]>([]);
  const [dailyAllowanceDetails, setDailyAllowanceDetails] = useState<any[]>([]);
  const [lodgingDetails, setLodgingDetails] = useState<any[]>([]);

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

  const removePublicTranceportItem = (indexToRemove: number) => {
    setPublicTransportEntryIds(publicTransportEntryIds.filter((_, index) => index !== indexToRemove));
    setPublicTransportDetails(publicTransportDetails.filter((_, index) => index !== indexToRemove));
  }

  const removeCarUsageItem = (indexToRemove: number) => {
    setCarUsageEntryIds(carUsageEntryIds.filter((_, index) => index !== indexToRemove));
    setCarUsageDetails(carUsageDetails.filter((_, index) => index !== indexToRemove));
  }

  const removeOtherTransportItem = (indexToRemove: number) => {
    setOtherTransportEntryIds(otherTransportEntryIds.filter((_, index) => index !== indexToRemove));
    setOtherTransportDetails(otherTransportDetails.filter((_, index) => index !== indexToRemove));
  }

  const removeDailyAllowanceItem = (indexToRemove: number) => {
    setDailyAllowanceEntryIds(dailyAllowanceEntryIds.filter((_, index) => index !== indexToRemove));
    setDailyAllowanceDetails(dailyAllowanceDetails.filter((_, index) => index !== indexToRemove));
  }

  const removeLodgingItem = (indexToRemove: number) => {
    setLodgingEntryIds(lodgingEntryIds.filter((_, index) => index !== indexToRemove));
    setLodgingDetails(lodgingDetails.filter((_, index) => index !== indexToRemove));
  }

  // 詳細データの更新ハンドラー
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
          <Text h3 style={{ color: "red", textAlign: "center", textDecorationLine: "underline" }}>
            出張旅費の新規作成
          </Text>

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
            removePublicTranceportItem={removePublicTranceportItem}
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
            title="最終確認" 
            buttonStyle={{ backgroundColor: "red", marginBottom: 10 }} 
            onPress={handleShowConfirmation}
          />
          <DraftSaveButton />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}




