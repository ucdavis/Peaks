import * as React from 'react';
import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import EquipmentManagedSystemSearchId from './EquipmentManagedSystemSearchId';

interface IProps {
  managedSystemId: string;
  addManagedSystemId: (property: string, id: string) => void;
  disableEditing: boolean;
}

const EquipmentManagedSystyem = (props: IProps) => {
  const renderBigFixInfoOrSearchId = () => {
    if (!props.managedSystemId) {
      if (props.disableEditing) {
        return (
          <span className='ml-3'>
            ( Click Edit Equipment above to search for Bigfix Id )
          </span>
        );
      }
      // if editing is enabled
      return (
        <EquipmentManagedSystemSearchId
          addManagedSystemId={props.addManagedSystemId}
        />
      );
    }

    // if Bigfix Id exists
    return (
      <EquipmentManagedSystemInfo managedSystemId={props.managedSystemId} />
    );
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

export default EquipmentManagedSystyem;
