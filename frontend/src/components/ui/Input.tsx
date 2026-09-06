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
};

type NormalInputProps = BaseInputProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | keyof BaseInputProps> & {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file';
};

type SelectInputProps = BaseInputProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, keyof BaseInputProps> & {
  type: 'select';
  options: InputOption[];
};

type TextareaInputProps = BaseInputProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseInputProps> & {
  type: 'textarea';
  rows?: number;
};

export type InputProps = NormalInputProps | SelectInputProps | TextareaInputProps;

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const { className, label, error, helperText, id, type } = props;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const wrapperClass = 'w-full';
    const labelEl = label && (
      <label htmlFor={inputId} className="block text-sm font-medium text-cyber-textMuted mb-1.5">
        {label}
      </label>
    );
    const errorEl = error && (
      <p id={`${inputId}-error`} className="mt-1.5 text-sm text-cyber-critical" role="alert">
        {error}
      </p>
    );
    const helperEl = helperText && !error && (
      <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-cyber-textDim">
        {helperText}
      </p>
    );

    if (type === 'select') {
      const { options, ...selectProps } = props as SelectInputProps;
      const { label: _, error: __, helperText: ___, leftIcon: ____, id: _____, className: ______, type: _______, ...restSelectProps } = selectProps;
      
      return (
        <div className={wrapperClass}>
          {labelEl}
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200 appearance-none',
              error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...restSelectProps}
          >
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
      const { label: _, error: __, helperText: ___, leftIcon: ____, id: _____, className: ______, type: _______, ...restTextareaProps } = textareaProps;
      
      return (
        <div className={wrapperClass}>
          {labelEl}
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            rows={rows}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text placeholder-cyber-textDim focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200 resize-y min-h-[100px]',
              error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...restTextareaProps}
          />
          {errorEl}
          {helperEl}
        </div>
      );
    }

    const { leftIcon, ...inputProps } = props as NormalInputProps;
    const { label: _, error: __, helperText: ___, id: ____, className: _____, ...restInputProps } = inputProps;
    
    return (
      <div className={wrapperClass}>
        {labelEl}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyber-textDim">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text placeholder-cyber-textDim focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200',
              leftIcon ? 'pl-10' : '',
              error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
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


interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-cyber-textMuted mb-1.5">
            {label}
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
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-cyber-critical" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-cyber-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: InputOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, placeholder, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-cyber-textMuted mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg bg-cyber-elevated border text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:border-transparent transition-all duration-200 appearance-none bg-no-repeat bg-right pr-10',
            'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")]',
            error ? 'border-cyber-critical focus:ring-cyber-critical' : 'border-cyber-border',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
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
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-cyber-critical" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-cyber-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';