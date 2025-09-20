
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { StyleSheet } from "react-native";

export default function NewScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">New</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
