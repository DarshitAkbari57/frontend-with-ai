'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Experiences', href: '/experiences' },
  { name: 'Activities', href: '/activities' },
  { name: 'Bookings', href: '/bookings' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-zinc-900/40 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white/70 backdrop-blur-xl border-r border-zinc-200/50 transform transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 shadow-2xl shadow-zinc-200/50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold text-zinc-900">Portal</h2>
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                      : "text-zinc-600 hover:bg-zinc-100/50 hover:text-zinc-900"
                  )}
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
