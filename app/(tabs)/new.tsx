
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, Text, Card } from "@rneui/themed";

export default function NewScreen() {
  return (
    <SafeAreaProvider>
      <Card>
        <Card.Title>RNE お試しカード</Card.Title>
        <Card.Divider />
        <Text style={{ marginBottom: 10 }}>
          React Native Elements (RNE) のコンポーネントを使ったサンプルです。
        </Text>
        <Button
          title="押してみてね"
          onPress={() => alert("RNEボタンが押されました")}
        />
      </Card>
    </SafeAreaProvider>
  );
}
