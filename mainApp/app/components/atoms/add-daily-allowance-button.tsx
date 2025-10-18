import { Button } from '@rneui/base'
import React from 'react'

interface AddDailyAllowanceButtonProps {
    handleAddDailyAllowanceItem: () => void
}

const AddDailyAllowanceButton: React.FC<AddDailyAllowanceButtonProps> = ( {handleAddDailyAllowanceItem} ) => {
    return (
        <>
            <Button 
            onPress={handleAddDailyAllowanceItem}
            title="+ 日当区分を追加" 
            buttonStyle={{ backgroundColor: "green" }} />
        </>
    )
}

export default AddDailyAllowanceButton
