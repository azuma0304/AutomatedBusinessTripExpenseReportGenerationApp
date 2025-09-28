import { Button, Card, Input, Text } from "@rneui/themed";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function NewScreen() {
  const [name, setName] = useState<string>("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbya3fdCS4ou-BHDWUVo2UPGXhSBj-fILR8F8JtFC6pgX3R4_RdwhzAwB0DfD8pt0Xze/exec",
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
        // console.log(data);
      } else {
        Alert.alert("エラー", "保存に失敗しました");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("通信エラー", "サーバーに接続できませんでした");
    }
  };

  return (
    <SafeAreaProvider>
      <Text h3 style={{ textAlign: "center", textDecorationLine: "underline" }}>
        出張旅費の新規作成
      </Text>
      <Card>
        <Card.Title>データ送受信 お試しカード</Card.Title>
        <Input placeholder="名前を入力" value={name} onChangeText={setName} />
        <Button title="送信" onPress={handleSubmit} />
      </Card>
    </SafeAreaProvider>
  );
}
