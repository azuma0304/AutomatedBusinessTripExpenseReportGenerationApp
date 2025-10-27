import { Card, Text } from '@rneui/themed'
import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View, Modal, FlatList } from 'react-native'
import { DailyAllowanceDetailSchema } from '../../../schemas/user-schema'
import { z } from 'zod'
import { DAILY_ALLOWANCE_CATEGORIES, BACKGROUND_COLORS, BORDER_COLORS, TEXT_COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants'

interface DailyAllowanceDetailInputProps {
    onRemove: () => void;
    value?: any;
    onChange?: (value: any) => void;
    error?: string;
}

const DailyAllowanceDetailInput: React.FC<DailyAllowanceDetailInputProps> = ({ 
    onRemove, 
    value, 
    onChange, 
    error 
}) => {
    const [formData, setFormData] = useState({
        dailyAllowanceCategory: value?.dailyAllowanceCategory || '',
    });

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const dailyAllowanceCategories = DAILY_ALLOWANCE_CATEGORIES;

    // リアルタイムバリデーション関数
    const validateField = (data: any) => {
        try {
            DailyAllowanceDetailSchema.parse(data);
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
                dailyAllowanceCategory: value.dailyAllowanceCategory || '',
            };
            setFormData(newFormData);
            validateField(newFormData);
            setIsInitialized(true);
        }
    }, [value, isInitialized]);

    const handleCategorySelect = (category: string) => {
        const newFormData = {
            ...formData,
            dailyAllowanceCategory: category
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
                borderColor: "#DDA0DD", // 薄い紫色
                borderWidth: 1,
            }}>
                {/* 削除ボタン */}
                <TouchableOpacity onPress={onRemove} style={{ alignSelf: "flex-end", marginBottom: 10 }}>
                    <Text style={{ fontSize: 18, color: "red" }}>✕</Text>
                </TouchableOpacity>

                {/* 日当区分選択 */}
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    日当区分を選択してください
                </Text>
                <TouchableOpacity
                    onPress={() => setIsDropdownVisible(true)}
                    style={{
                        backgroundColor: validationErrors.dailyAllowanceCategory ? "#ffe6e6" : "white",
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 12,
                        marginBottom: 5,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: validationErrors.dailyAllowanceCategory ? "red" : "#ddd"
                    }}
                >
                    <Text style={{ fontSize: 16, color: formData.dailyAllowanceCategory ? "#000" : "#999" }}>
                        {formData.dailyAllowanceCategory || "選択してください"}
                    </Text>
                    <Text style={{ fontSize: 16, color: "#666" }}>▼</Text>
                </TouchableOpacity>
                {validationErrors.dailyAllowanceCategory && (
                    <Text style={{ 
                        color: "red", 
                        fontSize: 12, 
                        marginTop: 5,
                        marginLeft: 10,
                        marginBottom: 15
                    }}>
                        {validationErrors.dailyAllowanceCategory}
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
                                data={dailyAllowanceCategories}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            padding: 15,
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#eee'
                                        }}
                                        onPress={() => handleCategorySelect(item)}
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

export default DailyAllowanceDetailInput