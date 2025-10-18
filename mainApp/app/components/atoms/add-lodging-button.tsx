import { Button } from '@rneui/base'
import React from 'react'

interface AddLodgingButtonProps {
    handleAddLodgingItem: () => void;
}

const AddLodgingButton: React.FC<AddLodgingButtonProps> = ( {handleAddLodgingItem} ) => {
    return (
        <>
            <Button 
            onPress={handleAddLodgingItem}
            title="+ 宿泊区分を追加" 
            buttonStyle={{ backgroundColor: "green" }} 
            />
        </>
    )
}

export default AddLodgingButton
