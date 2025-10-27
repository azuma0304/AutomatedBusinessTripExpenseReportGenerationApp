import { Card, Input, Text, Button } from '@rneui/base'
import React, { useState, useEffect } from 'react'
import { Platform, TouchableOpacity, Modal, ScrollView, View } from 'react-native'
import { ReturnDateSchema } from '../../../schemas/user-schema'

interface ArrivalDateInputProps {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

const ArrivalDateInput: React.FC<ArrivalDateInputProps> = ({
    value = '',
    onChange,
    error
}) => {
    const [validationError, setValidationError] = useState<string>('');
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(value);
    const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
    const previousValueRef = React.useRef<string>(value);

    // 日付を文字列にフォーマット
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    // リアルタイムバリデーション
    const validateField = (inputValue: string) => {
        try {
            ReturnDateSchema.parse(inputValue);
            setValidationError('');
            return true;
        } catch (error: any) {
            if (error.issues && error.issues.length > 0) {
                setValidationError(error.issues[0].message);
            }
            return false;
        }
    };

    // 初回マウント時のバリデーション
    useEffect(() => {
        validateField(value);
        setInputValue(value);
        if (value) setSelectedDate(new Date(value));
    }, []);

    // valueが変更された場合（下書き読み込み時など）、inputValueを更新
    useEffect(() => {
        if (value !== previousValueRef.current) {
            previousValueRef.current = value;
            setInputValue(value);
            if (value) setSelectedDate(new Date(value));
            validateField(value);
        }
    }, [value]);

    const showDatePicker = () => {
        setShowPicker(true);
    };

    const confirmDate = () => {
        const formattedDate = formatDate(selectedDate);
        setInputValue(formattedDate);
        onChange?.(formattedDate);
        validateField(formattedDate);
        setShowPicker(false);
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

    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>
                <Card.Title h4 style={{ fontWeight: 'bold' }}>帰着日を選択してください</Card.Title>
                
                <TouchableOpacity onPress={showDatePicker}>
                    <Input
                        placeholder="例：2025/10/05"
                        value={inputValue}
                        editable={false}
                        containerStyle={{ marginBottom: 0 }}
                        inputContainerStyle={{
                            backgroundColor: validationError ? "#ffe6e6" : "white",
                            borderWidth: 1,
                            borderColor: validationError ? "red" : "#ddd",
                            borderRadius: 8,
                            paddingHorizontal: 10
                        }}
                        inputStyle={{
                            paddingHorizontal: 10,
                            color: value ? '#000' : '#999'
                        }}
                        rightIcon={{
                            name: 'calendar',
                            type: 'font-awesome',
                            color: '#666'
                        }}
                    />
                </TouchableOpacity>

                {showPicker && (
                    <Modal
                        visible={showPicker}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                            <Card containerStyle={{ width: '90%', borderRadius: 15, maxHeight: '80%' }}>
                                <Card.Title h4>帰着日を選択</Card.Title>
                                
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
                                    onPress={() => setShowPicker(false)}
                                    buttonStyle={{ backgroundColor: 'gray' }}
                                />
                            </Card>
                        </View>
                    </Modal>
                )}

                {validationError && (
                    <Text style={{
                        color: "red",
                        fontSize: 12,
                        marginTop: -15,
                        marginLeft: 10,
                        marginBottom: 10
                    }}>
                        {validationError}
                    </Text>
                )}
            </Card>
        </>
    )
}

export default ArrivalDateInput