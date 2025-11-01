import { Button, Card } from '@rneui/base'
import React from 'react'
import { Alert, Platform } from 'react-native'

const ReceiptInput = () => {
    const showConfirmDialog = (title: string, message: string) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n${message}`)) {
                // ユーザーがOKをクリックした場合の処理
                // 開発途中なので何もしない
            }
        } else {
            Alert.alert(title, message, [
                { text: 'OK' }
            ]);
        }
    };

    const handleCameraPress = () => {
        showConfirmDialog(
            '開発中',
            'この機能は現在開発中です。'
        );
    };

    const handlePhotoLibraryPress = () => {
        showConfirmDialog(
            '開発中',
            'この機能は現在開発中です。'
        );
    };

    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>
                <Card.Title h4 style={{ fontWeight: 'bold' }}>領収書の添付</Card.Title>
                <Button 
                    title="+ カメラを起動" 
                    buttonStyle={{ backgroundColor: "green", marginBottom: 10 }} 
                    onPress={handleCameraPress}
                />
                <Button 
                    title="+ 写真フォルダから選択" 
                    buttonStyle={{ backgroundColor: "black" }} 
                    onPress={handlePhotoLibraryPress}
                />
            </Card>
        </>
    )
}

export default ReceiptInput
