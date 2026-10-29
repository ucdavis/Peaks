import * as React from 'react';
import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import EquipmentManagedSystemSearchId from './EquipmentManagedSystemSearchId';

interface IProps {
  managedSystemId: string;
  addManagedSystemId: (property: string, id: string) => void;
  disableEditing: boolean;
}

const EquipmentManagedSystem = (props: IProps) => {
  const renderManagedSystemInfoOrSearchId = () => {
    if (!props.managedSystemId) {
      if (props.disableEditing) {
        return (
          <span className='ml-3'>
            ( Click Edit Equipment above to search for Managed System Id )
          </span>
        );
      }
      // if editing is enabled
      return <EquipmentManagedSystemSearchId addManagedSystemId={props.addManagedSystemId} />;
    }

    // if Managed System Id exists
    return <EquipmentManagedSystemInfo managedSystemId={props.managedSystemId} />;
  };

  return (
    <>
      <div className='flex flex-wrap items-center gap-2'>
        <span className="text-sm font-semibold">Managed System ID</span>
        <span />
        {renderManagedSystemInfoOrSearchId()}
      </div>
    </>
  );
};

export default EquipmentManagedSystem;
