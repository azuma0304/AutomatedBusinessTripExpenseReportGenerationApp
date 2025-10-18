import { Button } from '@rneui/base'
import React from 'react'

interface AddOtherTransportButtonProps {
    handleAddOtherTransportItem: () => void;
}

const AddOtherTransportButton: React.FC<AddOtherTransportButtonProps> = ({ handleAddOtherTransportItem }) => {
    return (
        <>
            <Button
                title="+ 移動手段の情報を追加"
                buttonStyle={{ backgroundColor: "green" }}
                onPress={handleAddOtherTransportItem}
            />
        </>
    )
}

export default AddOtherTransportButton
