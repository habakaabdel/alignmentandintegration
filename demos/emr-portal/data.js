/* Riverbend Family Services staff portal - demonstration data.
   Every agency, program, person, number and date below is invented for this
   demonstration. Nothing here comes from a real client record, a real staff
   roster, or a real service file. The EMR named throughout is generic and
   stands in for whichever record system an agency already runs. */

/* ---------- Icons (inline, no icon font, no network) ---------- */
const ICON = {
  Search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  ArrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  ArrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  ArrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  Video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>',
  FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  HelpCircle: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  Megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  Play: '<path d="M8 5v14l11-7z"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/>',
  X: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  LifeBuoy: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.2 4.2"/><path d="m14.9 14.9 4.2 4.2"/><path d="m14.9 9.1 4.2-4.2"/><path d="m4.9 19.1 4.2-4.2"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  Paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.93 8.8l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  KeyRound: '<path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  BookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  Building2: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
};

/* ---------- Agency identity (fictional) ---------- */
const AGENCY = {
  name: 'Riverbend Family Services',
  short: 'Riverbend',
  sub: 'Community health and wellness services',
  region: 'the Lakeside district',
};

/* ---------- Homepage tiles ---------- */
const SECTIONS = [
  { id: 'program-guides', icon: 'BookOpen', accent: 'red', title: 'Program Guides',
    desc: 'How the EMR works, plus every program. Pick yours for its client journey, activities, forms, and reports.',
    meta: 'all programs', href: '#/program-guides' },
  { id: 'videos', icon: 'Video', accent: 'red', title: 'Video Tutorials',
    desc: 'Short walkthroughs recorded during the rollout training sessions.',
    meta: '12 modules', href: '#/videos' },
  { id: 'onboarding', icon: 'KeyRound', accent: 'cedar', title: 'Onboarding & Offboarding',
    desc: 'The people and systems process when a staff member arrives or leaves.',
    meta: 'People / IT', href: '#/onboarding' },
  { id: 'faq', icon: 'HelpCircle', accent: 'dark', title: 'FAQ',
    desc: 'Answers to the questions staff ask most often about the EMR.',
    meta: 'questions', href: '#/faq' },
  { id: 'news', icon: 'Megaphone', accent: 'dark', title: 'News & Updates',
    desc: 'Announcements, system updates, and what the field is telling us.',
    meta: '', href: '#/news' },
];

/* ---------- Training videos (fictional; playback is disabled in the demo) ---------- */
const VIDEOS = [
  { id: 'v1',  title: 'Signing in and the user menu',        category: 'Core series', len: '4 min' },
  { id: 'v2',  title: 'Reading your dashboard',              category: 'Core series', len: '6 min' },
  { id: 'v3',  title: 'The agency address book',             category: 'Core series', len: '5 min' },
  { id: 'v4',  title: 'Finding and adding a client',         category: 'Core series', len: '8 min' },
  { id: 'v5',  title: 'The client summary page',             category: 'Core series', len: '7 min' },
  { id: 'v6',  title: 'The client menu',                     category: 'Core series', len: '5 min' },
  { id: 'v7',  title: 'Logging a contact',                   category: 'Core series', len: '9 min' },
  { id: 'v8',  title: 'Appointments and the calendar',       category: 'Core series', len: '6 min' },
  { id: 'v9',  title: 'Writing a case note',                 category: 'Core series', len: '11 min' },
  { id: 'v10', title: 'Case data forms',                     category: 'Core series', len: '8 min' },
  { id: 'v11', title: 'Referrals in and out',                category: 'Specialty',   len: '7 min' },
  { id: 'v12', title: 'Running your program reports',        category: 'Specialty',   len: '10 min' },
];

/* ---------- News (fictional) ---------- */
const NEWS = [
  { date: 'Jun 24, 2027', tag: 'Guidance',
    title: 'Documentation guidance: worker roles and conference types',
    excerpt: 'Two rules to follow. First, the Primary Worker on a client is always their main worker, and the program supervisor is always added under Support Workers so both keep visibility. Programs sharing a client load add the other team members as Support Workers too, set in Program History. Second, log a Team Conference when the conversation stays inside your program team, and a Case Conference when it includes an outside provider or the client.' },
  { date: 'Jun 17, 2027', tag: 'Announcement',
    title: 'The new EMR is live across all Riverbend programs',
    excerpt: 'The new EMR is now the case management system for every Riverbend health and wellness program. Sign in with your Riverbend work account. Paper notes written during the two week transition window are being back entered, so check with your supervisor if you still have some on your desk.' },
  { date: 'Jun 17, 2027', tag: 'Support',
    title: 'Drop in support desk, Wednesday and Thursday',
    excerpt: 'The rollout team is in the main boardroom from 9 to 4 on Wednesday and Thursday for sign in help, first contact notes, and anything else about the new EMR. Bring your laptop, no appointment needed.' },
  { date: 'Jun 03, 2027', tag: 'Update',
    title: 'Nine new activity codes added for the wellness streams',
    excerpt: 'Nine activity codes were added so promotion and community wellness work can be recorded without forcing it into a counselling code. Program leads reviewed the list. If your program needs one more, send it to the support desk and it goes in the next configuration window.' },
];

