import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { fetchSubmittedExpenses, SubmittedExpense } from '../../services/api/travelExpenseApi';

function ListScreen() {
  const [expenses, setExpenses] = useState<SubmittedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadExpenses = async () => {
    try {
      const result = await fetchSubmittedExpenses();
      if (result.status === 'success' && result.data) {
        setExpenses(result.data);
      } else {
        Alert.alert('エラー', result.message || '一覧の取得に失敗しました');
      }
    } catch (error: any) {
      console.error('一覧取得エラー:', error);
      Alert.alert('エラー', '一覧の取得に失敗しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初回マウント時のみデータを取得
  useEffect(() => {
    console.log('一覧画面が初回マウントされました。データを取得します。');
    loadExpenses();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  const handlePreview = (documentUrl: string | null) => {
    if (!documentUrl) {
      Alert.alert('エラー', 'プレビューURLがありません');
      return;
    }
  (navigation as any).navigate('preview', { documentUrl }); // preview画面に遷移してdocumentUrlを渡す
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };

  const renderItem = ({ item }: { item: SubmittedExpense }) => (
    <Card containerStyle={{
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <Card.Title h4>{item.destination || '出張先未設定'}</Card.Title>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', width: 80, color: '#666' }}>目的:</Text>
        <Text style={{ fontSize: 14, flex: 1, color: '#333' }}>{item.purpose || '未設定'}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', width: 80, color: '#666' }}>出発日:</Text>
        <Text style={{ fontSize: 14, flex: 1, color: '#333' }}>{formatDate(item.departureDate) || '未設定'}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', width: 80, color: '#666' }}>帰着日:</Text>
        <Text style={{ fontSize: 14, flex: 1, color: '#333' }}>{formatDate(item.returnDate) || '未設定'}</Text>
      </View>
      <Button
        title="プレビューを見る"
        buttonStyle={{ backgroundColor: '#007AFF', borderRadius: 8, marginTop: 10 }}
        onPress={() => handlePreview(item.documentUrl)}
        disabled={!item.documentUrl}
      />
    </Card>
  );

  const renderEmpty = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
        提出済みの旅費書がありません
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.sheetName || `expense-${index}`}
        contentContainerStyle={expenses.length === 0 ? { flex: 1 } : { padding: 10 }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </SafeAreaView>
  );
}

export default ListScreen;
