export type DashboardCardProps = {
    title?: string;
    icon?: string | React.JSX.Element;
    children: React.ReactNode;
    footer?: React.ReactNode;
    headerRight?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    height?: 'sm' | 'md' | 'lg' | 'xl';
}