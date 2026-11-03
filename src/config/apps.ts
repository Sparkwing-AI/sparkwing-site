/** Copy for the three "coming soon" app pages (FR-301). Words are from the Apps canvas and the requirements. */
export type AppId = 'magnet' | 'academy' | 'nest';

export interface AppInfo {
  id: AppId;
  name: string;
  logo: string;
  promise: string;
  body: string;
  points: string[];
  title: string;
  description: string;
  sceneLabel: string;
}

export const apps: Record<AppId, AppInfo> = {
  magnet: {
    id: 'magnet',
    name: 'Magnet',
    logo: '/assets/logos/magnet.svg',
    promise: 'Fewer missed follow-ups and renewals.',
    body: 'Magnet looks after your leads, from first enquiry to yes.',
    points: [
      'Capture enquiries in one place',
      'Send reminders so nobody slips',
      'Run simple campaigns',
      'When a lead says yes, they become a client in Sparkkeeper',
    ],
    title: 'Magnet: fewer missed follow-ups, Sparkwing',
    description:
      'Catch enquiries and follow them up. When a lead says yes, they become a client in Sparkkeeper. Coming soon.',
    sceneLabel: 'Animation: enquiries are drawn to Magnet, and a lead who says yes becomes a client in Sparkkeeper.',
  },
  academy: {
    id: 'academy',
    name: 'Academy',
    logo: '/assets/logos/academy.svg',
    promise: 'Your team learns AI before using it with real client information.',
    body: 'Short online courses that teach people to use AI safely in their own work.',
    points: [
      'Short courses, made for busy teams',
      'Safe AI habits for everyday work',
      'Finishing a course can unlock access to other apps',
    ],
    title: 'Academy: AI training for your team, Sparkwing',
    description:
      'Short online courses that teach your team to use AI safely in their own work. Coming soon.',
    sceneLabel: 'Animation: a course fills up step by step, then unlocks access to an app.',
  },
  nest: {
    id: 'nest',
    name: 'Nest',
    logo: '/assets/logos/nest.svg',
    promise: 'One place your whole team checks in.',
    body: "Your team's own internal AI home page. Add it when more of your people start using AI.",
    points: ['AI news and team announcements', 'Links to training', 'A place to request access to apps'],
    title: "Nest: your team's AI home page, Sparkwing",
    description:
      "One place for your team's AI news, announcements, training links and app access requests. Coming soon.",
    sceneLabel: 'Animation: AI news, announcements and training links land in one place for the team.',
  },
};
