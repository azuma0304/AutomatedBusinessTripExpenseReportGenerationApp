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
    publicTransportDetails: any[];
    carUsageDetails: any[];
    otherTransportDetails: any[];
    handleAddPublicTransportItem: () => void;
    handleAddCarUsageItem: () => void;
    handleAddOtherTransportItem: () => void;
    removePublicTranceportItem: (indexToRemove: number) => void;
    removeCarUsageItem: (indexToRemove: number) => void;
    removeOtherTransportItem: (indexToRemove: number) => void;
    handlePublicTransportChange: (index: number, value: any) => void;
    handleCarUsageChange: (index: number, value: any) => void;
    handleOtherTransportChange: (index: number, value: any) => void;
    detailErrors: { [key: string]: { [key: string]: string } };
}

const TravelDetailInput: React.FC<TravelDetailInputProps> = ({
    publicTransportEntryIds,
    carUsageEntryIds,
    otherTransportEntryIds,
    publicTransportDetails,
    carUsageDetails,
    otherTransportDetails,
    handleAddPublicTransportItem,
    handleAddCarUsageItem,
    handleAddOtherTransportItem,
    removePublicTranceportItem,
    removeCarUsageItem,
    removeOtherTransportItem,
    handlePublicTransportChange,
    handleCarUsageChange,
    handleOtherTransportChange,
    detailErrors
}) => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>

                <Card.Title h4 style={{ fontWeight: 'bold' }}>移動した日付と詳細情報の入力</Card.Title>

                <Text style={{ color: "red", textAlign: "center", textDecorationLine: "underline", marginBottom: 5, fontWeight: 'bold'}}>
                    公共交通機関及び飛行機を利用した場合
                </Text>
                {publicTransportEntryIds.map((_, index) => (
                    <PublicWebTransportDetailInput
                        key={index}
                        onRemove={() => removePublicTranceportItem(index)}
                        value={publicTransportDetails[index]}
                        onChange={(value) => handlePublicTransportChange(index, value)}
                        error={detailErrors.publicTransport?.[index]}
                    />
                ))}
                <AddPublicTransportButton handleAddPublicTransportItem={handleAddPublicTransportItem} />

                <Text style={{ color: "green", textAlign: "center", textDecorationLine: "underline", marginBottom: 5, marginTop: 20, fontWeight: 'bold' }}>
                    レンタカーまたは自家用車を利用した場合
                </Text>
                {carUsageEntryIds.map((_, index) => (
                    <CarUsageDetailInput
                        key={index}
                        onRemove={() => removeCarUsageItem(index)}
                        value={carUsageDetails[index]}
                        onChange={(value) => handleCarUsageChange(index, value)}
                        error={detailErrors.carUsage?.[index]}
                    />
                ))}
                <AddCarUsageButton handleAddCarUsageItem={handleAddCarUsageItem} />

                <Text style={{ color: "black", textAlign: "center", textDecorationLine: "underline", marginBottom: 5,marginTop: 20, fontWeight: 'bold' }}>
                    その他
                </Text>
                {otherTransportEntryIds.map((_, index) => (
                    <OtherTransportDetailInput
                        key={index}
                        onRemove={() => removeOtherTransportItem(index)}
                        value={otherTransportDetails[index]}
                        onChange={(value) => handleOtherTransportChange(index, value)}
                        error={detailErrors.otherTransport?.[index]}
                    />
                ))}
                <AddOtherTransportButton handleAddOtherTransportItem={handleAddOtherTransportItem} />
            </Card>
        </>
    )
}

export default TravelDetailInput
