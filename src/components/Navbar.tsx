import { NavLink } from 'react-router-dom';

export default function Navbar() {
    const linkClasses = ({ isActive }: { isActive: boolean }) =>
        `px-4 py-2 rounded-lg font-bold transition-colors ${isActive
            ? "bg-red-600 text-white"
            : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`;

    return (
        <nav className="w-full bg-[#090d16] border-b border-slate-800 p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-tr-xl rounded-bl-xl flex items-center justify-center font-black text-white italic">
                        F1
                    </div>
                    <span className="text-xl font-black text-white tracking-widest uppercase">
                        Dashboard
                    </span>
                </div>

                <div className="flex gap-2">
                    <NavLink to="/" className={linkClasses}>Dashboard</NavLink>
                    <NavLink to="/analytics" className={linkClasses}>Analytics</NavLink>
                    <NavLink to="/showroom" className={linkClasses}>Showroom</NavLink>
                </div>
            </div>
        </nav>
    );
}