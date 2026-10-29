import * as React from 'react';

export const DisplayField = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div className='min-w-0'>
    <dt className='text-sm text-base-content/60'>{label}</dt>
    <dd className='mt-1 whitespace-pre-wrap break-words'>{children === null || children === undefined || children === '' ? '—' : children}</dd>
  </div>
);

interface Props {
  title?: string;
  fields: Array<[string, React.ReactNode]>;
  tags?: string;
  notes?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const AssetActions = ({ children }: { children: React.ReactNode }) => (
  <div className='ml-auto flex max-w-full flex-wrap items-center justify-end gap-2'>
    {children}
  </div>
);

export const AssetSummary = ({ title, fields, tags, notes, actions, children }: Props) => (
  <section className='space-y-5'>
    {(title || actions) && <div className='flex flex-wrap items-center justify-between gap-3'>
      {title && <h3 className='text-lg font-semibold'>{title}</h3>}
      {actions && <AssetActions>{actions}</AssetActions>}
    </div>}
    <dl className='grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3'>
      {fields.map(([label, value]) => <DisplayField key={label} label={label}>{value}</DisplayField>)}
    </dl>
    {tags && <div className='flex flex-wrap gap-2' aria-label='Tags'>
      {tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) =>
        <span key={`${tag}-${index}`} className='badge badge-asset badge-soft'>{tag}</span>)}
    </div>}
    {notes && <div className='border-t border-main-border pt-5'>
      <h4 className='mb-2 text-sm font-semibold'>Notes</h4>
      <p className='whitespace-pre-wrap break-words'>{notes}</p>
    </div>}
    {children}
  </section>
);
