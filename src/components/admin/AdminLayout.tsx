import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, ExternalLink, Kanban, User, Users, Menu, X } from 'lucide-react';
import Logo from '../Logo';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isSuperAdmin } = useAuthContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success('Logout realizado com sucesso!');
            navigate('/admin/login');
        } catch (error) {
            toast.error('Erro ao fazer logout');
        }
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Kanban', href: '/admin/kanban', icon: Kanban },
        ...(isSuperAdmin ? [{ name: 'Posts', href: '/admin/posts', icon: FileText }] : []),
        ...(isSuperAdmin ? [{ name: 'Usuários', href: '/admin/usuarios', icon: Users }] : []),
        { name: 'Meu Perfil', href: '/admin/perfil', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(href);
    }

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-950">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                ${sidebarCollapsed ? 'w-16' : 'w-64'} 
                bg-white dark:bg-gray-900 shadow-lg flex-col transition-all duration-300
                ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden'} 
                md:flex
            `}>
                {/* Header with Logo and Collapse Button */}
                <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200 dark:border-gray-700 flex items-center justify-between transition-all duration-300`}>
                    <Link to="/admin" className={sidebarCollapsed ? 'mx-auto' : ''}>
                        <Logo collapsed={sidebarCollapsed} isAdmin={true} />
                    </Link>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden md:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-2 transition-all duration-300`}>
                    {navItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-lg font-medium transition-all duration-200 group relative ${
                                isActive(item.href)
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            title={sidebarCollapsed ? item.name : ''}
                        >
                            <item.icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} transition-all duration-200`} />
                            {!sidebarCollapsed && <span>{item.name}</span>}
                            
                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-700 transition-all duration-300`}>
                    <Link
                        to="/"
                        target="_blank"
                        className={`flex items-center w-full ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 mb-2 group relative`}
                        title={sidebarCollapsed ? 'Ver Site' : ''}
                    >
                        <ExternalLink className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                        {!sidebarCollapsed && <span>Ver Site</span>}
                        
                        {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Ver Site
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full ${sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 group relative`}
                        title={sidebarCollapsed ? 'Sair' : ''}
                    >
                        <LogOut className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                        {!sidebarCollapsed && <span>Sair</span>}
                        
                        {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                Sair
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
