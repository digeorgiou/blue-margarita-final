export type DashboardCardProps = {
    title: string;
    icon: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    headerRight?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    height?: 'sm' | 'md' | 'lg' | 'xl';
}