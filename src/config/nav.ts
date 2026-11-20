/** Enquiry topics. The value is what the modal sends and what a button's data-enquiry attribute names. */
export const enquiryTopics = [
  { value: 'call', label: 'Book a discovery call' },
  { value: 'demo', label: 'Request a demo' },
  { value: 'pricing', label: 'Enquire about pricing' },
  { value: 'general', label: 'General questions' },
  { value: 'support', label: 'I need support' },
] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number]['value'];

/** Page links in the header, and in the Menu panel below 1200px. */
export const pageLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Apps', href: '/apps' },
] as const;

export const footerColumns = [
  {
    heading: 'Learn more',
    links: [
      { label: 'Build your AI plan', href: '/services' },
      { label: 'Cut manual admin', href: '/bring-ai-in' },
      { label: 'Use AI safely', href: '/scale-ai' },
    ],
  },
  {
    heading: 'Apps',
    links: [
      { label: 'Sparkkeeper', href: '/apps#sparkkeeper' },
      { label: 'Magnet', href: '/apps#magnet' },
      { label: 'Academy', href: '/apps#academy' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Our process', href: '/services#steps' },
      { label: 'Your AI plan', href: '/services#plan' },
      { label: 'Your business knowledge', href: '/services#business-knowledge' },
      { label: 'Your rules', href: '/services#rules' },
      { label: 'Team training', href: '/services#training' },
    ],
  },
] as const;
