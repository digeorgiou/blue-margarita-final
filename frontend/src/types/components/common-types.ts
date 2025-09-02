export type AlertProps = {
    children?: React.ReactNode;
    variant?: 'success' | 'error' | 'warning' | 'info';
    className?: string;
    onClose?: () => void;
    title?: string;
}

export type LoadingSpinnerProps = {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export type ButtonProps = {
    children?: React.ReactNode;
    onClick?: ()=> void;
    variant?:
    // Standard solid buttons
        | 'primary'
        | 'secondary'
        | 'create'
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

export type CardProps = {
    children?: React.ReactNode;
    title?: string;
    icon?: string;
    className?: string;
}

export type CustomCardProps = {
    title?: string | React.ReactNode;
    icon?: string | React.JSX.Element;
    children: React.ReactNode;
    footer?: React.ReactNode;
    headerRight?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    height?: 'sm' | 'md' | 'lg' | 'xl';
}

export type HeaderProps = {
    onLogout: () => void;
    currentPage?: string;
}

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
    icon?: React.ReactNode;
    maxLength?: number;
}

export type LayoutProps = {
    children: React.ReactNode;
    currentPage: string;
    onNavigate: (page: string) => void;
    user?: string | null;
    onLogout: () => void;
}

export type ListItemProps = {
    primaryText: string;
    secondaryText: string;
    rightText: string;
    rightTextColor?: 'green' | 'red' | 'blue';
    isWarning?: boolean;
}

export type QuickActionsProps = {
    onRecordSale: () => void;
    onRecordPurchase: () => void;
    onStockManagement: () => void;
}

export type SidebarProps = {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export type NavigationItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
}

export type StatCardProps = {
    label : string ;
    value : string ;
    isBig?: boolean;
    color?: 'green' | 'blue' | 'purple';
}

export type TaskItemProps = {
    task: {
        id : number;
        description : string;
        date : string;
        status : string;
    };
    onComplete : (id: number) => void;
}