/** Shared by both Workers. */
export const statuses = ['New', 'Contacted', 'Accepted', 'Declined'] as const;
export type Status = (typeof statuses)[number];

export interface Lead {
  id: string;
  type: 'beta' | 'enquiry' | 'chat';
  created_at: string;
  name: string;
  email: string;
  business: string | null;
  country: string | null;
  topic: string | null;
  message: string | null;
  business_type: string | null;
  first_task: string | null;
  source_page: string | null;
  contact_consent_at: string;
  marketing_consent: number;
  marketing_consent_at: string | null;
  consent_wording_version: string | null;
  status: Status;
  notes: string;
  detected_country: string | null;
  detected_region: string | null;
  /** Other saved leads with the same scrambled source. The hash itself is never sent to the page. */
  same_source?: number;
}
