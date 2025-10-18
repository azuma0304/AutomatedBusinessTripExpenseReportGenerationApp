import { Card, Text } from '@rneui/base'
import React from 'react'
import PublicWebTransportDetailInput from '../molecules/public-transport-detail-input'
import AddPublicTransportButton from '../atoms/add-public-transport-button'
import CarUsageDetailInput from '../molecules/car-usage-detail-input'
import AddCarUsageButton from '../atoms/add-car-usage-button'
import OtherTransportDetailInput from '../molecules/other-transport-detail-input'
import AddOtherTransportButton from '../atoms/add-other-transport-button'

interface TravelDetailInputProps {
    publicTransportEntryIds: number[];
    carUsageEntryIds: number[];
    otherTransportEntryIds: number[];
    handleAddPublicTransportItem: () => void;
    handleAddCarUsageItem: () => void;
    handleAddOtherTransportItem: () => void;
    removePublicTranceportItem: (indexToRemove: number) => void;
    removeCarUsageItem: (indexToRemove: number) => void;
    removeOtherTransportItem: (indexToRemove: number) => void;
}

const TravelDetailInput: React.FC<TravelDetailInputProps> = ({
    publicTransportEntryIds,
    carUsageEntryIds,
    otherTransportEntryIds,
    handleAddPublicTransportItem,
    handleAddCarUsageItem,
    handleAddOtherTransportItem,
    removePublicTranceportItem,
    removeCarUsageItem,
    removeOtherTransportItem
}) => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>

                <Card.Title h4 style={{ fontWeight: 'bold' }}>移動した日付と詳細情報の入力</Card.Title>

                <Text style={{ color: "red", textAlign: "center", textDecorationLine: "underline", marginBottom: 5 }}>
                    公共交通機関及び飛行機を利用した場合
                </Text>
                {publicTransportEntryIds.map((_, index) => (
                    <PublicWebTransportDetailInput
                        key={index}
                        onRemove={() => removePublicTranceportItem(index)}
                    />
                ))}
                <AddPublicTransportButton handleAddPublicTransportItem={handleAddPublicTransportItem} />

                <Text style={{ color: "green", textAlign: "center", textDecorationLine: "underline", marginBottom: 5 }}>
                    レンタカーまたは自家用車を利用した場合
                </Text>
                {carUsageEntryIds.map((_, index) => (
                    <CarUsageDetailInput
                        key={index}
                        onRemove={() => removeCarUsageItem(index)}
                    />
                ))}
                <AddCarUsageButton handleAddCarUsageItem={handleAddCarUsageItem} />

                <Text style={{ color: "black", textAlign: "center", textDecorationLine: "underline", marginBottom: 5 }}>
                    その他
                </Text>
                {otherTransportEntryIds.map((_, index) => (
                    <OtherTransportDetailInput
                        key={index}
                        onRemove={() => removeOtherTransportItem(index)}
                    />
                ))}
                <AddOtherTransportButton handleAddOtherTransportItem={handleAddOtherTransportItem} />
            </Card>
        </>
    )
}

export default TravelDetailInput