/* ---------- FAQ (fictional) ---------- */
const FAQ = [
  { q: 'Where do I sign in to the EMR?', a: 'The EMR is reached from the Sign in button at the top of this portal. Bookmark it. In this demonstration the button is decorative and opens a notice instead.' },
  { q: 'Which browser should I use?', a: 'Use a current version of Chrome or Edge. Older browsers may not render the case note editor correctly.' },
  { q: 'I got an error when signing in. What now?', a: 'Confirm you are using your Riverbend work account rather than a personal account. If the error repeats, tell your supervisor and send a note to the portal support desk with the exact wording of the message.' },
  { q: 'Do I write contact notes in first or third person?', a: 'Always third person. Use "the writer" rather than "I". For example: the writer met with the client to review the discharge plan.' },
  { q: 'What does it mean to authenticate a note?', a: 'Authentication locks the note as final and complete, and it is required on every contact note. You are prompted for your password. Once authenticated the note cannot be edited, so an unlock has to be requested from a system administrator.' },
  { q: 'What is the maximum file size for an attachment?', a: '256 MB per file. Hold Ctrl or Shift while selecting to upload several files at once.' },
  { q: 'How do I get a new staff member into the EMR?', a: 'The people team sends two parallel requests once the role guide confirms the role needs access: one to IT for single sign on, one to the portal support desk to create the account and program access. Both have to finish before the person can sign in.' },
  { q: 'What happens when a staff member leaves?', a: 'The people team owns the trigger. The same two request process runs in reverse: IT deactivates single sign on and the support desk closes the account and removes program access.' },
  { q: 'Where can I share feedback about the system?', a: 'Tell your supervisor, or send it to the portal support desk. Nothing is too small. Most of the configuration changes made this year started as one worker saying a field did not fit the work.' },
  { q: 'What if the client is not associated with my selected program?', a: 'Do not click past the warning. Flag it with your supervisor the same day so program access and chart routing get corrected.' },
  { q: 'Who is the Primary Worker, and who goes under Support Workers?', a: 'The Primary Worker is the client\'s main worker. The program supervisor is always added under Support Workers so both keep visibility. If two programs share the client, add the other team members as Support Workers as well. This is set in the client\'s Program History.' },
  { q: 'When do I log a Team Conference instead of a Case Conference?', a: 'Team Conference when the conversation stays inside your program team. Case Conference when it includes an outside provider or the client themselves.' },
  { q: 'How do I request an unlock after authenticating a note?', a: 'Send the request to the portal support desk with the client identifier, the date of service, and the reason for the correction. A system administrator unlocks it and the edit is tracked.' },
  { q: 'Does every role need an EMR account?', a: 'No. The role guide decides. Roles with no client contact and no reporting duty are set up with IT only. Your supervisor can confirm which side your role falls on.' },
  { q: 'Are there drop in sessions for help?', a: 'Yes, Wednesday and Thursday mornings in the main boardroom for the first month after go live. After that, the support desk answers within one business day.' },
  { q: 'What about paper notes from the transition window?', a: 'They get back entered into the EMR. Work with your supervisor so nothing sits in a drawer past month end, since the month end reports read from the system and not from paper.' },
  { q: 'Who is behind the support desk?', a: 'The central intake team runs it. They monitor the queue, route configuration changes, set up accounts, and answer reporting questions. Central intake is the system owner.' },
  { q: 'Can I see a client from another program?', a: 'Only if you are named on that client\'s Program History as Primary or Support Worker. Access follows the program, not the building.' },
];

/* ---------- Troubleshooting map (answers come from the FAQ above) ---------- */
const TROUBLESHOOT_RAW = [
  { symptom: 'I cannot sign in', faq: ['I got an error when signing in', 'Which browser'], links: [{ label: 'Onboarding and access process', href: '#/onboarding' }] },
  { symptom: 'I made a mistake in a note I already authenticated', faq: ['request an unlock', 'authenticate a note'], links: [{ label: 'Your program guide: documenting contacts', href: '#/program-guides' }] },
  { symptom: '"Client is not associated with the selected program" warning', faq: ['not associated with my selected program', 'see a client from another program'], links: [] },
  { symptom: 'My attachment will not upload', faq: ['maximum file size'], links: [{ label: 'Your program guide: attachments', href: '#/program-guides' }] },
  { symptom: 'I do not know which program or activity to select', faq: ['Does every role need'], links: [{ label: 'Find your program guide', href: '#/program-guides' }] },
  { symptom: 'I need help from a person', faq: ['behind the support desk', 'drop in sessions'], links: [] },
];

/* ---------- Streams and programs (fictional) ---------- */
const STREAMS = [
  { id: 'A', name: 'Counselling & Treatment', report: 'Health PDS / Child & Youth BI' },
  { id: 'B', name: 'Case Management & Coordinated Access', report: 'Health PDS' },
  { id: 'C', name: 'Crisis & Mobile Response', report: 'Health PDS' },
  { id: 'D', name: 'Addictions & Problem Gambling', report: 'Health PDS + modules' },
  { id: 'E', name: 'Justice, Diversion & Reintegration', report: 'Justice Schedule G' },
  { id: 'F', name: 'Child, Youth, Transition & Family', report: 'Child & Youth BI' },
  { id: 'G', name: 'Developmental & Rehabilitation', report: 'Child & Youth BI' },
  { id: 'H', name: 'Health Promotion & Community Wellness', report: 'Community transfer' },
];

