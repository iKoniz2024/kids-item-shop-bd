"use client";

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ShoppingCart, Sun, Moon, Menu, X, Phone, Package, House, Store, TrendingUp, Zap, Sparkles, LayoutGrid, ChevronDown, User, LogOut, LayoutDashboard, LogIn, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useCart from "@/hooks/useCart";
import useTheme from "@/hooks/useTheme";
import { getCategoriesWithCounts } from "@/services/category.api";
import { buildCategoryTree } from "@/utils/categoryTree";
import useSettings from "@/hooks/useSettings";
import { getLocalCartCount } from "@/utils/localCart";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
    const { cartCount, refetchCartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { siteName, logo, contactPhone } = useSettings();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileCatOpen, setMobileCatOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [desktopCatOpen, setDesktopCatOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const catRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
            if (catRef.current && !catRef.current.contains(event.target)) {
                setDesktopCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data: categoriesData } = useQuery({
        queryKey: ["categories-with-counts"],
        queryFn: getCategoriesWithCounts,
        staleTime: 1000 * 60 * 1, // 1 minute cache
        gcTime: 1000 * 60 * 30,
    });

    const categoriesList = useMemo(() => {
        const raw = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);
        return buildCategoryTree(raw);
    }, [categoriesData]);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const query = search.trim();
        if (query) {
            router.push(`/products?search=${encodeURIComponent(query)}`);
        } else {
            router.push(`/products`);
        }
        setMobileOpen(false);
    };

    useEffect(() => {
        refetchCartCount(getLocalCartCount());
        setMounted(true);
    }, [refetchCartCount]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlSearch = new URLSearchParams(window.location.search).get("search") || "";
            setSearch(urlSearch);
        }
    }, [pathname]);

    return (
        <>
            <header className="sticky top-0 z-100 bg-[#7C3AED] text-white border-b border-white/10 shadow-xs dark:bg-slate-950 dark:text-white dark:border-slate-800">
            {/* Top Header */}
            <div className="bg-[#7C3AED] dark:bg-slate-950">
                <div className="mx-auto flex h-14 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-4 gap-2">
                    {/* Left: Mobile/Tablet Menu Button (< lg) / Desktop Logo */}
                    <div className="flex items-center gap-2 shrink-0 lg:hidden">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
                            title="Open Menu"
                        >
                            <Menu className="size-5" />
                        </button>
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-center lg:justify-start shrink-0">
                        <Link href="/" className="flex items-center">
                            {logo ? (
                                <img src={logo} alt={siteName || "Logo"} className="h-8 sm:h-11 w-auto object-contain" />
                            ) : siteName ? (
                                <span suppressHydrationWarning className="text-lg sm:text-2xl font-black text-white dark:text-accent tracking-tight truncate max-w-[160px] sm:max-w-none">
                                    {siteName}
                                </span>
                            ) : null}
                        </Link>
                    </div>

                    {/* Desktop Eye-Friendly Search Bar (>= lg) */}
                    <div className="hidden flex-1 max-w-xl lg:block mx-3">
                        <form onSubmit={handleSearchSubmit} className="flex items-center w-full rounded-full border border-white/20 bg-white p-1 focus-within:border-[#EC4899] focus-within:ring-2 focus-within:ring-[#EC4899]/30 transition-all shadow-2xs dark:bg-slate-800 dark:border-slate-700">
                            <input
                                type="text"
                                placeholder="Search kids toys, electronic learning toys, clothes, shoes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 min-w-0 h-8 bg-transparent px-4 text-xs sm:text-sm text-slate-800 dark:text-foreground placeholder:text-muted-foreground outline-none"
                            />
                            <button
                                type="submit"
                                className="flex h-8 px-5 shrink-0 items-center gap-1.5 justify-center rounded-full btn-action-gold text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
                                title="Search"
                            >
                                <Search className="size-3.5 text-white" />
                                <span>Search</span>
                            </button>
                        </form>
                    </div>

                    {/* Right Utilities (Mobile, Tablet & Desktop) */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                        {/* Mobile/Tablet Search Toggle Button */}
                        <button
                            onClick={() => setMobileSearchOpen((prev) => !prev)}
                            className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 lg:hidden cursor-pointer"
                            title="Toggle Search"
                        >
                            <Search className="size-4.5 text-white" />
                        </button>

                        <Link
                            href="/orders"
                            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20 xl:flex shrink-0 shadow-2xs group"
                        >
                            <Package className="size-4 shrink-0 text-[#F472B6]" />
                            <span>Track Order</span>
                        </Link>

                        {mounted && contactPhone && (
                            <a
                                href={`tel:${contactPhone}`}
                                className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20 xl:flex shrink-0 shadow-2xs"
                            >
                                <Phone className="size-4 shrink-0 text-[#F472B6]" />
                                <span>{contactPhone}</span>
                            </a>
                        )}

                        <div className="hidden h-6 w-px bg-white/20 lg:block" />

                        <button
                            onClick={toggleTheme}
                            className="hidden sm:flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
                            title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {mounted && theme === "dark" ? <Sun className="size-4 text-[#FBBF24]" /> : <Moon className="size-4 text-[#FBBF24]" />}
                        </button>

                        {(!user || (user.role !== "admin" && user.role !== "vendor")) && (
                            <Link
                                href="/cart"
                                aria-label="View Shopping Cart"
                                title="Shopping Cart"
                                className="relative flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105"
                            >
                                <ShoppingCart className="size-4.5 text-white" />
                                {mounted && cartCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#EC4899] text-white text-[10px] font-black shadow-md">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {mounted && (
                            user ? (
                                <div ref={profileRef} className="relative group/profile hidden sm:block">
                                    <button
                                        onClick={() => setProfileOpen((prev) => !prev)}
                                        className="flex size-9 items-center justify-center rounded-full bg-[#EC4899] text-white text-sm font-black shadow-md ring-2 ring-white/30 transition-all duration-200 hover:scale-105 cursor-pointer"
                                        title="Account Menu"
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </button>
                                    <div
                                        className={`transition-all duration-200 absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2.5 shadow-2xl text-foreground ${profileOpen
                                            ? "visible opacity-100 scale-100"
                                            : "invisible opacity-0 scale-95 group-hover/profile:visible group-hover/profile:opacity-100 group-hover/profile:scale-100"
                                            }`}
                                    >
                                        <div className="px-3 py-2.5 border-b border-border mb-1.5">
                                            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                        <Link
                                            href={user?.role === "vendor" ? "/dashboard/vendor" : "/dashboard"}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors"
                                        >
                                            <LayoutDashboard className="size-4 text-primary" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            href="/dashboard/profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors"
                                        >
                                            <User className="size-4 text-primary" />
                                            <span>Profile</span>
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                setProfileOpen(false);
                                                await logout();
                                                router.push("/");
                                            }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer mt-1"
                                        >
                                            <LogOut className="size-4 text-destructive" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="hidden sm:inline-flex rounded-full btn-action-gold px-5 py-2 text-xs font-black transition-all duration-200 hover:scale-105 shadow-xs"
                                >
                                    Login
                                </Link>
                            )
                        )}
                    </div>
                </div>

                {/* Expandable Mobile Search Bar */}
                {mobileSearchOpen && (
                    <div className="px-3 py-2 bg-[#6D28D9] dark:bg-slate-900 border-t border-white/10 md:hidden">
                        <form onSubmit={handleSearchSubmit} className="flex items-center w-full rounded-full border border-white/20 bg-white p-1 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                            <input
                                type="text"
                                placeholder="Search kids toys, clothes, shoes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                className="w-full h-7 bg-transparent pl-3.5 pr-2 text-xs text-slate-800 dark:text-foreground placeholder:text-muted-foreground outline-none"
                            />
                            <button
                                type="submit"
                                className="flex h-7 px-4 shrink-0 items-center justify-center rounded-full btn-action-gold text-xs font-bold shadow-xs cursor-pointer"
                            >
                                <Search className="size-3.5 text-white" />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Second Navigation Bar */}
            <nav className="hidden border-t border-white/10 md:block bg-[#6D28D9] dark:bg-slate-900 dark:border-slate-800">
                <div className="relative mx-auto max-w-7xl px-4">
                    <div className="flex h-12 sm:h-13 items-center justify-between gap-2 overflow-visible">
                        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-3 flex-1 min-w-0 overflow-visible">
                            <Link href="/" className={`flex items-center gap-1.5 rounded-xl px-2.5 lg:px-3.5 py-1.5 text-xs lg:text-sm font-bold transition-all shrink-0 ${pathname === "/" ? "bg-white/20 text-[#F472B6] border border-white/30 shadow-2xs" : "text-white hover:bg-white/10 hover:text-[#F472B6]"}`}>
                                <House className="size-4 text-[#F472B6]" />
                                <span>Home</span>
                            </Link>

                            {/* Categories Mega Dropdown */}
                            <div ref={catRef} className="group/cat relative shrink-0">
                                <button
                                    onClick={() => setDesktopCatOpen((prev) => !prev)}
                                    className="flex items-center gap-1.5 rounded-xl px-2.5 lg:px-3.5 py-1.5 text-xs lg:text-sm font-bold text-white hover:bg-white/10 hover:text-[#F472B6] transition-all cursor-pointer"
                                >
                                    <LayoutGrid className="size-4 text-[#F472B6]" />
                                    <span>Categories</span>
                                    <ChevronDown className={`size-3.5 text-white/70 transition-transform duration-200 ${desktopCatOpen ? "rotate-180" : "group-hover/cat:rotate-180"}`} />
                                </button>

                                {/* Mega Dropdown Menu */}
                                <div className={`${desktopCatOpen ? "visible opacity-100" : "invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100"} transition-all duration-200 absolute left-0 sm:-left-4 md:-left-8 lg:left-0 right-auto top-full pt-1.5 z-100 w-[90vw] max-w-5xl`}>
                                    <div className="rounded-2xl border border-purple-100 bg-card p-6 shadow-2xl text-foreground">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-h-[420px] overflow-y-auto pr-1">
                                            {categoriesList && categoriesList.length > 0 ? (
                                                categoriesList.map((cat, idx) => (
                                                    <div key={cat._id || `${cat.slug || 'cat'}-${idx}`} className="space-y-2">
                                                        <Link
                                                            href={`/products?category=${cat.slug}`}
                                                            onClick={() => setDesktopCatOpen(false)}
                                                            className="block text-sm sm:text-base font-extrabold text-foreground hover:text-primary transition-colors truncate"
                                                        >
                                                            {cat.name}
                                                        </Link>
                                                        {cat.children && cat.children.length > 0 && (
                                                            <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
                                                                {cat.children.map((child, cIdx) => (
                                                                    <li key={child._id || `${child.slug || 'child'}-${cIdx}`}>
                                                                        <Link
                                                                            href={`/products?category=${child.slug}`}
                                                                            onClick={() => setDesktopCatOpen(false)}
                                                                            className="hover:text-primary hover:underline block truncate transition-colors"
                                                                        >
                                                                            {child.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground col-span-full">Loading categories...</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link href="/products" className={`flex items-center gap-1.5 rounded-xl px-2.5 lg:px-3.5 py-1.5 text-xs lg:text-sm font-bold transition-all shrink-0 ${pathname === "/products" ? "bg-white/20 text-[#F472B6] border border-white/30 shadow-2xs" : "text-white hover:bg-white/10 hover:text-[#F472B6]"}`}>
                                <Store className="size-4 text-[#F472B6]" />
                                <span>Shop Products</span>
                            </Link>

                            <Link
                                href="/best-selling"
                                className={`flex items-center gap-1.5 rounded-xl px-2.5 lg:px-3.5 py-1.5 text-xs lg:text-sm font-bold transition-all shrink-0 ${pathname === "/best-selling" ? "bg-white/20 text-[#F472B6] border border-white/30 shadow-2xs" : "text-white hover:bg-white/10 hover:text-[#F472B6]"}`}
                            >
                                <TrendingUp className="size-4 text-[#F472B6]" />
                                <span>Best Selling</span>
                            </Link>

                            <Link
                                href="/flash-sale"
                                className={`flex items-center gap-1.5 rounded-xl px-2.5 lg:px-3.5 py-1.5 text-xs lg:text-sm font-bold transition-all shrink-0 ${pathname === "/flash-sale" ? "bg-white/20 text-[#F472B6] border border-white/30 shadow-2xs" : "text-white hover:bg-white/10 hover:text-[#F472B6]"}`}
                            >
                                <Zap className="size-4 text-[#F472B6] fill-[#F472B6]/20" />
                                <span>Flash Deals</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                            <Link
                                href="/become-seller"
                                className="flex items-center gap-1.5 rounded-full btn-action-gold px-3 sm:px-4 py-1.5 text-xs font-bold transition-all hover:scale-105 shadow-2xs shrink-0"
                            >
                                <Sparkles className="size-3.5 text-white" />
                                <span>Become a Seller</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile/Tablet Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-100 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-card text-card-foreground shadow-2xl overflow-y-auto border-r border-border flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <Link href="/" onClick={() => setMobileOpen(false)}>
                                    {logo ? (
                                        <img src={logo} alt={siteName || "Logo"} className="h-9 w-auto object-contain" />
                                    ) : siteName ? (
                                        <span suppressHydrationWarning className="text-lg font-black text-primary dark:text-accent">{siteName}</span>
                                    ) : null}
                                </Link>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="px-5 py-4">
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search kids toys & items..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary shadow-2xs"
                                    />
                                </form>
                            </div>

                            <nav className="border-t border-border px-5 py-3 space-y-1">
                                <Link
                                    href="/"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-all"
                                >
                                    <House className="size-4 text-primary" /> Home
                                </Link>

                                <Link
                                    href="/products"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-all"
                                >
                                    <Store className="size-4 text-primary" /> Shop Products
                                </Link>

                                <Link
                                    href="/best-selling"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-all"
                                >
                                    <TrendingUp className="size-4 text-primary" /> Best Selling
                                </Link>

                                <Link
                                    href="/flash-sale"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-all"
                                >
                                    <Zap className="size-4 text-primary fill-primary/20" /> Flash Deals
                                </Link>

                                <Link
                                    href="/orders"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-all"
                                >
                                    <Package className="size-4 text-primary" /> Track Order
                                </Link>

                                <Link
                                    href="/become-seller"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-all"
                                >
                                    <Sparkles className="size-4 text-primary" /> Become a Seller
                                </Link>
                            </nav>
                        </div>

                        {/* Mobile Drawer Profile / Account Footer */}
                        {mounted && (
                            user ? (
                                <div className="border-t border-border px-5 py-4 mt-auto space-y-3 bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-black text-primary-foreground shadow-md shrink-0">
                                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <div className="truncate flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Link
                                            href={user?.role === "vendor" ? "/dashboard/vendor" : "/dashboard"}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted/80 transition-all"
                                        >
                                            <LayoutDashboard className="size-3.5 text-primary" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <Link
                                            href="/dashboard/profile"
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted/80 transition-all"
                                        >
                                            <User className="size-3.5 text-primary" />
                                            <span>Profile</span>
                                        </Link>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setMobileOpen(false);
                                            await logout();
                                            router.push("/");
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
                                    >
                                        <LogOut className="size-3.5 text-destructive" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-border px-5 py-4 mt-auto">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 py-2.5 text-xs font-black text-primary-foreground shadow-md"
                                    >
                                        <LogIn className="size-4" />
                                        <span>Login / Register</span>
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </header>

        {/* Fixed Mobile & Tablet Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-90 bg-card/95 backdrop-blur-md border-t border-border py-1.5 px-2 lg:hidden shadow-lg shadow-black/10">
            <div className="flex items-center justify-around w-full max-w-7xl mx-auto px-2 sm:px-6">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 transition-colors ${
                        pathname === "/" ? "text-primary font-extrabold" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <House className="size-5 shrink-0" />
                    <span className="text-[10px] tracking-tight">Home</span>
                </Link>

                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <Menu className="size-5 shrink-0" />
                    <span className="text-[10px] tracking-tight">Menu</span>
                </button>

                <Link
                    href="/cart"
                    className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 transition-colors ${
                        pathname === "/cart" ? "text-primary font-extrabold" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <div className="relative">
                        <ShoppingCart className="size-5 shrink-0" />
                        {mounted && cartCount > 0 && (
                            <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-[#EC4899] text-white text-[9px] font-black shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] tracking-tight">Cart</span>
                </Link>

                {contactPhone ? (
                    <a
                        href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 text-muted-foreground hover:text-emerald-600 transition-colors"
                    >
                        <MessageSquare className="size-5 shrink-0 text-emerald-500" />
                        <span className="text-[10px] tracking-tight">Chat</span>
                    </a>
                ) : (
                    <Link
                        href="/products"
                        className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 transition-colors ${
                            pathname === "/products" ? "text-primary font-extrabold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Store className="size-5 shrink-0" />
                        <span className="text-[10px] tracking-tight">Shop</span>
                    </Link>
                )}

                <Link
                    href={user ? (user.role === "vendor" ? "/dashboard/vendor" : "/dashboard") : "/login"}
                    className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 transition-colors ${
                        pathname.startsWith("/dashboard") || pathname === "/login"
                            ? "text-primary font-extrabold"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <User className="size-5 shrink-0" />
                    <span className="text-[10px] tracking-tight">{user ? "Account" : "Account"}</span>
                </Link>
            </div>
        </div>
    </>
    );
};

export default Navbar;
