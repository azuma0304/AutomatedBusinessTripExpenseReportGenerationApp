import { Button, Card, Input, Text } from "@rneui/themed";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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

export default function NewScreen() {
  const [name, setName] = useState<string>("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxfT71JyGw4CfTgbbCaimlXyoG2xpLBRLDbtX4DxkgkyemYAEONiFDR-gl3rxB2NQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
          }),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        Alert.alert("送信成功", "スプレッドシートに保存されました");
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

  const handleAddPublicTransportItem = () => {
    setPublicTransportEntryIds([...publicTransportEntryIds, publicTransportEntryIds.length]);
  };

  const handleAddCarUsageItem = () => {
    setCarUsageEntryIds([...carUsageEntryIds, carUsageEntryIds.length]);
  };

  const handleAddOtherTransportItem = () => {
    setOtherTransportEntryIds([...otherTransportEntryIds, otherTransportEntryIds.length]);
  };

  const handleAddDailyAllowanceItem = () => {
    setDailyAllowanceEntryIds([...dailyAllowanceEntryIds, dailyAllowanceEntryIds.length]);
  };

  const handleAddLodgingItem = () => {
    setLodgingEntryIds([...lodgingEntryIds, lodgingEntryIds.length]);
  };

  const removePublicTranceportItem = (indexToRemove: number) => {
    setPublicTransportEntryIds(publicTransportEntryIds.filter((_, index) => index !== indexToRemove));
  }

  const removeCarUsageItem = (indexToRemove: number) => {
    setCarUsageEntryIds(carUsageEntryIds.filter((_, index) => index != indexToRemove));
  }

  const removeOtherTransportItem = (indexToRemove: number) => {
    setOtherTransportEntryIds(otherTransportEntryIds.filter((_, index) => index != indexToRemove));
  }

  const removeDailyAllowanceItem = (indexToRemove: number) => {
    setDailyAllowanceEntryIds(dailyAllowanceEntryIds.filter((_, index) => index != indexToRemove));
  }

  const removeLodgingItem = (indexToRemove: number) => {
    setLodgingEntryIds(lodgingEntryIds.filter((_, index) => index != indexToRemove));
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <Text h3 style={{ color: "red", textAlign: "center", textDecorationLine: "underline" }}>
            出張旅費の新規作成
          </Text>

          {/* 出張先 */}
          <BusinessDestinationInput />

          {/* 出張の目的 */}
          <BusinessPurposeInput />


          {/* 移動した日付と詳細情報の入力 */}
          <TravelDetailInput
            publicTransportEntryIds={publicTransportEntryIds}
            carUsageEntryIds={carUsageEntryIds}
            otherTransportEntryIds={otherTransportEntryIds}
            handleAddPublicTransportItem={handleAddPublicTransportItem}
            handleAddCarUsageItem={handleAddCarUsageItem}
            handleAddOtherTransportItem={handleAddOtherTransportItem}
            removePublicTranceportItem={removePublicTranceportItem}
            removeCarUsageItem={removeCarUsageItem}
            removeOtherTransportItem={removeOtherTransportItem}
          />

          {/* 日当区分及び宿泊日数の入力 */}
          <DailyAllowanceInput 
            dailyAllowanceEntryIds={dailyAllowanceEntryIds}
            handleAddDailyAllowanceItem={handleAddDailyAllowanceItem}
            removeDailyAllowanceItem={removeDailyAllowanceItem}
          />

          {/* 宿泊区分及び日数を入力 */}
          <LodgingInput 
            lodgingEntryIds={lodgingEntryIds}
            handleAddLodgingItem={handleAddLodgingItem}
            removeLodgingItem={removeLodgingItem}
          />

          {/* 領収書の添付 */}
          <ReceiptInput/>

          {/* 最終確認と一時保存ボタン */}
          <SubmitConfirmationButton/>
          <DraftSaveButton/>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}