const GUIDE_PROGRAMS = [
  { slug: 'child-youth-counselling', title: 'Child & Youth Counselling (CYC)', stream: 'A', status: 'available',  desc: 'Referral through aftercare, and the shared child and adult form set.' },
  { slug: 'adult-therapy',           title: 'Adult Therapy Services',          stream: 'A', status: 'coming-soon', desc: 'Individual therapy, internally referred.' },

  { slug: 'hart-hub-cm',    title: 'HART Hub Case Management',            stream: 'B', status: 'available',  desc: 'Five stages of care, care team documentation, and every contact type.' },
  { slug: 'adult-mh-cm',    title: 'Adult Mental Health Case Management',  stream: 'B', status: 'available',  desc: 'Community referrals, the holistic needs review, and ongoing case work.' },
  { slug: 'central-intake', title: 'Central Intake',                       stream: 'B', status: 'available',  desc: 'The front door for referrals into every program except residential.' },
  { slug: 'reintegration',  title: 'Community Reintegration',              stream: 'B', status: 'coming-soon', desc: 'Runs on the adult case management configuration.' },

  { slug: 'crisis-counselling', title: 'Short Term Crisis Counselling (STCC)', stream: 'C', status: 'available',  desc: 'Two note types: individual crisis counselling and community crisis response.' },
  { slug: 'mobile-wellness',    title: 'Mobile Wellness Team (MWT)',           stream: 'C', status: 'coming-soon', desc: 'Mobile deployment through follow up.' },

  { slug: 'raam-support',        title: 'RAAM Clinic Support',                  stream: 'D', status: 'coming-soon', desc: 'Rapid access clinic support, referred internally.' },
  { slug: 'justice-addictions',  title: 'Addictions Counselling (Justice Centre)', stream: 'D', status: 'coming-soon', desc: 'Counselling delivered inside the justice centre.' },
  { slug: 'gambling-awareness',  title: 'Problem Gambling Awareness',           stream: 'D', status: 'coming-soon', desc: 'Referral through follow up, plus community workshops.' },

  { slug: 'mentorship', title: 'Mentorship & Diversion Program', stream: 'E', status: 'coming-soon', desc: 'Its own referral pathway, eligibility screen, and instrument set.' },

  { slug: 'youth-hub',        title: 'Youth Wellness Hub',        stream: 'F', status: 'available',  desc: 'Walk in, peer support, and integrated youth services.' },
  { slug: 'youth-transition', title: 'Youth in Transition',       stream: 'F', status: 'coming-soon', desc: 'Case management and system linkage for transition age youth.' },
  { slug: 'youth-outreach',   title: 'Youth Outreach & Engagement', stream: 'F', status: 'coming-soon', desc: 'Engagement, advocacy, and system linkage.' },
  { slug: 'residential-youth', title: 'Residential Youth Treatment', stream: 'F', status: 'coming-soon', desc: 'Live in treatment, daily contacts, and treatment plans.' },

  { slug: 'developmental-services', title: 'Developmental Services Team', stream: 'G', status: 'coming-soon', desc: 'Referral through follow up for speech, occupational, and rehabilitation staff.' },

  { slug: 'diabetes-education', title: 'Diabetes Education & Prevention', stream: 'H', status: 'coming-soon', desc: 'Screening and education sessions, referral through follow up.' },
  { slug: 'wellness-promotion', title: 'Wellness Promotion',              stream: 'H', status: 'coming-soon', desc: 'Population level sessions, awareness events, and resource distribution.' },
  { slug: 'community-wellness', title: 'Community Wellness Team',         stream: 'H', status: 'coming-soon', desc: 'Group and land based activity, in its own right and in support of other programs.' },
  { slug: 'family-wellbeing',   title: 'Family Well-Being Program',       stream: 'H', status: 'coming-soon', desc: 'Family focused case management, referral through follow up.' },
  { slug: 'childrens-wellness', title: "Children's Wellness Program",     stream: 'H', status: 'coming-soon', desc: 'Early years, sensory, and communication supports.' },
];

const GUIDE_SECTION_LABELS = [
  { id: 'client-journey',    label: 'Client Journey' },
  { id: 'document-contact',  label: 'Document a Contact' },
  { id: 'document-workload', label: 'Workload Time' },
  { id: 'activities',        label: 'Activities' },
  { id: 'attachments',       label: 'Attachments' },
  { id: 'case-forms',        label: 'Case Data Forms' },
  { id: 'goal-planning',     label: 'Goal Planning' },
  { id: 'critical-flag',     label: 'Critical Flag' },
  { id: 'reports',           label: 'Reports' },
];

/* ---------- Shared configuration used by every guide ---------- */
const OVERVIEW_STAGES = [
  { n: 'Stage 1', t: 'Referral',               s: 'Referral received',  e: 'First contact made' },
  { n: 'Stage 2', t: 'First Contact / Intake', s: 'First contact date', e: 'Service initiated' },
  { n: 'Stage 3', t: 'Receiving Services',     s: 'Service initiation', e: 'Discharge planning begins' },
  { n: 'Stage 4', t: 'Discharge Planning',     s: 'Discharge decided',  e: 'Service ended' },
  { n: 'Stage 5', t: 'Aftercare',              s: 'At or after discharge', e: 'Follow up complete' },
];

