import { Card, Text, Input, Button } from '@rneui/themed'
import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View, Modal, FlatList, ScrollView } from 'react-native'
import { CarUsageDetailSchema } from '../../../schemas/user-schema'
import { z } from 'zod'
import { CAR_USAGE_METHODS, BACKGROUND_COLORS, BORDER_COLORS, TEXT_COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants'

interface CarUsageDetailInputProps {
    onRemove: () => void;
    value?: any;
    onChange?: (value: any) => void;
    error?: string;
}

interface ExpenseItem {
    id: string;
    amount: string;
}

const CarUsageDetailInput: React.FC<CarUsageDetailInputProps> = ({
    onRemove, 
    value, 
    onChange, 
    error 
}) => {
    const [formData, setFormData] = useState({
        date: value?.date || '',
        transportMethod: value?.transportMethod || 'レンタカー',
        departure: value?.departure || '',
        arrival: value?.arrival || '',
        distance: value?.distance || '',
        rentalFee: value?.rentalFee || '',
    });

    const [expenses, setExpenses] = useState<{
        tolls: ExpenseItem[];
        gasoline: ExpenseItem[];
        parking: ExpenseItem[];
    }>({
        tolls: value?.tolls || [],
        gasoline: value?.gasoline || [],
        parking: value?.parking || [],
    });

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date>(formData.date ? new Date(formData.date) : new Date());

    // 初回マウント時と初期値設定時の処理
    const [isInitialized, setIsInitialized] = useState(false);
    
    // 初回マウント時のバリデーション
    useEffect(() => {
        validateField({ ...formData, ...expenses });
    }, []);
    
    // valueが変更された場合にformDataを初期化（初回のみ）
    useEffect(() => {
        if (value && !isInitialized) {
            const newFormData = {
                date: value.date || '',
                transportMethod: value.transportMethod || '',
                departure: value.departure || '',
                arrival: value.arrival || '',
                distance: value.distance || '',
                rentalFee: value.rentalFee || '',
            };
            const newExpenses = {
                tolls: value.tolls || [],
                gasoline: value.gasoline || [],
                parking: value.parking || [],
            };
            setFormData(newFormData);
            setExpenses(newExpenses);
            validateField({ ...newFormData, ...newExpenses });
            setIsInitialized(true);
        }
    }, [value, isInitialized]);

    const transportMethods = CAR_USAGE_METHODS;

    // 日付を文字列にフォーマット
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };

    const confirmDate = () => {
        const formattedDate = formatDate(selectedDate);
        handleInputChange('date', formattedDate);
        setShowDatePicker(false);
    };

    // 年、月、日の選択肢を生成
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const updateDate = (year?: number, month?: number, day?: number) => {
        const newDate = new Date(selectedDate);
        if (year !== undefined) newDate.setFullYear(year);
        if (month !== undefined) newDate.setMonth(month - 1);
        if (day !== undefined) newDate.setDate(day);
        setSelectedDate(newDate);
    };

    // リアルタイムバリデーション関数
    const validateField = (data: any) => {
        try {
            CarUsageDetailSchema.parse(data);
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
        onChange?.({ ...newFormData, ...expenses });
        
        // リアルタイムバリデーション実行
        validateField({ ...newFormData, ...expenses });
    };

    const handleTransportMethodSelect = (method: string) => {
        const newFormData = {
            ...formData,
            transportMethod: method
        };
        setFormData(newFormData);
        onChange?.({ ...newFormData, ...expenses });
        setIsDropdownVisible(false);
        
        // リアルタイムバリデーション実行
        validateField({ ...newFormData, ...expenses });
    };

    const addExpenseItem = (type: 'tolls' | 'gasoline' | 'parking') => {
        const newItem: ExpenseItem = {
            id: Date.now().toString(),
            amount: '',
        };
        const newExpenses = {
            ...expenses,
            [type]: [...expenses[type], newItem]
        };
        setExpenses(newExpenses);
        onChange?.({ ...formData, ...newExpenses });
        
        // リアルタイムバリデーション実行
        validateField({ ...formData, ...newExpenses });
    };

    const removeExpenseItem = (type: 'tolls' | 'gasoline' | 'parking', id: string) => {
        const newExpenses = {
            ...expenses,
            [type]: expenses[type].filter(item => item.id !== id)
        };
        setExpenses(newExpenses);
        onChange?.({ ...formData, ...newExpenses });
        
        // リアルタイムバリデーション実行
        validateField({ ...formData, ...newExpenses });
    };

    const updateExpenseAmount = (type: 'tolls' | 'gasoline' | 'parking', id: string, amount: string) => {
        const newExpenses = {
            ...expenses,
            [type]: expenses[type].map(item => 
                item.id === id ? { ...item, amount } : item
            )
        };
        setExpenses(newExpenses);
        onChange?.({ ...formData, ...newExpenses });
        
        // リアルタイムバリデーション実行
        validateField({ ...formData, ...newExpenses });
    };

    const renderExpenseSection = (
        type: 'tolls' | 'gasoline' | 'parking',
        label: string,
        placeholder: string,
        addButtonText: string
    ) => {
        return (
            <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                    {label}
                </Text>
                
                {expenses[type].map((item, index) => {
                    const errorKey = `${type}.${index}.amount`;
                    return (
                        <View key={item.id} style={{ marginBottom: 10 }}>
                            <View style={{ 
                                flexDirection: "row", 
                                alignItems: "flex-start"
                            }}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        placeholder={placeholder}
                                        value={item.amount}
                                        onChangeText={(text) => updateExpenseAmount(type, item.id, text)}
                                        containerStyle={{ marginRight: 10, marginBottom: 0 }}
                                        inputContainerStyle={{
                                            backgroundColor: validationErrors[errorKey] ? "#ffe6e6" : "#f5f5f5",
                                            borderWidth: 1,
                                            borderColor: validationErrors[errorKey] ? "red" : "#ddd",
                                            borderRadius: 8,
                                            paddingHorizontal: 10
                                        }}
                                        inputStyle={{ 
                                            paddingHorizontal: 10
                                        }}
                                        keyboardType="numeric"
                                    />
                                    {validationErrors[errorKey] && (
                                        <Text style={{ 
                                            color: "red", 
                                            fontSize: 12, 
                                            marginTop: -15,
                                            marginLeft: 10,
                                            marginBottom: 5
                                        }}>
                                            {validationErrors[errorKey]}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity 
                                    onPress={() => removeExpenseItem(type, item.id)}
                                    style={{ paddingTop: 12 }}
                                >
                                    <Text style={{ fontSize: 18, color: "red" }}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
                
                <Button
                    title={`+ ${addButtonText}`}
                    onPress={() => addExpenseItem(type)}
                    buttonStyle={{
                        backgroundColor: "green",
                        borderRadius: 8,
                        paddingVertical: 10
                    }}
                    titleStyle={{ fontSize: 14, fontWeight: "bold" }}
                    icon={{
                        name: 'plus',
                        type: 'material-community',
                        size: 16,
                        color: 'white'
                    }}
                />
            </View>
        );
    };

    return (
        <>
            <Card containerStyle={{
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: "white",
                borderColor: "green",
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
                <TouchableOpacity onPress={showDatePickerModal}>
                    <Input
                        placeholder="例: 2025/05/06"
                        value={formData.date}
                        editable={false}
                        containerStyle={{ marginBottom: 0 }}
                        inputContainerStyle={{
                            backgroundColor: validationErrors.date ? "#ffe6e6" : "#f5f5f5",
                            borderWidth: 1,
                            borderColor: validationErrors.date ? "red" : "#ddd",
                            borderRadius: 8,
                            paddingHorizontal: 10
                        }}
                        inputStyle={{ 
                            paddingHorizontal: 10,
                            color: formData.date ? '#000' : '#999'
                        }}
                        rightIcon={{
                            name: 'calendar',
                            type: 'font-awesome',
                            color: '#666'
                        }}
                    />
                </TouchableOpacity>

                {showDatePicker && (
                    <Modal
                        visible={showDatePicker}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                            <Card containerStyle={{ width: '90%', borderRadius: 15, maxHeight: '80%' }}>
                                <Card.Title h4>日付を選択</Card.Title>
                                
                                <ScrollView style={{ maxHeight: 300 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>年</Text>
                                            <ScrollView style={{ height: 150 }}>
                                                {years.map(year => (
                                                    <TouchableOpacity
                                                        key={year}
                                                        onPress={() => updateDate(year)}
                                                        style={{
                                                            padding: 10,
                                                            backgroundColor: selectedDate.getFullYear() === year ? '#e3f2fd' : 'transparent',
                                                            borderRadius: 5,
                                                            marginBottom: 2
                                                        }}
                                                    >
                                                        <Text style={{ textAlign: 'center' }}>{year}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                        
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>月</Text>
                                            <ScrollView style={{ height: 150 }}>
                                                {months.map(month => (
                                                    <TouchableOpacity
                                                        key={month}
                                                        onPress={() => updateDate(undefined, month)}
                                                        style={{
                                                            padding: 10,
                                                            backgroundColor: selectedDate.getMonth() + 1 === month ? '#e3f2fd' : 'transparent',
                                                            borderRadius: 5,
                                                            marginBottom: 2
                                                        }}
                                                    >
                                                        <Text style={{ textAlign: 'center' }}>{month}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                        
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>日</Text>
                                            <ScrollView style={{ height: 150 }}>
                                                {days.map(day => (
                                                    <TouchableOpacity
                                                        key={day}
                                                        onPress={() => updateDate(undefined, undefined, day)}
                                                        style={{
                                                            padding: 10,
                                                            backgroundColor: selectedDate.getDate() === day ? '#e3f2fd' : 'transparent',
                                                            borderRadius: 5,
                                                            marginBottom: 2
                                                        }}
                                                    >
                                                        <Text style={{ textAlign: 'center' }}>{day}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </ScrollView>
                                
                                <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 20, fontWeight: 'bold' }}>
                                    {formatDate(selectedDate)}
                                </Text>
                                
                                <Button
                                    title="確定"
                                    onPress={confirmDate}
                                    buttonStyle={{ backgroundColor: 'red', marginBottom: 10 }}
                                />
                                <Button
                                    title="キャンセル"
                                    onPress={() => setShowDatePicker(false)}
                                    buttonStyle={{ backgroundColor: 'gray' }}
                                />
                            </Card>
                        </View>
                    </Modal>
                )}
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

                {/* レンタカーの場合 */}
                {formData.transportMethod === 'レンタカー' && (
                    <>
                        {/* 発地入力 */}
                        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                            発地を入力してください
                        </Text>
                        <Input
                            placeholder="例: 東京"
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
                            placeholder="例: 名古屋"
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

                        {/* レンタカー代金 */}
                        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                            レンタカーの代金を入力してください
                        </Text>
                        <Input
                            placeholder="例: 12000"
                            value={formData.rentalFee}
                            onChangeText={(text) => handleInputChange('rentalFee', text)}
                            containerStyle={{ marginBottom: 0 }}
                            inputContainerStyle={{
                                backgroundColor: validationErrors.rentalFee ? "#ffe6e6" : "#f5f5f5",
                                borderWidth: 1,
                                borderColor: validationErrors.rentalFee ? "red" : "#ddd",
                                borderRadius: 8,
                                paddingHorizontal: 10
                            }}
                            inputStyle={{ 
                                paddingHorizontal: 10
                            }}
                            keyboardType="numeric"
                        />
                        {validationErrors.rentalFee && (
                            <Text style={{ 
                                color: "red", 
                                fontSize: 12, 
                                marginTop: -15,
                                marginLeft: 10,
                                marginBottom: 15
                            }}>
                                {validationErrors.rentalFee}
                            </Text>
                        )}
                    </>
                )}

                {/* 自家用車の場合 */}
                {formData.transportMethod === '自家用車' && (
                    <>
                        {/* 発地入力 */}
                        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                            発地を入力してください
                        </Text>
                        <Input
                            placeholder="例: 東京"
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
                            placeholder="例: 名古屋"
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

                        {/* 移動距離入力 */}
                        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                            移動距離を入力してください（Km）
                        </Text>
                        <Input
                            placeholder="例: 30"
                            value={formData.distance}
                            onChangeText={(text) => handleInputChange('distance', text)}
                            containerStyle={{ marginBottom: 0 }}
                            inputContainerStyle={{
                                backgroundColor: validationErrors.distance ? "#ffe6e6" : "#f5f5f5",
                                borderWidth: 1,
                                borderColor: validationErrors.distance ? "red" : "#ddd",
                                borderRadius: 8,
                                paddingHorizontal: 10
                            }}
                            inputStyle={{ 
                                paddingHorizontal: 10
                            }}
                            keyboardType="numeric"
                        />
                        {validationErrors.distance && (
                            <Text style={{ 
                                color: "red", 
                                fontSize: 12, 
                                marginTop: -15,
                                marginLeft: 10,
                                marginBottom: 15
                            }}>
                                {validationErrors.distance}
                            </Text>
                        )}
                    </>
                )}

                {/* 高速料金 */}
                {renderExpenseSection(
                    'tolls',
                    '※高速を利用した場合高速料金記入',
                    '例: 2500',
                    '高速料金の追加'
                )}

                {/* ガソリン代 */}
                {renderExpenseSection(
                    'gasoline',
                    '※ガソリン代がかかった場合記入',
                    '例: 2500',
                    'ガソリン代の追加'
                )}

                {/* 駐車場代 */}
                {renderExpenseSection(
                    'parking',
                    '※駐車場代がかかった場合記入',
                    '例: 2500',
                    '駐車場代の追加'
                )}
            </Card>
        </>
    )
}

export default CarUsageDetailInput
