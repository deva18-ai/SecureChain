import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

export type InputOption = { value: string; label: string };

type BaseInputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  id?: string;
  className?: string;
  required?: boolean;
};

type NormalInputProps = BaseInputProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | keyof BaseInputProps> & {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file';
};

type SelectInputProps = BaseInputProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof BaseInputProps> & {
  type: 'select';
  options: InputOption[];
  placeholder?: string;
};

type TextareaInputProps = BaseInputProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseInputProps> & {
  type: 'textarea';
  rows?: number;
};

export type InputProps = NormalInputProps | SelectInputProps | TextareaInputProps;

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const { className, label, error, helperText, id, type, required } = props;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const wrapperClass = 'w-full';
    const labelEl = label && (
      <label htmlFor={inputId} className="label">
        {label}
        {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
      </label>
    );
    const errorEl = error && (
      <p id={`${inputId}-error`} className="mt-2 text-sm text-danger" role="alert">
        {error}
      </p>
    );
    const helperEl = helperText && !error && (
      <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
        {helperText}
      </p>
    );

    if (type === 'select') {
      const { options, placeholder, ...selectProps } = props as SelectInputProps;
      const { label: _label, error: _error, helperText: _helperText, leftIcon: _leftIcon, id: _id, className: _className, type: _type, required: _required, ...restSelectProps } = selectProps;
      
      return (
        <div className={wrapperClass}>
          {labelEl}
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={inputId}
            className={cn(
              'input appearance-none bg-no-repeat bg-right pr-10',
              'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
              error ? 'input-error' : '',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            aria-required={required}
            {...restSelectProps}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errorEl}
          {helperEl}
        </div>
      );
    }

    if (type === 'textarea') {
      const { rows, ...textareaProps } = props as TextareaInputProps;
      const { label: _label2, error: _error2, helperText: _helperText2, leftIcon: _leftIcon2, id: _id2, className: _className2, type: _type2, required: _required2, ...restTextareaProps } = textareaProps;
      
      return (
        <div className={wrapperClass}>
          {labelEl}
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            className={cn(
              'input resize-y min-h-[100px]',
              error ? 'input-error' : '',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            aria-required={required}
            {...restTextareaProps}
          />
          {errorEl}
          {helperEl}
        </div>
      );
    }

    const { leftIcon, ...inputProps } = props as NormalInputProps;
    const { label: _label3, error: _error3, helperText: _helperText3, id: _id3, className: _className3, required: _required3, ...restInputProps } = inputProps;
    
    return (
      <div className={wrapperClass}>
        {labelEl}
        <div className="relative">
          {leftIcon && (
            <div className="input-icon">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            className={cn(
              'input',
              leftIcon ? 'input-with-icon' : '',
              error ? 'input-error' : '',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            aria-required={required}
            {...restInputProps}
          />
        </div>
        {errorEl}
        {helperEl}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
            {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'input resize-y min-h-[100px]',
            error ? 'input-error' : '',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: InputOption[];
  placeholder?: string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, placeholder, required, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
            {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'input appearance-none bg-no-repeat bg-right pr-10',
            'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
            error ? 'input-error' : '',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          aria-required={required}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:ring-offset-0 transition-all',
              'bg-white border-2',
              error ? 'border-danger' : '',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${checkboxId}-error` : description ? `${checkboxId}-desc` : undefined}
            {...props}
          />
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label htmlFor={checkboxId} className="text-sm font-medium text-gray-900 cursor-pointer">
                  {label}
                </label>
              )}
              {description && (
                <p id={`${checkboxId}-desc`} className="text-sm text-gray-500 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={`${checkboxId}-error`} className="mt-2 text-sm text-danger ml-7" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface RadioGroupProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function RadioGroup({ 
  name, 
  label, 
  description, 
  error, 
  options, 
  value, 
  onChange, 
  required,
  className 
}: RadioGroupProps) {
  const groupId = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('w-full', className)}>
      {(label || description) && (
        <div className="mb-3">
          {label && (
            <label className="label">
              {label}
              {required && <span className="text-danger ml-1" aria-hidden="true">*</span>}
            </label>
          )}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-3" role="radiogroup" aria-labelledby={label ? groupId : undefined} aria-describedby={error ? `${groupId}-error` : description ? `${groupId}-desc` : undefined} aria-required={required}>
        {options.map((option) => (
          <label key={option.value} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={cn(
                'mt-0.5 w-4 h-4 border-gray-300 text-primary-blue focus:ring-2 focus:ring-primary-blue/20 focus:ring-offset-0 transition-all',
                'border-2',
                error ? 'border-danger' : ''
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900">{option.label}</p>
              {option.description && (
                <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${groupId}-error`} className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        <div className="flex items-center gap-3">
          <button
            role="switch"
            type="button"
            ref={ref as React.Ref<HTMLButtonElement>}
            id={switchId}
            aria-checked={props.checked}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${switchId}-error` : description ? `${switchId}-desc` : undefined}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:ring-offset-2',
              props.checked ? 'bg-primary-blue border-primary-blue' : 'bg-gray-200 border-gray-300',
              props.disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            onClick={() => !props.disabled && props.onChange?.({ target: { checked: !props.checked } } as any)}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200',
                'translate-x-0.5',
                props.checked && 'translate-x-5'
              )}
              aria-hidden="true"
            />
          </button>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label htmlFor={switchId} className="text-sm font-medium text-gray-900 cursor-pointer">
                  {label}
                </label>
              )}
              {description && (
                <p id={`${switchId}-desc`} className="text-sm text-gray-500 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p id={`${switchId}-error`} className="mt-2 text-sm text-danger ml-14" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';