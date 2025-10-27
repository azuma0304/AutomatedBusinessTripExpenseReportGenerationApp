import { Card, Text } from '@rneui/themed'
import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View, Modal, FlatList } from 'react-native'
import { LodgingDetailSchema } from '../../../schemas/user-schema'
import { LODGING_CATEGORY_LIST, BACKGROUND_COLORS, BORDER_COLORS, TEXT_COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants'
import { z } from 'zod'

interface LodgingDetailInputProps {
    onRemove: () => void;
    value?: any;
    onChange?: (value: any) => void;
    error?: string;
}

const LodgingDetailInput: React.FC<LodgingDetailInputProps> = ({
    onRemove,
    value,
    onChange,
    error
}) => {
    const [formData, setFormData] = useState({
        lodgingCategory: value?.lodgingCategory || '',
    });

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // リアルタイムバリデーション関数
    const validateField = (data: any) => {
        try {
            LodgingDetailSchema.parse(data);
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

    // 初回マウント時と初期値設定時の処理
    const [isInitialized, setIsInitialized] = useState(false);
    
    // 初回マウント時のバリデーション
    useEffect(() => {
        validateField(formData);
    }, []);
    
    // valueが変更された場合にformDataを初期化（初回のみ）
    useEffect(() => {
        if (value && !isInitialized) {
            const newFormData = {
                lodgingCategory: value.lodgingCategory || '',
            };
            setFormData(newFormData);
            validateField(newFormData);
            setIsInitialized(true);
        }
    }, [value, isInitialized]);

    const handleLodgingCategorySelect = (category: string) => {
        const newFormData = {
            ...formData,
            lodgingCategory: category
        };
        setFormData(newFormData);
        onChange?.(newFormData);
        setIsDropdownVisible(false);

        // リアルタイムバリデーション実行
        validateField(newFormData);
    };

    return (
        <>
            <Card containerStyle={{
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: "white",
                borderColor: "#FFB6C1",
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

                {/* 宿泊区分選択 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    宿泊区分を選択してください
                </Text>
                <TouchableOpacity
                    onPress={() => setIsDropdownVisible(true)}
                    style={{
                        backgroundColor: validationErrors.lodgingCategory ? "#ffe6e6" : "white",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 12,
                        marginBottom: 5,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: validationErrors.lodgingCategory ? "red" : "#ddd"
                    }}
                >
                    <Text style={{ fontSize: 16, color: formData.lodgingCategory ? "#000" : "#999" }}>
                        {formData.lodgingCategory || "選択してください"}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#666" }}>▼</Text>
                </TouchableOpacity>
                {validationErrors.lodgingCategory && (
                    <Text style={{
                        color: "red",
                        fontSize: 12,
                        marginTop: 5,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.lodgingCategory}
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
                                data={LODGING_CATEGORY_LIST}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#eee'
                                        }}
                                        onPress={() => handleLodgingCategorySelect(item)}
                                    >
                                        <Text style={{ fontSize: 16 }}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </Card>
        </>
    )
}

export default LodgingDetailInput