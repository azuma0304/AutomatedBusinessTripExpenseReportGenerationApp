import { Button } from '@rneui/base'
import React from 'react'
import { BUTTON_COLORS, BUTTON_TEXTS } from '../../constants'

interface DraftSaveButtonProps {
  onPress: () => void;
}

const DraftSaveButton: React.FC<DraftSaveButtonProps> = ({ onPress }) => {
    return (
        <>
            <Button 
              title={BUTTON_TEXTS.DRAFT_SAVE} 
              buttonStyle={{ backgroundColor: BUTTON_COLORS.DRAFT_SAVE }} 
              onPress={onPress}
            />
        </>
    )
}

export default DraftSaveButton
