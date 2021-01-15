import * as React from 'react';
import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import EquipmentManagedSystemSearchId from './EquipmentManagedSystemSearchId';

interface IProps {
  managedSystemId: string;
  addManagedSystemId: (property: string, id: string) => void;
  disableEditing: boolean;
}

const EquipmentManagedSystyem = (props: IProps) => {
  const renderManagedSystemInfoOrSearchId = () => {
    if (!props.managedSystemId) {
      if (props.disableEditing) {
        return (
          <span className='ml-3'>
            ( Click Edit Equipment above to search for ManagedSystem Id )
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

    // if ManagedSystem Id exists
    return (
      <EquipmentManagedSystemInfo managedSystemId={props.managedSystemId} />
    );
  };

  return (
    <>
      <div className='d-flex'>
        <label> ManagedSystem Id</label>
        <span />
        {renderManagedSystemInfoOrSearchId()}
      </div>
    </>
  );
};

export default EquipmentManagedSystyem;