const GLOBAL_CLIENT_ACTIVITIES = [
  { name: 'Intake / Initial Assessment', when: 'Completing the intake or the first assessment.' },
  { name: 'Assessment (general)', when: 'Any other assessment contact.' },
  { name: 'Assessment (risk)', when: 'A risk assessment contact.' },
  { name: 'Case Conference', when: 'A conference that includes an outside provider or the client. Conferences inside your own team are logged as Team Conference instead.' },
  { name: 'Individual Counselling', when: 'A one to one counselling session.' },
  { name: 'Care Planning', when: 'Building or updating the care plan with the client.' },
  { name: 'Crisis Support', when: 'Crisis response delivered directly to a client.' },
  { name: 'Safety Planning', when: 'Writing or reviewing a safety plan.' },
  { name: 'Family Contact', when: 'Contact with family or a named support person.' },
  { name: 'Outreach / Home Visit', when: 'Seeing the client in the community or at home.' },
  { name: 'System Navigation', when: 'Working on the client\'s behalf with another system or agency.' },
  { name: 'Accompaniment', when: 'Taking the client to an appointment.' },
  { name: 'Group Session', when: 'A session run with several clients.' },
  { name: 'Follow-Up', when: 'A follow up contact.' },
  { name: 'Referral', when: 'Completing a referral out for the client.' },
  { name: 'Discharge Planning', when: 'Formal discharge planning, or completing the discharge.' },
  { name: 'Aftercare Follow-Up', when: 'A follow up contact after discharge.' },
  { name: 'No Show', when: 'The client did not attend a scheduled contact.' },
  { name: 'Cancellation', when: 'A scheduled contact was cancelled.' },
];

const GLOBAL_WORKLOAD_ACTIVITIES = [
  { name: 'Documentation', when: 'Note writing time.' },
  { name: 'Report Writing', when: 'Writing a report.' },
  { name: 'File Review', when: 'Reviewing or auditing a file.' },
  { name: 'Consultation', when: 'Consulting another provider about a client with no direct client contact.' },
  { name: 'Supervision', when: 'Supervision, receiving or providing.' },
  { name: 'Training', when: 'Training or professional development.' },
  { name: 'Scheduling & Prep', when: 'Booking and preparing for sessions.' },
  { name: 'Travel Time', when: 'Travel without a client in the vehicle.' },
  { name: 'Data Entry', when: 'Entering client data outside a live contact.' },
];

const GLOBAL_ATTACHMENTS = [
  { type: 'Assessment', example: 'Completed assessment document' },
  { type: 'Consent', example: 'Signed consent form' },
  { type: 'Referral Form', example: 'The referral as it was received' },
  { type: 'Intake', example: 'Completed intake form' },
  { type: 'Care Plan', example: 'The client\'s current care plan' },
  { type: 'Safety Plan', example: 'Completed safety plan' },
  { type: 'Release of Information', example: 'Signed release naming one agency' },
  { type: 'Telepractice Consent', example: 'Signed consent for virtual service' },
  { type: 'Clinical Report', example: 'Report or letter from a clinician' },
  { type: 'External Assessment', example: 'Assessment completed by another provider' },
  { type: 'Court Document', example: 'Order or condition sheet' },
  { type: 'School Report', example: 'School report or education plan' },
  { type: 'Screening Result', example: 'Result from a screening tool' },
  { type: 'Correspondence', example: 'Letters and message threads' },
  { type: 'Other', example: 'Anything that does not fit above' },
];

const GLOBAL_EXITS = [
  'Service completed, with referral',
  'Service completed, without referral',
  'Client withdrew and told staff',
  'Discharged by staff, with referral',
  'Drop out or repeated no show',
  'Mutually agreed',
  'Transferred elsewhere, client preference',
  'Transferred elsewhere, other services',
  'Goals met',
  'Moved out of the service area',
  'Transitioned to adult services',
  'Unknown',
];

const LOCATIONS_NOTE = 'Client residence · Community · Court · Hospital · Office · School · Daycare · Youth centre · Vehicle in transit · Virtual · Health centre · Justice centre · Shelter · Drop in centre · Public event site · Other.';

const REFERRAL_SOURCES_NOTE = 'Self, family or friend · Cedarline Health Alliance · Lakeside General Hospital · Harbourlight Housing Support · Northgate Youth Services · Millbrook Community Clinic · Riverbend internal program · School · Child welfare · Police · Probation · Courts · Family physician · Psychiatry · Crisis line · Community member · Other.';

const CRITICAL_FLAG_BASE = [
  'Thoughts of self harm or suicide, disclosed or observed',
  'Risk of harm to another person',
  'A disclosure that triggers a duty to report',
  'A safety plan being written or changed',
  'An emergency department visit or a police involvement during the contact',
  'Any event a supervisor would need to know about before the next shift',
];

/* ---------- Guide builder ---------- */
function mkGuide(o) {
  return {
    title: o.title,
    category: o.category,
    funder: o.funder,
    who: o.who,
    lede: o.lede,
    notice: o.notice || null,
    uniqueLabel: o.uniqueLabel || 'THIS PROGRAM ONLY',
    stages: o.stages,
    discharge: o.discharge || GLOBAL_EXITS,
    docSteps: o.docSteps || DEFAULT_DOC_STEPS,
    docTip: o.docTip || 'Direct minutes are the time you spent with the client. Indirect minutes are the writing, the phone calls and the travel attached to that same contact. Both belong on the record, and the funder report reads both.',
    workloadIntro: o.workloadIntro || 'For time that is not attached to one client: documentation, supervision, team meetings, training, and travel.',
    workloadSteps: o.workloadSteps || DEFAULT_WORKLOAD_STEPS,
    workloadNote: o.workloadNote || 'Not attached to a client. Leave the client field blank.',
    activities: {
      clientContact: GLOBAL_CLIENT_ACTIVITIES.concat(o.uniqueActivities || []),
      workload: GLOBAL_WORKLOAD_ACTIVITIES.concat(o.uniqueWorkload || []),
    },
    attachments: GLOBAL_ATTACHMENTS.concat(o.uniqueAttachments || []),
    caseForms: o.caseForms,
    goalPlanning: o.goalPlanning || DEFAULT_GOAL_STEPS,
    criticalFlag: CRITICAL_FLAG_BASE.concat(o.criticalExtra || []),
    reports: o.reports,
    extraSections: o.extraSections || [],
    locations: o.locations || LOCATIONS_NOTE,
    referralSources: o.referralSources || REFERRAL_SOURCES_NOTE,
  };
}

