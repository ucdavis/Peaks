﻿import * as React from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody } from 'reactstrap';
import { Context } from '../../Context';
import { IAccess, IAccessAssignment } from '../../Types';
import AccessEditValues from './AccessEditValues';

interface IProps {
  modal: boolean;
  closeModal: () => void;
  selectedAccess: IAccess;
  onRevoke: (accessAssignment: IAccessAssignment) => void;
  openEditModal: (access: IAccess) => void;
  updateSelectedAccess: (access: IAccess, id?: number) => void;
}

export default class AccessDetails extends React.Component<IProps, {}> {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  public componentDidMount() {
    if (!this.props.selectedAccess) {
      return;
    }
    this._fetchDetails(this.props.selectedAccess.id);
  }

  // make sure we change the key we are updating if the parent changes selected key
  public componentWillReceiveProps(nextProps: IProps) {
    if (
      nextProps.selectedAccess &&
      (!this.props.selectedAccess ||
        nextProps.selectedAccess.id !== this.props.selectedAccess.id)
    ) {
      this._fetchDetails(nextProps.selectedAccess.id);
    }
  }

  public render() {
    if (!this.props.selectedAccess) {
      return null;
    }
    const access = this.props.selectedAccess;
    return (
      <div>
        <Modal
          isOpen={this.props.modal}
          toggle={this.props.closeModal}
          size='lg'
          className='access-color'
        >
          <div className='modal-header row justify-content-between'>
            <h2>Details for {access.name}</h2>
            <Button color='link' onClick={this.props.closeModal}>
              <i className='fas fa-times fa-lg' />
            </Button>
          </div>

          <ModalBody>
            <AccessEditValues
              selectedAccess={access}
              disableEditing={true}
              onRevoke={this.props.onRevoke}
              openEditModal={this.props.openEditModal}
            />
          </ModalBody>
        </Modal>
      </div>
    );
  }

  private _fetchDetails = async (id: number) => {
    const url = `/api/${this.context.team.slug}/access/details/${id}`;
    let access: IAccess = null;
    try {
      access = await this.context.fetch(url);
    } catch (err) {
      if (err.message === 'Not Found') {
        toast.error(
          'The access you were trying to view could not be found. It may have been deleted.'
        );
        this.props.updateSelectedAccess(null, id);
        this.props.closeModal();
      } else {
        toast.error(
          'Error fetching access details. Please refresh the page to try again.'
        );
      }
      return;
    }
    this.props.updateSelectedAccess(access);
  };
}
