import React from 'react'
import { Card } from '@rneui/base'
import DailyAllowanceDetailInput from '../molecules/daily-allowance-detail-input'
import AddDailyAllowanceButton from '../atoms/add-daily-allowance-button'

interface DailyAllowanceInputProps {
    dailyAllowanceEntryIds: number[];
    handleAddDailyAllowanceItem: () => void;
    removeDailyAllowanceItem: (indexToRemove: number) => void;
}

const DailyAllowanceInput: React.FC<DailyAllowanceInputProps> = ({
    dailyAllowanceEntryIds,
    handleAddDailyAllowanceItem,
    removeDailyAllowanceItem
}) => {
  return (
    <>
      <Card containerStyle={{
        marginBottom: 15,
        borderRadius: 15,
      }}>
        <Card.Title h4 style={{ fontWeight: 'bold' }}>日当区分及び宿泊日数の入力</Card.Title>
        {dailyAllowanceEntryIds.map((_, index) => (
          <DailyAllowanceDetailInput
            key={index}
            onRemove={() => removeDailyAllowanceItem(index)}
          />
        ))}
        <AddDailyAllowanceButton handleAddDailyAllowanceItem={handleAddDailyAllowanceItem} />
      </Card>
    </>
  )
}

export default DailyAllowanceInput
