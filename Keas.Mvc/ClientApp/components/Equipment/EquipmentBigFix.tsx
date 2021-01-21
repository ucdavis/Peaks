import * as React from 'react';
import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import EquipmentManagedSystemSearchId from './EquipmentManagedSystemSearchId';

interface IProps {
  bigfixId: string;
  addBigFixId: (property: string, id: string) => void;
  disableEditing: boolean;
}

const EquipmentBigFix = (props: IProps) => {
  const renderBigFixInfoOrSearchId = () => {
    if (!props.bigfixId) {
      if (props.disableEditing) {
        return (
          <span className='ml-3'>
            ( Click Edit Equipment above to search for Bigfix Id )
          </span>
        );
      }
      // if editing is enabled
      return <EquipmentManagedSystemSearchId addManagedSystemId={props.addBigFixId} />;
    }

    // if Bigfix Id exists
    return <EquipmentManagedSystemInfo managedSystemId={props.bigfixId} />;
  };

  return (
    <>
      <div className='d-flex'>
        <label> Bigfix Id</label>
        <span />
        {renderBigFixInfoOrSearchId()}
      </div>
    </>
  );
};

export default EquipmentBigFix;
