import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import EquipmentManagedSystemSearchId from './EquipmentManagedSystemSearchId';

interface IProps {
  inputId: string;
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
        <label htmlFor={props.inputId} className="text-sm font-semibold">Managed System ID</label>
        <span />
        {renderManagedSystemInfoOrSearchId()}
      </div>
    </>
  );
};

export default EquipmentManagedSystem;
