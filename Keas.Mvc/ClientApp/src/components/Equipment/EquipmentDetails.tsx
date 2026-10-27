import { AssetActions } from '../Shared/AssetSummary';
import { Modal, ModalBody } from '../Shared/AppModal';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
﻿import * as React from 'react';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

import { Context } from '../../Context';
import { IEquipment } from '../../models/Equipment';
import HistoryContainer from '../History/HistoryContainer';
import EquipmentManagedSystemInfo from './EquipmentManagedSystemInfo';
import { DateUtil } from '../../util/dates';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  openEditModal: (equipment: IEquipment) => void;
  openUpdateModal: (equipment: IEquipment) => void;
  selectedEquipment: IEquipment;
  updateSelectedEquipment: (equipment: IEquipment, id?: number) => void;
}

const EquipmentDetails = (props: IProps) => {
  const context = useContext(Context);
  const { selectedEquipment } = props;
  const equipmentId = selectedEquipment?.id;

  useEffect(() => {
    if (!equipmentId) {
      return;
    }
    const fetchDetails = async (id: number) => {
      const url = `/api/${context.team.slug}/equipment/details/${id}`;
      let equipment: IEquipment = null;
      try {
        equipment = await context.fetch(url);
      } catch (err) {
        if (err.message === 'Not Found') {
          toast.error(
            'The equipment you were trying to view could not be found. It may have been deleted.'
          );
          props.updateSelectedEquipment(null, id);
          props.closeModal();
        } else {
          toast.error(
            'Error fetching equipment details. Please refresh the page to try again.'
          );
        }
        return;
      }
      props.updateSelectedEquipment(equipment);
    };

    fetchDetails(equipmentId);
    // it wants us to add props.closeModal and props.updateSelectedEquipment to the dependency array, but that causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentId, context]);

  if (!selectedEquipment) {
    return null;
  }

  const equipment = selectedEquipment;

  const isComputer = ['Computer', 'Desktop', 'Laptop', 'Server'].includes(equipment.type);
  const hasClassification = ['Computer', 'Desktop', 'Laptop', 'Server', 'Cellphone', 'Device', 'Tablet'].includes(equipment.type);
  const fields = [
    ['Type', equipment.type || 'Default'],
    ['Serial number / identifier', equipment.serialNumber],
    ...(!['Card', 'Software'].includes(equipment.type) ? [['Make', equipment.make], ['Model', equipment.model]] : []),
    ...(hasClassification ? [['Protection level', equipment.protectionLevel], ['Availability level', equipment.availabilityLevel]] : []),
    ['Room', equipment.space ? `${equipment.space.roomNumber} ${equipment.space.bldgName}` : null]
  ];
  const tags = (equipment.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);

  return (
    <Modal isOpen={props.modal} toggle={props.closeModal}
      className='equipment-color equipment-details-modal' labelledBy='equipment-details-title'>
      <div className='flex items-start justify-between gap-4 border-b border-main-border p-5 sm:px-8 sm:py-6'>
        <div className='min-w-0'>
          <p className='mb-1 text-sm text-base-content/60'>Equipment details</p>
          <h2 id='equipment-details-title' className='break-words text-2xl font-semibold'>{equipment.name}</h2>
        </div>
        <button type='button' className='btn btn-ghost btn-square btn-sm shrink-0'
          aria-label='Close equipment details' onClick={props.closeModal}>
          <XMarkIcon className='size-5' aria-hidden='true' />
        </button>
      </div>
      <ModalBody>
        <section aria-labelledby='equipment-summary-title'>
          <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
            <h3 id='equipment-summary-title' className='text-lg font-semibold'>Overview</h3>
            <AssetActions>
              <button type='button' className='btn btn-asset btn-sm' onClick={() => props.openEditModal(equipment)}>
                <PencilSquareIcon className='size-4' aria-hidden='true' /> Edit Equipment
              </button>
            </AssetActions>
          </div>
          <dl className='grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
            {fields.map(([label, value]) => (
              <div key={label} className='min-w-0'>
                <dt className='text-sm text-base-content/60'>{label}</dt>
                <dd className='mt-1 break-words'>{value || '—'}</dd>
              </div>
            ))}
            {isComputer && (
              <div className='min-w-0'>
                <dt className='text-sm text-base-content/60'>Managed system ID</dt>
                <dd className='mt-1 flex items-center gap-1'>
                  <span className='break-all'>{equipment.systemManagementId || '—'}</span>
                  {equipment.systemManagementId && <EquipmentManagedSystemInfo managedSystemId={equipment.systemManagementId} />}
                </dd>
              </div>
            )}
          </dl>
          {tags.length > 0 && (
            <div className='mt-5 flex flex-wrap gap-2' aria-label='Tags'>
              {tags.map(tag => <span key={tag} className='badge badge-asset badge-soft'>{tag}</span>)}
            </div>
          )}
          {equipment.notes && (
            <div className='mt-5 border-t border-main-border pt-5'>
              <h4 className='mb-2 text-sm font-semibold'>Notes</h4>
              <p className='whitespace-pre-wrap break-words'>{equipment.notes}</p>
            </div>
          )}
          {equipment.attributes?.length > 0 && (
            <div className='mt-5 border-t border-main-border pt-5'>
              <h4 className='mb-3 text-sm font-semibold'>Attributes</h4>
              <dl className='grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
                {equipment.attributes.map((attribute, index) => (
                  <div key={attribute.id || index} className='min-w-0'>
                    <dt className='text-sm text-base-content/60'>{attribute.key}</dt>
                    <dd className='mt-1 whitespace-pre-wrap break-words'>{attribute.value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
        <section className='border-t border-main-border pt-6' aria-labelledby='equipment-assignment-title'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <h3 id='equipment-assignment-title' className='text-lg font-semibold'>Assignment</h3>
            <AssetActions>
              <button type='button' className='btn btn-asset btn-outline btn-sm' onClick={() => props.openUpdateModal(equipment)}>
                <PencilSquareIcon className='size-4' aria-hidden='true' />
                {equipment.assignment ? 'Update Assignment' : 'Assign Equipment'}
              </button>
            </AssetActions>
          </div>
          <dl className='grid gap-5 sm:grid-cols-2'>
            <div>
              <dt className='text-sm text-base-content/60'>Assigned to</dt>
              <dd className='mt-1 break-words'>{equipment.assignment?.person.name || 'Unassigned'}</dd>
            </div>
            <div>
              <dt className='text-sm text-base-content/60'>Expires at</dt>
              <dd className='mt-1'>{equipment.assignment?.expiresAt ? DateUtil.formatExpiration(equipment.assignment.expiresAt) : '—'}</dd>
            </div>
          </dl>
        </section>
        <HistoryContainer controller='equipment' id={equipment.id} />
      </ModalBody>
    </Modal>
  );
};

export default EquipmentDetails;
