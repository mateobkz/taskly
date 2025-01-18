export type ApplicationStatus = 'To Apply' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

export interface Application {
  id: number;
  user_id: string;
  dashboard_id: number | null;
  company_name: string;
  position: string;
  location: string | null;
  application_date: string;
  status: ApplicationStatus;
  application_url: string | null;
  notes: string | null;
  contact_person: string | null;
  next_step: string | null;
  created_at: string;
  updated_at: string;
}