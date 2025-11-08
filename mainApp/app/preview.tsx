import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DocumentPreview from './components/organisms/document-preview';
import { Button } from '@rneui/themed';

export default function PreviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // React Navigationのroute.paramsからdocumentUrlを取得
  const documentUrl = (route.params as { documentUrl?: string })?.documentUrl;

  if (!documentUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Button
            title="戻る"
            onPress={() => navigation.goBack()}
            buttonStyle={{ backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 30 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DocumentPreview documentUrl={documentUrl} />
    </SafeAreaView>
  );
}

