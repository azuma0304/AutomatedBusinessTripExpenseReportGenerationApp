import React from 'react'
import { Card } from '@rneui/base'
import LodgingDetailInput from '../molecules/lodging-detail-input'
import AddLodgingButton from '../atoms/add-lodging-button'

interface LodgingInputProps {
    lodgingEntryIds: number[];
    handleAddLodgingItem: () => void;
    removeLodgingItem: (indexToRemove: number) => void;
}

const LodgingInput: React.FC<LodgingInputProps> = ({
    lodgingEntryIds,
    handleAddLodgingItem,
    removeLodgingItem
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
                    />
                ))}
                <AddLodgingButton handleAddLodgingItem={handleAddLodgingItem} />
            </Card>
        </>
    )
}

export default LodgingInput
