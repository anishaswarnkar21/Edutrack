import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  IconBook,
  IconHome,
  IconClipboard,
  IconChart,
  IconUser,
  IconLogOut,
  IconLayers,
  IconUsers,
} from "../ui/icons.jsx";
import config from "../../config/config.js";

const NAV_ITEMS = [
  { to: "/home", label: "Home", icon: IconHome },
  { to: "/classes", label: "My Classes", icon: IconLayers },
  { to: "/attendance", label: "Attendance", icon: IconClipboard },
  { to: "/lessons", label: "Lessons", icon: IconBook },
  { to: "/results", label: "Results", icon: IconChart },
  { to: "/profile", label: "Profile", icon: IconUser },
];

const ADMIN_NAV_ITEMS = [
  { to: "/home", label: "Overview", icon: IconHome },
  { to: "/admin/users", label: "Users", icon: IconUsers },
  { to: "/admin/classes", label: "Classes", icon: IconLayers },
  { to: "/profile", label: "Profile", icon: IconUser },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user?.isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-200">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-100">
        <span className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
          <IconBook className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-gray-900 tracking-tight">{config.appName}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/home"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <IconLogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
