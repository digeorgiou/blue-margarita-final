import Sidebar from "../components/ui/Sidebar.tsx";
import Header from "../components/ui/Header.tsx";
import {LayoutProps} from "../types/components/layout.ts";

const Layout: React.FC<LayoutProps> = ({
                                           children,
                                           currentPage,
                                           onNavigate,
                                           onLogout
                                       }) => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={onNavigate}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* New Fancy Header */}
                <Header
                    onLogout={onLogout}
                    currentPage={currentPage}
                />

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;