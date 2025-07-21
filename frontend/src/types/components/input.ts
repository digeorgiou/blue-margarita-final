export type InputProps = {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel';
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    id?: string;
}