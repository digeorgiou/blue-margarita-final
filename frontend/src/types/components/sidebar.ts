
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