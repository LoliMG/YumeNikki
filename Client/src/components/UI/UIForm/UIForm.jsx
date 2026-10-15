import React from 'react';
import Form from 'react-bootstrap/Form';

export const UIFormGroup = ({ className = 'mb-3', children, ...props }) => {
  return (
    <Form.Group className={className} {...props}>
      {children}
    </Form.Group>
  );
};

export const UIFormLabel = ({ children, className = '', ...props }) => {
  return (
    <Form.Label className={`fw-semibold text-light ${className}`} {...props}>
      {children}
    </Form.Label>
  );
};

export const UIFormControl = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  as,
  rows,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <Form.Control
      type={as ? undefined : type}
      as={as}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={className}
      {...props}
    />
  );
};

export const UIFormSelect = ({
  value,
  onChange,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <Form.Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </Form.Select>
  );
};

export const UIFormText = ({ children, className = 'text-muted small mt-1', ...props }) => {
  return (
    <Form.Text className={className} {...props}>
      {children}
    </Form.Text>
  );
};

export default {
  Group: UIFormGroup,
  Label: UIFormLabel,
  Control: UIFormControl,
  Select: UIFormSelect,
  Text: UIFormText
};
