import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({ id, label, hint, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      {hint ? <p className="form-field__hint type-caption" id={`${id}-hint`}>{hint}</p> : null}
      {children}
    </div>
  );
}

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...rest }: TextInputProps) {
  return <input className={["form-input", className].filter(Boolean).join(" ")} {...rest} />;
}

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className, ...rest }: TextAreaProps) {
  return <textarea className={["form-textarea", className].filter(Boolean).join(" ")} {...rest} />;
}
