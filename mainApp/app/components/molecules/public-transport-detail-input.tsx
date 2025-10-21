import React, { useState, useEffect } from 'react'
import { Card, Text, Input, Button } from '@rneui/themed'
import { TouchableOpacity, View, Linking, Modal, FlatList } from 'react-native'
import { PublicTransportDetailSchema } from '../../../schemas/user-schema'
import { z } from 'zod'

interface PublicWebTransportDetailInputProps {
  onRemove: () => void;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

const PublicWebTransportDetailInput: React.FC<PublicWebTransportDetailInputProps> = ({ 
    onRemove, 
    value, 
    onChange, 
    error 
}) => {
    const [formData, setFormData] = useState({
        date: value?.date || '',
        transportMethod: value?.transportMethod || '',
        departure: value?.departure || '',
        arrival: value?.arrival || '',
        oneWayFare: value?.oneWayFare || '',
    });

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // 初期バリデーション実行
    useEffect(() => {
        validateField(formData);
    }, []);

    const transportMethods = [
        '電車',
        'バス',
        '飛行機',
        'タクシー',
        'その他'
    ];

    // リアルタイムバリデーション関数
    const validateField = (data: any) => {
        try {
            PublicTransportDetailSchema.parse(data);
            setValidationErrors({});
            return true;
        } catch (error: any) {
            if (error.issues) {
                const newErrors: { [key: string]: string } = {};
                error.issues.forEach((err: any) => {
                    newErrors[err.path.join('.')] = err.message;
                });
                setValidationErrors(newErrors);
            }
            return false;
        }
    };

    const handleInputChange = (field: string, value: string) => {
        const newFormData = {
            ...formData,
            [field]: value
        };
        setFormData(newFormData);
        onChange?.(newFormData);
        
        // リアルタイムバリデーション実行
        validateField(newFormData);
    };

    const handleTransportMethodSelect = (method: string) => {
        const newFormData = {
            ...formData,
            transportMethod: method
        };
        setFormData(newFormData);
        onChange?.(newFormData);
        setIsDropdownVisible(false);
        
        // リアルタイムバリデーション実行
        validateField(newFormData);
    };

    const handleAddRoundTrip = () => {
        // 往復情報を追加する処理
        console.log('往復情報を追加');
    };

    const handleNavitimePress = () => {
        Linking.openURL('https://www.navitime.co.jp/');
    };

    return (
        <>
            <Card containerStyle={{
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: "white",
                borderColor: "red",
                borderWidth: 1,
            }}>
                {/* 削除ボタン */}
                <TouchableOpacity onPress={onRemove} style={{ alignSelf: "flex-end", marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, color: "red" }}>✕</Text>
                </TouchableOpacity>

                {/* エラー表示 */}
                {error && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginBottom: 10,
                        textAlign: "center"
                    }}>
                        {error}
                    </Text>
                )}

                {/* 日付選択 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    日付を選択してください
                </Text>
                <Input
                    placeholder="例 : 2025/05/06"
                    value={formData.date}
                    onChangeText={(text) => handleInputChange('date', text)}
                    containerStyle={{ marginBottom: 0 }}
                    inputContainerStyle={{
                        backgroundColor: validationErrors.date ? "#ffe6e6" : "#f5f5f5",
                        borderWidth: 1,
                        borderColor: validationErrors.date ? "red" : "#ddd",
                        borderRadius: 8,
                        paddingHorizontal: 10
                    }}
                    inputStyle={{ 
                        paddingHorizontal: 10
                    }}
                />
                {validationErrors.date && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginTop: -15,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.date}
                    </Text>
                )}

                {/* 交通手段選択 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    交通手段を選択してください
                </Text>
                <TouchableOpacity
                    onPress={() => setIsDropdownVisible(true)}
                    style={{
                        backgroundColor: validationErrors.transportMethod ? "#ffe6e6" : "#f5f5f5",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 12,
                        marginBottom: 5,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: validationErrors.transportMethod ? "red" : "#ddd"
                    }}
                >
                    <Text style={{ fontSize: 16, color: formData.transportMethod ? "#000" : "#999" }}>
                        {formData.transportMethod || "選択してください"}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#666" }}>▼</Text>
                </TouchableOpacity>
                {validationErrors.transportMethod && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginTop: 5,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.transportMethod}
                    </Text>
                )}

                {/* ドロップダウンモーダル */}
                <Modal
                    visible={isDropdownVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsDropdownVisible(false)}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        activeOpacity={1}
                        onPress={() => setIsDropdownVisible(false)}
                    >
                        <View
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 8,
                                padding: 10,
                                width: '80%',
                                maxHeight: '50%'
                            }}
                        >
                            <FlatList
                                data={transportMethods}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#eee'
                                        }}
                                        onPress={() => handleTransportMethodSelect(item)}
                                    >
                                        <Text style={{ fontSize: 16 }}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* 発地入力 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    発地を入力してください
                </Text>
                <Input
                    placeholder="例 : 東京"
                    value={formData.departure}
                    onChangeText={(text) => handleInputChange('departure', text)}
                    containerStyle={{ marginBottom: 0 }}
                    inputContainerStyle={{
                        backgroundColor: validationErrors.departure ? "#ffe6e6" : "#f5f5f5",
                        borderWidth: 1,
                        borderColor: validationErrors.departure ? "red" : "#ddd",
                        borderRadius: 8,
                        paddingHorizontal: 10
                    }}
                    inputStyle={{ 
                        paddingHorizontal: 10
                    }}
                />
                {validationErrors.departure && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginTop: -15,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.departure}
                    </Text>
                )}

                {/* 着地入力 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    着地を入力してください
                </Text>
                <Input
                    placeholder="例 : 名古屋"
                    value={formData.arrival}
                    onChangeText={(text) => handleInputChange('arrival', text)}
                    containerStyle={{ marginBottom: 0 }}
                    inputContainerStyle={{
                        backgroundColor: validationErrors.arrival ? "#ffe6e6" : "#f5f5f5",
                        borderWidth: 1,
                        borderColor: validationErrors.arrival ? "red" : "#ddd",
                        borderRadius: 8,
                        paddingHorizontal: 10
                    }}
                    inputStyle={{ 
                        paddingHorizontal: 10
                    }}
                />
                {validationErrors.arrival && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginTop: -15,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.arrival}
                    </Text>
                )}

                {/* 片道の交通費入力 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    「片道の交通費」を入力してください
                </Text>
                <Input
                    placeholder="例 : 360"
                    value={formData.oneWayFare}
                    onChangeText={(text) => handleInputChange('oneWayFare', text)}
                    containerStyle={{ marginBottom: 0 }}
                    inputContainerStyle={{
                        backgroundColor: validationErrors.oneWayFare ? "#ffe6e6" : "#f5f5f5",
                        borderWidth: 1,
                        borderColor: validationErrors.oneWayFare ? "red" : "#ddd",
                        borderRadius: 8,
                        paddingHorizontal: 10
                    }}
                    inputStyle={{ 
                        paddingHorizontal: 10
                    }}
                    keyboardType="numeric"
                />
                {validationErrors.oneWayFare && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginTop: -15,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.oneWayFare}
                    </Text>
                )}

                {/* 交通費検索用URL */}
                <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    marginBottom: 15 
                }}>
                    <Text style={{ fontSize: 14, marginRight: 5 }}>
                        交通費検索用URL :
                    </Text>
                    <TouchableOpacity onPress={handleNavitimePress}>
                        <Text style={{ 
                            color: "blue", 
                            textDecorationLine: "underline",
                            fontSize: 14
                        }}>
                            NAVITIME
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 往復ボタン */}
                <Button
                    title="+ 往復"
                    onPress={handleAddRoundTrip}
                    buttonStyle={{
                        backgroundColor: "#007AFF",
                        borderRadius: 8,
                        paddingVertical: 12
                    }}
                    titleStyle={{ fontSize: 16, fontWeight: "bold" }}
                />
            </Card>
        </>
    )
}

export default PublicWebTransportDetailInput
