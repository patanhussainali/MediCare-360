import React from 'react';
import { sanitizePhoneInput, validatePhone } from '../../utils/validators';

const PhoneInput = ({ value = '', onChange, required = false, className = '', placeholder = '10-digit mobile number', ...props }) => (
  <input
    {...props}
    type="tel"
    inputMode="numeric"
    autoComplete="tel-national"
    maxLength={10}
    pattern="[0-9]{10}"
    title="Enter exactly 10 digits using numbers only"
    required={required}
    value={value || ''}
    placeholder={placeholder}
    onChange={event => onChange(sanitizePhoneInput(event.target.value))}
    onInvalid={event => {
      if (event.currentTarget.validity.patternMismatch) {
        event.currentTarget.setCustomValidity(validatePhone(event.currentTarget.value));
      }
    }}
    onInput={event => event.currentTarget.setCustomValidity('')}
    className={className}
  />
);

export default PhoneInput;
