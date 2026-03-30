export interface DomainItem {
  id: string;
  title: string;
  taskLabel?: string;
  taskName?: string;
  isPremium?: boolean;
}

export interface Module {
  id: string;
  title: string;
  task: number;
  isPremium?: boolean;
  items: DomainItem[];
}
