export type LayoutProps = {
    children: React.ReactNode;
    currentPage: string;
    onNavigate: (page: string) => void;
    user?: string | null;
    onLogout: () => void;
}