const DEFAULT_DOC_STEPS = [
  { title: 'Open the client file and choose New Contact', detail: 'From the client menu, pick New Contact. If the client is served by more than one program, check that the program shown at the top is yours before you type anything.' },
  { title: 'Set the date, the location and the activity', detail: 'Use the date the service happened, not the date you are writing. Location and activity both drive the funder report, so pick the closest match rather than Other.' },
  { title: 'Enter direct and indirect minutes', detail: 'Direct is time with the client. Indirect is the writing, calls and travel tied to this contact. Round to the nearest five minutes.' },
  { title: 'Write the note', detail: 'Third person, plain language, what happened and what happens next. If risk came up, say what you assessed and what you did.' },
  { title: 'Flag it if it is critical, then authenticate', detail: 'Check Critical if the contact meets any of the criteria in the Critical Flag section. Authenticating locks the note, so read it once more first.' },
];

const DEFAULT_WORKLOAD_STEPS = [
  { title: 'Open Workload from the main menu', detail: 'Workload records sit outside the client file. You can also press the day on the calendar and pick Create New Workload.' },
  { title: 'Choose the workload activity', detail: 'Pick the activity that matches the block of time. Supervision, training and documentation are the three that get under recorded.' },
  { title: 'Enter the minutes and a one line description', detail: 'Enough that a supervisor reading the month end report knows what the block was. No client identifiers in a workload record.' },
  { title: 'Save', detail: 'Workload records do not need authentication, but they do close with the pay period.' },
];

const DEFAULT_GOAL_STEPS = [
  { title: 'Open Goal Planning from the client menu', detail: 'One goal record per focus area. Three or four active goals is normal, ten is a sign the plan needs a trim.' },
  { title: 'Write the goal in the client\'s words', detail: 'The goal belongs to the client. Keep their phrasing where you can, and add the measure underneath.' },
  { title: 'Set a review date', detail: 'Every goal needs a review date. The overdue goal report reads this field.' },
  { title: 'Record progress at each review', detail: 'Progress, no change, or goal met. A goal marked met stays on the record and is not deleted.' },
];

