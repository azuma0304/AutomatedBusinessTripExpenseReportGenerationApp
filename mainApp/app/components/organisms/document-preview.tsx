import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
// @ts-ignore - react-native-webviewの型定義が未インストールの場合
import { WebView } from 'react-native-webview';
import { Card, Text } from '@rneui/themed';

interface DocumentPreviewProps {
  documentUrl: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ documentUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('ドキュメントの読み込みに失敗しました');
    setLoading(false);
  };

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Card containerStyle={{ margin: 20 }}>
          <Text style={{ fontSize: 16, color: '#ff0000', textAlign: 'center', padding: 20 }}>
            {error}
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1,
        }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>読み込み中...</Text>
        </View>
      )}
      <WebView
        source={{ uri: documentUrl }}
        style={{ flex: 1 }}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        startInLoadingState={true}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

export default DocumentPreview;

