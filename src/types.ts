export interface NavigationItem {
  id: string;
  label: string;
  scrollRatio: number;
}

export interface Project {
  title: string;
  category: string;
  description: string;
  tags: string[];
}

export interface ExpertiseItem {
  title: string;
  percentage: number;
  description: string;
}
