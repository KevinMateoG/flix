'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search movies, TV shows...',
}: SearchInputProps) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="text-muted absolute top-1/2 left-3 -translate-y-1/2" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-surface-bright bg-surface-container text-body-lg text-on-surface focus:border-primary h-14 w-full rounded border pr-10 pl-10 transition-colors focus:outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-muted hover:text-on-background absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