/* ---------- The six built guides ---------- */
const GUIDE_DATA = {
  'hart-hub-cm': mkGuide({
    title: 'HART Hub Case Management',
    category: 'Case management',
    funder: 'Provincial health · HART Hub',
    who: 'Case managers and the care team lead',
    lede: 'The hub takes its own referrals, so the front door is inside the program. This guide covers the five stages of care, how the care team documents together, and every contact type the hub uses.',
    notice: 'The hub is one of two programs that accept a direct referral rather than routing through central intake.',
    stages: [
      { id: 's1', label: 'Stage 1', title: 'Referral',      who: 'Hub intake worker', desc: 'A referral arrives at the hub directly, by walk in, phone, or from a partner agency. It is entered the same day it is received, even when the first contact has not happened yet. The referral date is what the wait time report measures from.' },
      { id: 's2', label: 'Stage 2', title: 'First Contact', who: 'Assigned case manager', desc: 'First contact is attempted within two business days. Log every attempt, not only the one that connected, because three unanswered calls is information the care team needs.' },
      { id: 's3', label: 'Stage 3', title: 'Care Planning', who: 'Case manager with the care team', desc: 'The needs review is completed and a care plan is built with the client. Where more than one program is involved, the care team meeting is logged as a Team Conference and the plan lives in one place.' },
      { id: 's4', label: 'Stage 4', title: 'Active Support', who: 'Case manager', desc: 'Ongoing contacts, accompaniment, system navigation, and plan reviews. The plan is reviewed at least every ninety days, and the review is a contact in its own right.' },
      { id: 's5', label: 'Stage 5', title: 'Discharge & Aftercare', who: 'Case manager and supervisor', desc: 'Discharge planning starts before the last session, not at it. One aftercare follow up is offered at thirty days and recorded whether or not the client takes it up.' },
    ],
    uniqueActivities: [
      { name: 'Hub Intake Screen', when: 'The short screen completed at the hub door before a full intake.', unique: true },
      { name: 'Care Team Huddle', when: 'The standing multi program huddle about a shared client.', unique: true },
      { name: 'Warm Handoff', when: 'Walking the client to another provider and staying for the introduction.', unique: true },
    ],
    uniqueAttachments: [{ type: 'Care Team Summary', example: 'The one page summary shared inside the care team', unique: true }],
    caseForms: [
      { form: 'Hub Intake Screen', when: 'At the door, before a full intake', who: 'Hub intake worker' },
      { form: 'Holistic Needs Review', when: 'Within two weeks of first contact', who: 'Case manager' },
      { form: 'Care Plan', when: 'After the needs review, then every 90 days', who: 'Case manager with client' },
      { form: 'Risk Screen', when: 'At intake and any time risk changes', who: 'Any worker' },
      { form: 'Discharge Summary', when: 'At discharge', who: 'Case manager' },
    ],
    reports: [
      { name: 'Active caseload by worker', freq: 'Weekly', why: 'Balances assignment before it becomes a wait list.' },
      { name: 'Days from referral to first contact', freq: 'Monthly', why: 'The hub commits to two business days and this is the proof.' },
      { name: 'Care plans overdue for review', freq: 'Monthly', why: 'Catches plans drifting past the ninety day mark.' },
      { name: 'Critical note summary', freq: 'Weekly', why: 'Supervisors read every critical note from the week.' },
      { name: 'Service volume by stream', freq: 'Quarterly', why: 'Feeds the funder report.' },
    ],
    criticalExtra: ['Anything the care team as a whole needs before the next huddle'],
  }),

  'adult-mh-cm': mkGuide({
    title: 'Adult Mental Health Case Management',
    category: 'Case management',
    funder: 'Provincial health · MHA',
    who: 'Case managers',
    lede: 'Community referrals arrive through central intake. This guide covers the holistic needs review, the ongoing case work that follows it, and where the adult configuration differs from the youth one.',
    stages: [
      { id: 's1', label: 'Stage 1', title: 'Referral',        who: 'Central intake', desc: 'Central intake takes the referral, screens for eligibility, and routes it. Verbal referrals are accepted and transcribed into the same form, so nothing is turned away for arriving by phone.' },
      { id: 's2', label: 'Stage 2', title: 'First Contact',   who: 'Assigned case manager', desc: 'First contact within five business days. If three attempts fail, the file closes as unable to contact and central intake is told, so the referrer hears back.' },
      { id: 's3', label: 'Stage 3', title: 'Needs Review',    who: 'Case manager', desc: 'The holistic needs review covers housing, income, health, connection and safety. It is a conversation, not a form to read aloud, and it is completed within four weeks.' },
      { id: 's4', label: 'Stage 4', title: 'Ongoing Support', who: 'Case manager', desc: 'Regular contacts, system navigation, and plan reviews every ninety days. Frequency drops as the plan is met rather than stopping at a fixed session count.' },
      { id: 's5', label: 'Stage 5', title: 'Discharge & Aftercare', who: 'Case manager', desc: 'Discharge is planned with the client. One follow up at thirty days, recorded either way.' },
    ],
    uniqueActivities: [
      { name: 'Housing Support Contact', when: 'Work on a housing application, a landlord conversation, or a move.', unique: true },
      { name: 'Income Support Contact', when: 'Help with a benefit application or an appeal.', unique: true },
    ],
    caseForms: [
      { form: 'Holistic Needs Review', when: 'Within four weeks of first contact', who: 'Case manager' },
      { form: 'Care Plan', when: 'After the needs review, then every 90 days', who: 'Case manager with client' },
      { form: 'Risk Screen', when: 'At intake and any time risk changes', who: 'Any worker' },
      { form: 'Consent to Service', when: 'At first contact', who: 'Case manager' },
      { form: 'Discharge Summary', when: 'At discharge', who: 'Case manager' },
    ],
    reports: [
      { name: 'Active caseload by worker', freq: 'Weekly', why: 'Keeps assignment even across the team.' },
      { name: 'Needs reviews outstanding', freq: 'Monthly', why: 'Flags anyone past the four week mark.' },
      { name: 'Contacts by activity', freq: 'Monthly', why: 'Shows what the work actually consists of.' },
      { name: 'Discharge reasons', freq: 'Quarterly', why: 'Read alongside the aftercare follow up rate.' },
    ],
  }),

  'central-intake': mkGuide({
    title: 'Central Intake',
    category: 'Coordinated access',
    funder: 'Internal · operations',
    who: 'Intake workers and the intake lead',
    lede: 'Central intake is the front door for every program except residential treatment. One referral form, one triage decision, one route. This guide covers what gets recorded before a client belongs to a program.',
    notice: 'Records created here are attached to the intake program until the routing decision is made, then they move with the client.',
    stages: [
      { id: 's1', label: 'Stage 1', title: 'Referral In',      who: 'Intake worker', desc: 'The referral is entered the day it arrives, in any form it arrives. Verbal referrals are transcribed onto the same form, and the person who called is recorded as the source.' },
      { id: 's2', label: 'Stage 2', title: 'Screen',           who: 'Intake worker', desc: 'Eligibility, urgency, and whether the person is already open somewhere in the agency. A duplicate check happens here and saves an awkward call later.' },
      { id: 's3', label: 'Stage 3', title: 'Triage',           who: 'Intake lead', desc: 'Urgency is set: same day, five days, or routine. Anything flagged same day is handed off by phone rather than left in the queue.' },
      { id: 's4', label: 'Stage 4', title: 'Route',            who: 'Intake lead', desc: 'The referral is routed to a program and the receiving supervisor is named. The routing decision and its reason are both recorded, because that is what gets reviewed when a route turns out wrong.' },
      { id: 's5', label: 'Stage 5', title: 'Close the Loop',   who: 'Intake worker', desc: 'The referrer is told the outcome within five business days. That contact is logged, and it is the single most skipped step in the whole pathway.' },
    ],
    uniqueActivities: [
      { name: 'Referral Screen', when: 'The eligibility and duplicate check on a new referral.', unique: true },
      { name: 'Triage Decision', when: 'Setting urgency and recording why.', unique: true },
      { name: 'Referrer Callback', when: 'Closing the loop with whoever sent the referral.', unique: true },
      { name: 'Wait List Review', when: 'The standing review of everyone waiting on a route.', unique: true },
    ],
    uniqueAttachments: [{ type: 'Inbound Referral Package', example: 'Everything the referrer sent, kept together', unique: true }],
    caseForms: [
      { form: 'Universal Referral Form', when: 'Every inbound referral', who: 'Intake worker' },
      { form: 'Eligibility Screen', when: 'Before triage', who: 'Intake worker' },
      { form: 'Triage Record', when: 'At the triage decision', who: 'Intake lead' },
      { form: 'Consent to Share', when: 'Before anything leaves the agency', who: 'Intake worker' },
    ],
    goalPlanning: [
      { title: 'Central intake does not hold goals', detail: 'Goal Planning stays empty here. Goals are written by the program that takes the client, so a goal recorded at intake would be orphaned the moment the route is made.' },
      { title: 'What goes in the handoff instead', detail: 'The triage record carries what the person said they wanted. The receiving worker turns that into goals during care planning.' },
    ],
    reports: [
      { name: 'Referrals received by source', freq: 'Weekly', why: 'Shows which doors people are actually using.' },
      { name: 'Time from referral to route', freq: 'Weekly', why: 'The queue is invisible until this is measured.' },
      { name: 'Loop closed within five days', freq: 'Monthly', why: 'The step most likely to be skipped.' },
      { name: 'Routes returned by the receiving program', freq: 'Monthly', why: 'A returned route is a screening problem, not a program problem.' },
    ],
    criticalExtra: ['Any referral screened as same day urgency'],
  }),

  'child-youth-counselling': mkGuide({
    title: 'Child & Youth Counselling (CYC)',
    category: 'Counselling and treatment',
    funder: 'Provincial health · MHA',
    who: 'Counsellors and the clinical supervisor',
    lede: 'Referral through aftercare for counselling with children, youth, and the adults around them. The form set is shared with adult therapy, with two additions for consent and school contact.',
    stages: [
      { id: 's1', label: 'Stage 1', title: 'Referral',       who: 'Central intake', desc: 'Referrals route in from central intake. Where the referral came from a school or a physician, that source is recorded exactly, since the source mix is reported quarterly.' },
      { id: 's2', label: 'Stage 2', title: 'Intake Session', who: 'Counsellor', desc: 'The first session covers consent, who is in the room, and what the young person wants out of this. Consent for anyone under sixteen is recorded before the second session.' },
      { id: 's3', label: 'Stage 3', title: 'Counselling',    who: 'Counsellor', desc: 'Sessions are auto numbered by the system. Missed sessions are logged as No Show rather than left blank, because the attendance pattern is clinical information.' },
      { id: 's4', label: 'Stage 4', title: 'Review & Close', who: 'Counsellor with supervisor', desc: 'Progress is reviewed at session six and again at twelve. Closing is a session, not an absence of one.' },
      { id: 's5', label: 'Stage 5', title: 'Aftercare',      who: 'Counsellor', desc: 'One check in at six weeks after the final session, offered to the young person and to the caregiver where consent covers it.' },
    ],
    uniqueActivities: [
      { name: 'Caregiver Session', when: 'A session with the caregiver, with or without the young person present.', unique: true },
      { name: 'School Contact', when: 'Contact with the school team about a client.', unique: true },
      { name: 'Play or Art Based Session', when: 'A session delivered through play or art rather than talk.', unique: true },
    ],
    uniqueAttachments: [
      { type: 'Caregiver Consent', example: 'Consent signed by the caregiver', unique: true },
      { type: 'Education Plan', example: 'The current plan from the school', unique: true },
    ],
    caseForms: [
      { form: 'Consent to Service', when: 'First session', who: 'Counsellor' },
      { form: 'Youth Intake', when: 'First or second session', who: 'Counsellor' },
      { form: 'Session 6 Progress Review', when: 'At session six', who: 'Counsellor' },
      { form: 'Session 12 Progress Review', when: 'At session twelve', who: 'Counsellor with supervisor' },
      { form: 'Closing Summary', when: 'At the final session', who: 'Counsellor' },
    ],
    reports: [
      { name: 'Wait time to first session', freq: 'Monthly', why: 'The number families ask about first.' },
      { name: 'Sessions delivered by counsellor', freq: 'Monthly', why: 'Caseload balance and supervision planning.' },
      { name: 'Attendance and no show pattern', freq: 'Monthly', why: 'Reads as clinical information, not administrative noise.' },
      { name: 'Progress review completion', freq: 'Quarterly', why: 'Checks that session six and twelve reviews happened.' },
    ],
    criticalExtra: ['Any disclosure involving a child under sixteen that triggers a report'],
  }),

  'crisis-counselling': mkGuide({
    title: 'Short Term Crisis Counselling (STCC)',
    category: 'Crisis response',
    funder: 'Provincial health · MHA',
    who: 'Crisis counsellors',
    lede: 'Two note types live in this program: individual crisis counselling attached to a client file, and community crisis response that is not attached to any one person. Getting the two apart is most of what this guide is for.',
    notice: 'Community crisis response is recorded as a workload activity with no client attached. Never open a client file to record a community response.',
    stages: [
      { id: 's1', label: 'Stage 1', title: 'Contact',        who: 'Crisis counsellor', desc: 'Crisis contact arrives by phone, walk in, or a call from a partner. The contact is recorded within the same shift, not the next day.' },
      { id: 's2', label: 'Stage 2', title: 'Assess',         who: 'Crisis counsellor', desc: 'Risk assessment happens in the first contact and is written down in the same contact record. If a safety plan is made, it attaches here.' },
      { id: 's3', label: 'Stage 3', title: 'Short Term Work', who: 'Crisis counsellor', desc: 'Up to six sessions. If the work is clearly going past six, that is a transfer conversation rather than a quiet extension.' },
      { id: 's4', label: 'Stage 4', title: 'Transfer or Close', who: 'Crisis counsellor with supervisor', desc: 'Either a warm handoff into ongoing case management or counselling, or a close with a safety plan in the client\'s hands.' },
      { id: 's5', label: 'Stage 5', title: 'Follow Up',      who: 'Crisis counsellor', desc: 'One follow up at seven days on every closed crisis file, recorded whether or not it connects.' },
    ],
    uniqueActivities: [
      { name: 'Crisis Call', when: 'A crisis contact by phone.', unique: true },
      { name: 'Post Crisis Debrief', when: 'A debrief with the client after the acute period passes.', unique: true },
    ],
    uniqueWorkload: [
      { name: 'Community Crisis Response', when: 'A response to a community level event. No client attached, ever.', unique: true },
      { name: 'Crisis Team Debrief', when: 'The team debrief after a community response.', unique: true },
    ],
    caseForms: [
      { form: 'Risk Assessment', when: 'First contact, and any time risk changes', who: 'Crisis counsellor' },
      { form: 'Safety Plan', when: 'Whenever risk is present', who: 'Crisis counsellor with client' },
      { form: 'Crisis Contact Summary', when: 'Each crisis episode', who: 'Crisis counsellor' },
      { form: 'Transfer Record', when: 'On any handoff to ongoing service', who: 'Crisis counsellor' },
    ],
    reports: [
      { name: 'Crisis contacts by hour of day', freq: 'Monthly', why: 'Drives the on call schedule.' },
      { name: 'Episodes over six sessions', freq: 'Monthly', why: 'Surfaces work that should have transferred.' },
      { name: 'Seven day follow up completed', freq: 'Monthly', why: 'The commitment the program makes on every close.' },
      { name: 'Community responses by type', freq: 'Quarterly', why: 'Separate from client counts, and often confused with them.' },
    ],
    criticalExtra: ['Every contact where a safety plan was written or changed'],
  }),

  'youth-hub': mkGuide({
    title: 'Youth Wellness Hub',
    category: 'Integrated youth services',
    funder: 'Provincial health · youth services',
    who: 'Hub workers, peer support workers, and the hub coordinator',
    lede: 'Walk in service with no referral needed. Because a young person can arrive, be seen, and leave inside an hour, the documentation is built to be finished the same day, and this guide is written around that.',
    stages: [
      { id: 's1', label: 'Stage 1', title: 'Walk In',        who: 'Hub worker', desc: 'A young person walks in. A brief registration is created, and service can start before anything else is finished. The barrier is deliberately low and the record catches up.' },
      { id: 's2', label: 'Stage 2', title: 'Same Day Support', who: 'Hub worker or peer support worker', desc: 'The first conversation happens the same visit. Most young people are seen once, so the first visit is treated as if it may be the only one.' },
      { id: 's3', label: 'Stage 3', title: 'Ongoing Visits', who: 'Hub worker', desc: 'Repeat visits attach to the same record. Sessions are not booked as a course, they accumulate as the young person returns.' },
      { id: 's4', label: 'Stage 4', title: 'Connect Onward', who: 'Hub coordinator', desc: 'Where more is needed, a warm handoff into counselling or case management. The handoff is a contact, and the receiving worker is named in it.' },
      { id: 's5', label: 'Stage 5', title: 'Close',          who: 'Hub worker', desc: 'A record with no visit for ninety days closes automatically as inactive. It reopens on the next visit with no new registration.' },
    ],
    uniqueActivities: [
      { name: 'Walk In Visit', when: 'Any unscheduled visit to the hub.', unique: true },
      { name: 'Peer Support Session', when: 'A session delivered by a peer support worker.', unique: true },
      { name: 'Drop In Group', when: 'An open group in the hub space.', unique: true },
      { name: 'Employment or Education Support', when: 'Help with a resume, an application, or a return to school.', unique: true },
    ],
    caseForms: [
      { form: 'Brief Registration', when: 'First visit', who: 'Hub worker' },
      { form: 'Wellness Check In', when: 'Each visit after the first', who: 'Hub worker' },
      { form: 'Consent to Service', when: 'First visit', who: 'Hub worker' },
      { form: 'Onward Connection Record', when: 'On any handoff', who: 'Hub coordinator' },
    ],
    reports: [
      { name: 'Unique young people by month', freq: 'Monthly', why: 'The hub\'s headline number, counted once per person.' },
      { name: 'Visits per young person', freq: 'Monthly', why: 'Separates one time visits from returning use.' },
      { name: 'Peer support share of contacts', freq: 'Quarterly', why: 'Reported separately from clinical contacts.' },
      { name: 'Onward connections made', freq: 'Quarterly', why: 'Shows the hub working as a door rather than a destination.' },
    ],
  }),
};
