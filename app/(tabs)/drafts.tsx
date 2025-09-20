
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { StyleSheet } from "react-native";

export default function DraftsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Drafts</ThemedText>
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
