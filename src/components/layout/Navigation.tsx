'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/tasks/new', label: 'Create Task' },
  { href: '/profile', label: 'Profile' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4" aria-label="Main navigation">
        <Link href="/" className="text-lg font-semibold" aria-label="Task Manager home">
          Task Manager
        </Link>

        <button
          className="inline-flex items-center justify-center rounded-md border border-border p-2 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </div>
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary">{user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={logout} aria-label="Log out">Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm">Sign Up</Button></Link>
            </div>
          )}
        </div>
      </nav>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => { logout(); setOpen(false); }} aria-label="Log out">Logout</Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/register"><Button size="sm">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
