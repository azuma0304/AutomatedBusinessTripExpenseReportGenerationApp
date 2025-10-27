import React from 'react';
import { Button } from '@rneui/themed';
import { BUTTON_COLORS, BUTTON_TEXTS } from '../../constants';

interface DraftUpdateButtonProps {
  onPress: () => void;
}

export default function DraftUpdateButton({ onPress }: DraftUpdateButtonProps) {
  return (
    <Button
      title={BUTTON_TEXTS.DRAFT_UPDATE}
      onPress={onPress}
      buttonStyle={{
        backgroundColor: BUTTON_COLORS.WARNING,
        borderRadius: 8,
        paddingVertical: 12,
        marginVertical: 8,
      }}
      titleStyle={{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
      }}
    />
  );
}
