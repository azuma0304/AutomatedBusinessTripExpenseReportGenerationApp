import React from 'react'
import { Card, Text } from '@rneui/themed'

export const PublicWebTransportDetailInput = () => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 10,
                borderRadius: 10,
                backgroundColor: "pink",
                borderColor: "red",
            }}>
                <Text
                    style={{ fontSize: 18, color: "red", alignSelf: "flex-end" }}
                >
                    ✕
                </Text>

                <Card.Title style={{ fontWeight: 'bold' }}>日付を選択してください</Card.Title>
            </Card >
        </>
    )
}
