import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import { Alert, Platform, StyleSheet } from "react-native";

function ListScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">一覧</ThemedText>
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

export default ListScreen;