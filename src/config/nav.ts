/** Enquiry topics. The value is what the modal sends and what a button's data-enquiry attribute names. */
export const enquiryTopics = [
  { value: 'call', label: 'Book a discovery call' },
  { value: 'app', label: 'Ask about an app' },
  { value: 'studio', label: 'An AI plan for my business' },
  { value: 'other', label: 'Something else' },
] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number]['value'];

/** Page links in the header, and in the Menu panel below 1200px. Apps is one link, with no dropdown. */
export const pageLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Apps', href: '/apps' },
] as const;

export const footerColumns = [
  {
    heading: 'Services',
    links: [
      { label: 'Build your AI plan', href: '/spark-studio' },
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
    heading: 'How it works',
    links: [
      { label: 'Our process', href: '/how-it-works#steps' },
      { label: 'Your AI plan', href: '/how-it-works#plan' },
      { label: 'Your business knowledge', href: '/how-it-works#business-knowledge' },
      { label: 'Your rules', href: '/how-it-works#rules' },
      { label: 'Team training', href: '/how-it-works#training' },
    ],
  },
] as const;
