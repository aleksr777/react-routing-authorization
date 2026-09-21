import { useId, type ComponentPropsWithoutRef } from 'react';

// Autofill hints are best effort: browsers and extensions may override them.
// Keep ordinary typing, keyboard navigation and intentional pasting available.
const ConfirmationInput = (props: ComponentPropsWithoutRef<'input'>) => {
  const id = useId();
  return (
    <input
      name={`confirmation-${id}`}
      {...props}
      autoComplete={props.type === 'password' ? 'new-password' : 'off'}
      autoCapitalize="none"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      data-form-type="other"
    />
  );
};

export default ConfirmationInput;
