import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, ExternalLink, Trello, User } from 'lucide-react';
import Logo from '../Logo';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
        { name: 'Kanban', href: '/admin/kanban', icon: Trello },
        { name: 'Posts', href: '/admin/posts', icon: FileText },
        { name: 'Meu Perfil', href: '/admin/perfil', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(href);
    }

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-950">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <Link to="/admin">
                        <Logo />
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                isActive(item.href)
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 mb-2"
                    >
                        <ExternalLink className="w-5 h-5 mr-3" />
                        <span>Ver Site</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Sair</span>
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
