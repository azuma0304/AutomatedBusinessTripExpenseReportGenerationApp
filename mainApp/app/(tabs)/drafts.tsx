import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text, Button } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelExpenseFormData } from '../../schemas/user-schema';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { STORAGE_KEYS, ALERT_MESSAGES, BUTTON_TEXTS, TEXT_COLORS, BACKGROUND_COLORS } from '../constants';

interface DraftItem {
  id: string;
  destination: string;
  updateDate: string;
  data: TravelExpenseFormData;
}

export default function DraftsScreen() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const navigation = useNavigation();

  // AsyncStorageから下書きを読み込み
  const loadDrafts = async () => {
    try {
      const draftsData = await AsyncStorage.getItem(STORAGE_KEYS.DRAFTS);
      
      if (draftsData) {
        const parsedDrafts = JSON.parse(draftsData);
        setDrafts(parsedDrafts);
      } else {
        console.log('下書きデータが見つかりません');
        setDrafts([]);
      }
    } catch (error) {
      console.error('下書きの読み込みエラー:', error);
      Alert.alert('エラー', ALERT_MESSAGES.ERROR.LOAD_FAILED);
    }
  };

  // コンポーネントマウント時に下書きを読み込み
  useEffect(() => {
    loadDrafts();
  }, []);

  // 画面にフォーカスが当たった時に下書きを再読み込み
  useFocusEffect(
    React.useCallback(() => {
      loadDrafts();
    }, [])
  );

  // ブラウザ対応の確認ダイアログ
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'OK', onPress: onConfirm }
      ]);
    }
  };

  // 下書きを削除
  const handleDelete = async (draft: DraftItem) => {
    showConfirmDialog(
      '下書きの削除',
      `${draft.destination}の下書きを削除しますか？`,
      async () => {
        try {
          const updatedDrafts = drafts.filter(item => item.id !== draft.id);
          await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updatedDrafts));
          setDrafts(updatedDrafts);
          if (Platform.OS === 'web') {
            alert('下書きが削除されました');
          } else {
            Alert.alert('削除完了', ALERT_MESSAGES.SUCCESS.DRAFT_DELETED);
          }
        } catch (error) {
          console.error('下書きの削除エラー:', error);
          if (Platform.OS === 'web') {
            alert('下書きの削除に失敗しました');
          } else {
            Alert.alert('エラー', ALERT_MESSAGES.ERROR.DELETE_FAILED);
          }
        }
      }
    );
  };

  const handleEdit = (draft: DraftItem) => {
    showConfirmDialog(
      '修正',
      `${draft.destination}の下書きを修正しますか？`,
      () => {
        // 新規作成画面に下書きデータを渡して遷移
        (navigation as any).navigate('new', { 
          draftData: draft.data,
          draftId: draft.id 
        });
      }
    );
  };

  const handleDuplicate = async (draft: DraftItem) => {
    showConfirmDialog(
      '複製',
      `${draft.destination}の下書きを複製しますか？`,
      async () => {
        try {
          const newDraft: DraftItem = {
            id: Date.now().toString(),
            destination: draft.destination,
            updateDate: new Date().toISOString().split('T')[0],
            data: { ...draft.data }
          };
          
          const updatedDrafts = [...drafts, newDraft];
          await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updatedDrafts));
          setDrafts(updatedDrafts);
          if (Platform.OS === 'web') {
            alert('下書きが複製されました');
          } else {
            Alert.alert('複製完了', ALERT_MESSAGES.SUCCESS.DRAFT_DUPLICATED);
          }
        } catch (error) {
          console.error('下書きの複製エラー:', error);
          if (Platform.OS === 'web') {
            alert('下書きの複製に失敗しました');
          } else {
            Alert.alert('エラー', ALERT_MESSAGES.ERROR.DUPLICATE_FAILED);
          }
        }
      }
    );
  };

  const renderDraftItem = (draft: DraftItem) => (
    <Card 
      key={draft.id}
      containerStyle={{
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 左側：コンテンツ詳細 */}
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text h4 style={{ marginBottom: 4, color: '#333' }}>
            {draft.destination} 出張
          </Text>
          <Text style={{ color: '#666', fontSize: 14 }}>
            更新日 : {draft.updateDate}
          </Text>
        </View>

        {/* 右側：アクションボタン */}
        <View style={{ alignItems: 'flex-end' }}>
          <Button
            title={BUTTON_TEXTS.EDIT}
            type="clear"
            titleStyle={{ color: '#4CAF50', fontSize: 18, fontWeight: '500' }}
            onPress={() => handleEdit(draft)}
            buttonStyle={{ paddingHorizontal: 0 }}
          />
          
          <Button
            title={BUTTON_TEXTS.DELETE}
            type="clear"
            titleStyle={{ color: '#F44336', fontSize: 18, fontWeight: '500' }}
            onPress={() => handleDelete(draft)}
            buttonStyle={{ paddingHorizontal: 0 }}
          />
          
          <Button
            title={BUTTON_TEXTS.DUPLICATE}
            type="clear"
            titleStyle={{ color: '#2196F3', fontSize: 18, fontWeight: '500' }}
            onPress={() => handleDuplicate(draft)}
            buttonStyle={{ paddingHorizontal: 0 }}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          {drafts.length > 0 ? (
            drafts.map(renderDraftItem)
          ) : (
            <Card 
              containerStyle={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 60,
                backgroundColor: 'transparent',
                borderWidth: 0,
                shadowOpacity: 0,
                elevation: 0,
              }}
            >
              <Text style={{ fontSize: 16, color: '#999', textAlign: 'center' }}>
                下書きがありません
              </Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
