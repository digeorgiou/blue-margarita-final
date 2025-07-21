export type AlertProps = {
    children?: React.ReactNode;
    variant?: 'success' | 'error' | 'warning' | 'info';
    className?: string;
    onClose?: () => void;
    title?: string;
}