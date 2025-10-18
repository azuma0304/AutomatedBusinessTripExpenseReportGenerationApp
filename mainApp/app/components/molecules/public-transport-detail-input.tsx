import React from 'react'
import { Card, Text } from '@rneui/themed'
import { TouchableOpacity } from 'react-native'

interface PublicWebTransportDetailInputProps {
  onRemove: () => void;
}

const PublicWebTransportDetailInput: React.FC<PublicWebTransportDetailInputProps> = ({ onRemove }) => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: "pink",
                borderColor: "red",
            }}>
                <TouchableOpacity onPress={onRemove} style={{ alignSelf: "flex-end" }}>
                    <Text
                        style={{ fontSize: 18, color: "red" }}
                    >
                        ✕
                    </Text>
                </TouchableOpacity>

                <Card.Title style={{ fontWeight: 'bold' }}>日付を選択してください</Card.Title>
            </Card >
        </>
    )
}

export default PublicWebTransportDetailInput
