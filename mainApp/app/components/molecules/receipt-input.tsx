import { Button, Card } from '@rneui/base'
import React from 'react'

const ReceiptInput = () => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>
                <Card.Title h4 style={{ fontWeight: 'bold' }}>領収書の添付</Card.Title>
                <Button title="+ カメラを起動" buttonStyle={{ backgroundColor: "green", marginBottom: 10 }} />
                <Button title="+ 写真フォルダから選択" buttonStyle={{ backgroundColor: "black" }} />
            </Card>
        </>
    )
}

export default ReceiptInput
