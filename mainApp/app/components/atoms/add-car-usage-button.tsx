import { Button } from '@rneui/base'
import React from 'react'

interface AddCarUsageButtonProps {
    handleAddCarUsageItem: () => void;
}

const AddCarUsageButton: React.FC<AddCarUsageButtonProps> = ({ handleAddCarUsageItem }) => {
    return (
        <>
            <Button
                title="+ 車両利用の情報を追加"
                buttonStyle={{ backgroundColor: "green", marginBottom: 10 }}
                onPress={handleAddCarUsageItem}
            />
        </>
    )
}

export default AddCarUsageButton
