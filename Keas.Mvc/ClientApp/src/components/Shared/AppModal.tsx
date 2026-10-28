import * as React from 'react';
import { createContext, useContext, useId } from 'react';
import { Modal as ReactstrapModal, ModalProps } from 'reactstrap';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ModalContext = createContext<{ titleId: string; close: React.MouseEventHandler<HTMLButtonElement> }>({
  titleId: '', close: () => {}
});

export const Modal = ({ children, labelledBy, ...props }: ModalProps) => {
  const generatedId = useId();
  const titleId = labelledBy || `modal-title-${generatedId}`;
  return (
    <ModalContext.Provider value={{ titleId, close: event => (props.toggle as React.MouseEventHandler<HTMLButtonElement>)?.(event) }}>
      <ReactstrapModal {...props} labelledBy={titleId}>{children}</ReactstrapModal>
    </ModalContext.Provider>
  );
};

export const ModalHeading = ({ children }: { children: React.ReactNode }) => {
  const { titleId, close } = useContext(ModalContext);
  return (
    <div className='flex items-start justify-between gap-4 rounded-t-box border-b-[3px] border-asset-color p-5 sm:px-8 sm:py-6'>
      <h2 id={titleId} className='min-w-0 break-words text-2xl font-semibold'>{children}</h2>
      <button type='button' className='btn btn-ghost btn-square btn-sm shrink-0' aria-label='Close dialog' onClick={close}>
        <XMarkIcon className='size-5' aria-hidden='true' />
      </button>
    </div>
  );
};

export const ModalBody = ({ children, className = '' }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`min-w-0 space-y-6 p-5 sm:p-8 ${className}`}>{children}</div>
);

export const ModalFooter = ({ children, className = '', showCancel = true }: React.HTMLAttributes<HTMLDivElement> & { showCancel?: boolean }) => {
  const { close } = useContext(ModalContext);
  return (
    <div className={`flex flex-wrap items-center justify-end gap-3 border-t border-main-border p-5 sm:px-8 ${className}`}>
      {showCancel && <button type='button' className='btn btn-ghost' onClick={close}>Cancel</button>}
      {children}
    </div>
  );
};
