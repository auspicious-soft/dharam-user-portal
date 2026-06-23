export interface DomainItem {
  id: string;
  title: string;
  order?: number;
  taskLabel?: string;
  taskName?: string;
  status?: string;
  isPremium?: boolean;
  isLocked?: boolean;
}

export interface Module {
  id: string;
  title: string;
  order?: number;
  task: number;
  price?: number | null;
  isPremium?: boolean;
  status?: string;
  items: DomainItem[];
}
