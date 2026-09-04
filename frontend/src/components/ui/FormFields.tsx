import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useId } from 'react';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  id?: string;
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement>, FormFieldProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ className, label, error, helperText, required, id, leftIcon, rightIcon, rightElement, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-cyber-textMuted mb-1.5 flex items-center gap-1">
            {label}
            {required && <span className="text-cyber-critical" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-textDim">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text placeholder-cyber-textDim focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200',
              leftIcon ? 'pl-10' : '',
              rightIcon || rightElement ? 'pr-10' : '',
              error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            aria-required={required}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-cyber-textDim">
              {rightIcon}
            </div>
          )}
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightElement}
            </div>
          )}
          {error && !rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-cyber-critical" aria-hidden="true" />
            </div>
          )}
          {!error && rightElement && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-cyber-success" aria-hidden="true" />
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-cyber-critical flex items-center gap-1" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-cyber-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FormFieldProps {}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, label, error, helperText, required, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-cyber-textMuted mb-1.5 flex items-center gap-1">
            {label}
            {required && <span className="text-cyber-critical" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text placeholder-cyber-textDim focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200 resize-y min-h-[100px]',
            error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-required={required}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-cyber-critical flex items-center gap-1" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-cyber-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, FormFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  clearable?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, label, error, helperText, required, id, options, placeholder, clearable, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-cyber-textMuted mb-1.5 flex items-center gap-1">
            {label}
            {required && <span className="text-cyber-critical" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10',
              error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
              'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            aria-required={required}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-cyber-critical" aria-hidden="true" />
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-cyber-critical flex items-center gap-1" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-cyber-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, FormFieldProps {
  indeterminate?: boolean;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ className, label, error, helperText, required, id, indeterminate, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              className={cn(
                'w-4 h-4 rounded border-2 appearance-none cursor-pointer transition-colors',
                'bg-cyber-elevated border-cyber-border',
                'checked:bg-cyber-primary checked:border-cyber-primary',
                'focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:ring-offset-2 focus:ring-offset-cyber-bg',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                indeterminate && 'bg-cyber-primary border-cyber-primary',
                error && 'border-cyber-critical',
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              aria-required={required}
              {...props}
            />
            {indeterminate && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 bg-cyber-bg rounded" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-cyber-text cursor-pointer flex items-center gap-1">
                {label}
                {required && <span className="text-cyber-critical" aria-hidden="true">*</span>}
              </label>
            )}
            {error && (
              <p id={errorId} className="mt-1.5 text-sm text-cyber-critical flex items-center gap-1" role="alert">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="mt-1.5 text-sm text-cyber-textDim">
                {helperText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

export interface RadioGroupProps extends FormFieldProps {
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  inline?: boolean;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, label, error, helperText, required, options, value, onChange, inline = false, id, ...props }, ref) => {
    const generatedId = useId();
    const groupId = id || generatedId;
    const errorId = `${groupId}-error`;
    const helperId = `${groupId}-helper`;

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {label && (
          <fieldset className="border-0 p-0 mb-2">
            <legend className="block text-sm font-medium text-cyber-textMuted mb-1.5 flex items-center gap-1">
              {label}
              {required && <span className="text-cyber-critical" aria-hidden="true">*</span>}
            </legend>
            <div className={cn(inline ? 'flex flex-wrap gap-4' : 'space-y-2')}>
              {options.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 cursor-pointer',
                    inline && 'whitespace-nowrap'
                  )}
                >
                  <input
                    type="radio"
                    name={groupId}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => onChange?.(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'w-4 h-4 appearance-none cursor-pointer transition-colors',
                      'border-cyber-border',
                      'checked:border-cyber-primary checked:bg-cyber-primary',
                      'focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:ring-offset-2 focus:ring-offset-cyber-bg',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-describedby={error ? errorId : helperText ? helperId : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-cyber-text">{option.label}</span>
                    {option.description && (
                      <p className="text-xs text-cyber-textMuted">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-cyber-critical flex items-center gap-1" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-cyber-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export interface SwitchFieldProps extends FormFieldProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const SwitchField = forwardRef<HTMLInputElement, SwitchFieldProps>(
  ({ className, label, error, helperText, required, checked, onChange, size = 'md', ...props }, ref) => {
    const generatedId = useId();
    const inputId = generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const sizeClasses = {
      sm: 'w-8 h-4',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    };

    const thumbSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="w-full">
        <div className="flex items-center gap-3">
          <button
            ref={ref}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            aria-required={required}
            onClick={() => onChange?.(!checked)}
            className={cn(
              'relative inline-flex items-center rounded-full transition-colors cursor-pointer',
              'bg-cyber-border',
              checked && 'bg-cyber-primary',
              'focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:ring-offset-2 focus:ring-offset-cyber-bg',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              className
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 rounded-full bg-white transition-transform',
                'shadow-sm',
                checked ? 'translate-x-full' : 'translate-x-0',
                thumbSizeClasses[size]
              )}
              aria-hidden="true"
            />
          </button>
          <div className="flex-1 min-w-0">
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-cyber-text cursor-pointer flex items-center gap-1">
                {label}
                {required && <span className="text-cyber-critical" aria-hidden="true">*</span>}
              </label>
            )}
            {error && (
              <p id={errorId} className="mt-1.5 text-sm text-cyber-critical flex items-center gap-1" role="alert">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={helperId} className="mt-1.5 text-sm text-cyber-textDim">
                {helperText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SwitchField.displayName = 'SwitchField';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-heading font-semibold text-cyber-text">{title}</h3>}
          {description && <p className="text-sm text-cyber-textMuted mt-1">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between';
}

export function FormActions({ children, className, align = 'end' }: FormActionsProps) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={cn('flex flex-wrap gap-3 pt-4 border-t border-cyber-border', alignClasses[align], className)}>
      {children}
    </div>
  );
}