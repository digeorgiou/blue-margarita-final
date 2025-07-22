import Sidebar from "../components/ui/Sidebar.tsx";
import {LayoutProps} from "../types/components/layout.ts";

const Layout: React.FC<LayoutProps> = ({
                                           children,
                                           currentPage,
                                           onNavigate,
                                           user,
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
                {/* Header */}
                <header className="bg-white/20 backdrop-blur-sm shadow-sm border-b border-white/30 px-4 py-3 lg:px-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-white lg:hidden">Blue Margarita</h1>
                            {user && (
                                <span className="ml-4 text-sm text-white/80">Welcome, {user}</span>
                            )}
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-sm text-white/80 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-white/20"
                        >
                            Sign Out
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;