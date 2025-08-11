import React from 'react';
import { cn } from '../../utils/cn';
import { Search } from 'lucide-react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="search"
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={placeholder}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";

export { SearchBar };
