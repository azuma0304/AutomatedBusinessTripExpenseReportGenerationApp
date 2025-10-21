import { Button } from '@rneui/base'
import React from 'react'

export interface SubmitConfirmationButtonProps {
    onPress?: () => void;
}

const SubmitConfirmationButton: React.FC<SubmitConfirmationButtonProps> = ({ onPress }) => {
    return (
        <Button 
            title="最終確認" 
            buttonStyle={{ backgroundColor: "red", marginBottom: 10 }} 
            onPress={onPress}
        />
    )
}

export default SubmitConfirmationButton
