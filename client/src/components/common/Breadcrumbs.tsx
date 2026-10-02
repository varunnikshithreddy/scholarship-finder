import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 py-3" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-indigo-600 transition flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.href ? (
            <Link to={item.href} className="hover:text-indigo-600 transition truncate max-w-[200px]">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-semibold truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
