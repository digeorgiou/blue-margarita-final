export type ButtonProps = {
    children?: React.ReactNode;
    onClick?: ()=> void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}