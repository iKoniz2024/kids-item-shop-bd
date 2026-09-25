"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/views/sharedPages/Sidebar";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Menu, LayoutDashboard, ShoppingBag, ShoppingCart, Tags, MoreHorizontal } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import useSettings from "@/hooks/useSettings";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { logo, siteName } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isVendor = user?.role === "vendor";
  const homePath = isVendor ? "/dashboard/vendor" : "/dashboard";

  const bottomNavItems = [
    {
      name: "Dashboard",
      path: homePath,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Products",
      path: "/dashboard/products",
      icon: ShoppingBag,
    },
    {
      name: "Orders",
      path: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      name: "Categories",
      path: "/dashboard/categories",
      icon: Tags,
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-muted/20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted lg:hidden"
            title="Open navigation menu"
          >
            <Menu className="size-5 text-foreground" />
          </button>
          
          <div className="flex items-center gap-2 lg:hidden">
            {logo ? (
              <img src={logo} alt={siteName || "Logo"} className="h-7 w-auto object-contain" />
            ) : (
              <span className="text-base font-black tracking-tight text-foreground truncate max-w-[140px]">
                {siteName || "Kids Item"}
              </span>
            )}
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase">
              {isVendor ? "Vendor" : "Admin"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
            title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-xs"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/dashboard/profile");
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                        router.push("/login");
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Admin Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md lg:hidden shadow-lg">
        <div className="flex h-16 items-center justify-around px-2">
          {bottomNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.path
              : pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-colors ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-xl transition-all ${
                    isActive ? "bg-primary/10 text-primary scale-110" : ""
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <span className="mt-0.5 text-[10px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}

          {/* More / Menu Drawer Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-1 flex-col items-center justify-center py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <div className="flex size-8 items-center justify-center rounded-xl">
              <MoreHorizontal className="size-5" />
            </div>
            <span className="mt-0.5 text-[10px] tracking-tight">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

