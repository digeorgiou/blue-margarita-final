export type ButtonProps = {
    children?: React.ReactNode;
    onClick?: ()=> void;
    variant?:
    // Standard solid buttons
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'purple'
        | 'pink'
        | 'indigo'
        | 'teal'
        | 'yellow'
        | 'orange'
        // Outline buttons
        | 'outline-primary'
        | 'outline-secondary'
        // Ghost buttons
        | 'ghost-primary'
        | 'ghost-secondary';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    title?: string;
}

export type ActionButtonProps = {
    title: string;
    description: string;
    icon: string;
    color: 'green' | 'blue' | 'purple' | 'orange';
    onClick: () => void;
}