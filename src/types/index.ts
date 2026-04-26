export type RequestStatus =
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  price_label: string;
  timeline: string;
  is_active: boolean;
  sort_order: number;
}

export interface ClientRequest {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  service_id: string;
  service_name: string;
  budget_range: string | null;
  project_details: string;
  status: RequestStatus;
  quoted_price: number | null;
  quoted_currency: string | null;
  quoted_deadline: string | null;   // ISO date — starts the countdown
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_role: 'admin' | 'client';
  sender_name: string;
  message: string;
  is_checkpoint: boolean;           // admin-only flag — shown as milestone on timeline
  created_at: string;
}

export interface PortfolioProject {
  id: string;
  name: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  images: string[]; 
  project_url: string | null;                // array of public URLs
  status: 'delivered' | 'in_progress' | 'archived';
  sort_order: number;
  created_at: string;
}

export interface StatusStep {
  key: RequestStatus;
  label: string;
  description: string;
}

export const STATUS_STEPS: StatusStep[] = [
  { key: 'submitted',   label: 'Submitted',   description: 'Your request has been received and is queued for review.' },
  { key: 'reviewing',   label: 'Reviewing',   description: 'Enoch is reviewing your project details.' },
  { key: 'quoted',      label: 'Quoted',      description: 'A quote has been sent — check your email and the countdown below.' },
  { key: 'in_progress', label: 'In Progress', description: 'Work has started on your project.' },
  { key: 'review',      label: 'Review',      description: 'Your project is ready for your feedback and approval.' },
  { key: 'completed',   label: 'Completed',   description: 'Project delivered! Thank you for working with The Jackson.' },
];
