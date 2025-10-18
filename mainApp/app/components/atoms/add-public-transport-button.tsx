import { Button } from '@rneui/base'
import React from 'react'

interface AddPublicTransportButtonProps {
  handleAddPublicTransportItem: () => void;
}

const AddPublicTransportButton: React.FC<AddPublicTransportButtonProps> = ({ handleAddPublicTransportItem }) => {
  return (
    <>
      <Button
        title="+ 公共交通機関の情報を追加"
        buttonStyle={{ backgroundColor: "green", marginBottom: 10 }}
        onPress={handleAddPublicTransportItem}
      />
    </>

  )
}

export default AddPublicTransportButton
