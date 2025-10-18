import { Card, Input } from '@rneui/base'
import React from 'react'

const BusinessDestinationInput = () => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>
                <Card.Title h4 style={{ fontWeight: 'bold' }}>出張先を入力してください</Card.Title>
                <Input placeholder="例：東京都立病院" />
            </Card>
        </>
    )
}

export default BusinessDestinationInput
