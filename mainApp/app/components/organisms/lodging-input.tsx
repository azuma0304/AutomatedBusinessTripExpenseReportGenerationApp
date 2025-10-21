import React from 'react'
import { Card } from '@rneui/base'
import LodgingDetailInput from '../molecules/lodging-detail-input'
import AddLodgingButton from '../atoms/add-lodging-button'

interface LodgingInputProps {
    lodgingEntryIds: number[];
    lodgingDetails: any[];
    handleAddLodgingItem: () => void;
    removeLodgingItem: (indexToRemove: number) => void;
    handleLodgingChange: (index: number, value: any) => void;
    detailErrors: { [key: string]: { [key: string]: string } };
}

const LodgingInput: React.FC<LodgingInputProps> = ({
    lodgingEntryIds,
    lodgingDetails,
    handleAddLodgingItem,
    removeLodgingItem,
    handleLodgingChange,
    detailErrors
}) => {
    return (
        <>
            <Card containerStyle={{
                marginBottom: 15,
                borderRadius: 15,
            }}>
                <Card.Title h4 style={{ fontWeight: 'bold' }}>宿泊区分及び日数を入力</Card.Title>
        {lodgingEntryIds.map((_, index) => (
            <LodgingDetailInput
                key={index}
                onRemove={() => removeLodgingItem(index)}
                value={lodgingDetails[index]}
                onChange={(value) => handleLodgingChange(index, value)}
                error={detailErrors.lodging?.[index]}
            />
        ))}
                <AddLodgingButton handleAddLodgingItem={handleAddLodgingItem} />
            </Card>
        </>
    )
}

export default LodgingInput
