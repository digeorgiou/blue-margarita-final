export type ButtonProps = {
    children?: React.ReactNode;
    onClick?: ()=> void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export type ActionButtonProps = {
    title: string;
    description: string;
    icon: string;
    color: 'green' | 'blue' | 'purple' | 'orange';
    onClick: () => void;
}