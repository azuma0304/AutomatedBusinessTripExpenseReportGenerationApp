import { Card, Input, Text } from '@rneui/base'
import React, { useState, useEffect } from 'react'
import { DestinationSchema } from '../../../schemas/user-schema'

interface BusinessDestinationInputProps {
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
}

const BusinessDestinationInput: React.FC<BusinessDestinationInputProps> = ({ 
    value = '', 
    onChange, 
    error 
}) => {
    const [validationError, setValidationError] = useState<string>('');

    // リアルタイムバリデーション
    const validateField = (inputValue: string) => {
        try {
            DestinationSchema.parse(inputValue);
            setValidationError('');
            return true;
        } catch (error: any) {
            if (error.issues && error.issues.length > 0) {
                setValidationError(error.issues[0].message);
            }
            return false;
        }
    };

    // 初期バリデーション実行
    useEffect(() => {
        validateField(value);
    }, []);

    const handleChange = (text: string) => {
        onChange?.(text);
        validateField(text);
    };

    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>
                <Card.Title h4 style={{ fontWeight: 'bold' }}>出張先を入力してください</Card.Title>
                <Input 
                    placeholder="例：東京都立病院" 
                    value={value}
                    onChangeText={handleChange}
                    containerStyle={{ marginBottom: 0 }}
                    inputContainerStyle={{
                        backgroundColor: validationError ? "#ffe6e6" : "white",
                        borderWidth: 1,
                        borderColor: validationError ? "red" : "#ddd",
                        borderRadius: 8,
                        paddingHorizontal: 10
                    }}
                    inputStyle={{ 
                        paddingHorizontal: 10
                    }}
                />
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

export default BusinessDestinationInput
