export type InputProps = {
    label?: string | React.ReactNode;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    id?: string;
    min?: number | string;
    max?: number | string;
    step?: number | string;
}