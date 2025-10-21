import React from 'react'
import { Card } from '@rneui/base'
import DailyAllowanceDetailInput from '../molecules/daily-allowance-detail-input'
import AddDailyAllowanceButton from '../atoms/add-daily-allowance-button'

interface DailyAllowanceInputProps {
    dailyAllowanceEntryIds: number[];
    dailyAllowanceDetails: any[];
    handleAddDailyAllowanceItem: () => void;
    removeDailyAllowanceItem: (indexToRemove: number) => void;
    handleDailyAllowanceChange: (index: number, value: any) => void;
    detailErrors: { [key: string]: { [key: string]: string } };
}

const DailyAllowanceInput: React.FC<DailyAllowanceInputProps> = ({
    dailyAllowanceEntryIds,
    dailyAllowanceDetails,
    handleAddDailyAllowanceItem,
    removeDailyAllowanceItem,
    handleDailyAllowanceChange,
    detailErrors
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
            value={dailyAllowanceDetails[index]}
            onChange={(value) => handleDailyAllowanceChange(index, value)}
            error={detailErrors.dailyAllowance?.[index]}
          />
        ))}
        <AddDailyAllowanceButton handleAddDailyAllowanceItem={handleAddDailyAllowanceItem} />
      </Card>
    </>
  )
}

export default DailyAllowanceInput
