import { Button, Card, Input, Text } from "@rneui/themed";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <Text h3 style={{ color: "red", textAlign: "center", textDecorationLine: "underline" }}>
            出張旅費の新規作成
          </Text>

          {/* 出張先 */} 
          <Card containerStyle={{
            marginBottom: 15,
            borderRadius: 15,
          }}>
            <Card.Title h4 style={{ fontWeight: 'bold' }}>出張先を入力してください</Card.Title>
            <Input placeholder="例：東京都立病院"/>
          </Card>

          {/* 出張の目的 */} 
          <Card containerStyle={{
            marginBottom: 15,
            borderRadius: 15,
          }}>
            <Card.Title h4 style={{ fontWeight: 'bold' }}>出張の目的を入力してください</Card.Title>
            <Input placeholder="例：サーバーエラーを修正する為" />
          </Card>

          {/* 移動した日付と詳細情報の入力 */} 
          <Card containerStyle={{
            marginBottom: 15,
            borderRadius: 15,
          }}>
            <Card.Title h4 style={{ fontWeight: 'bold' }}>移動した日付と詳細情報の入力</Card.Title>
            <Text style={{ color: "red", textAlign: "center", textDecorationLine: "underline", marginBottom: 5 }}>
              公共交通機関及び飛行機を利用した場合
            </Text>
            <Button title="+ 公共交通機関の情報を追加" buttonStyle={{ backgroundColor: "green", marginBottom: 10 }} />
            <Text style={{ color: "green", textAlign: "center", textDecorationLine: "underline", marginBottom: 5 }}>
              レンタカーまたは自家用車を利用した場合
            </Text>
            <Button title="+ 車両利用の情報を追加" buttonStyle={{ backgroundColor: "green", marginBottom: 10 }} />
            <Text style={{ color: "black", textAlign: "center", textDecorationLine: "underline", marginBottom: 5 }}>
              その他
            </Text>
            <Button title="+ 移動手段の情報を追加" buttonStyle={{ backgroundColor: "green" }} />
          </Card>

          {/* 日当区分及び宿泊日数の入力 */} 
          <Card containerStyle={{
            marginBottom: 15,
            borderRadius: 15,
          }}>
            <Card.Title h4 style={{ fontWeight: 'bold' }}>日当区分及び宿泊日数の入力</Card.Title>
            <Button title="+ 日当区分を追加" buttonStyle={{ backgroundColor: "green" }} />
          </Card>

          {/* 宿泊区分及び日数を入力 */} 
          <Card containerStyle={{
            marginBottom: 15,
            borderRadius: 15,
          }}>
            <Card.Title h4 style={{ fontWeight: 'bold' }}>宿泊区分及び日数を入力</Card.Title>
            <Button title="+ 省泊区分を追加" buttonStyle={{ backgroundColor: "green" }} />
          </Card>

          {/* 領収書の添付 */} 
          <Card containerStyle={{
            marginBottom: 15,
            borderRadius: 15,
          }}>
            <Card.Title h4 style={{ fontWeight: 'bold' }}>領収書の添付</Card.Title>
            <Button title="+ カメラを起動" buttonStyle={{ backgroundColor: "green", marginBottom: 10 }} />
            <Button title="+ 写真フォルダから選択" buttonStyle={{ backgroundColor: "black" }} />
          </Card>

          {/* 最終確認と一時保存ボタン */} 
          <Button title="最終確認" buttonStyle={{ backgroundColor: "red", marginBottom: 10 }} />
          <Button title="一時保存" buttonStyle={{ backgroundColor: "cornflowerblue" }} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
