import { Redirect } from "expo-router";

// 初期ページをnewタブにリダイレクト
export default function Index() {
  return <Redirect href="/(tabs)/new" />;
}
