import * as React from 'react';
import { createRoot } from 'react-dom/client';
import AssignDate from './AssignDate';

// Enhance server-rendered date inputs while preserving MVC's field names and values.
export function renderDateFields() {
  document.querySelectorAll<HTMLElement>('[data-date-field]').forEach(container => {
    const input = container.querySelector('input');
    if (!input) return;
    const initialDate = input.value ? new Date(`${input.value}T00:00:00`) : null;
    const name = input.name;
    const label = container.dataset.label;
    const DateField = () => {
      const [date, setDate] = React.useState(initialDate);
      const [valid, setValid] = React.useState(true);
      const value = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
      return <>
        <input type='hidden' name={name} value={valid ? value : 'incomplete-date'} />
        <AssignDate label={label} date={date} isRequired={false} onChangeDate={setDate} onValidityChange={setValid} />
      </>;
    };
    createRoot(container).render(<DateField />);
  });
}
