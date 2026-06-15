export interface NavLink {
  label: string;
  href: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterState {
  sizes: string[];
  colors: string[];
  sort: string;
}
