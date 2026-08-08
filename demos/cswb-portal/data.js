/*
   Demonstration data. Every organization, address, phone number, email address,
   website, and eligibility rule below is invented for this demo. The phone
   numbers use the 555-01xx range reserved for fiction, and the web addresses use
   the reserved .example domain, so nothing here can dial or resolve anywhere.

   The shape of the file is the point: one flat list of services, each carrying
   the plain-language needs a resident would actually search on, so the directory
   stays editable by a coordinator without touching the markup.
*/
const DB = {
 "services": [
  {
   "name": "Alderport Community Legal Clinic",
   "services": "Free legal help for residents who cannot afford a lawyer. The clinic works in poverty law, which covers the areas where a legal problem usually turns into a housing or income problem.\nAreas of work:\n• Tenant rights, eviction defence, and repair orders\n• Income support appeals, including disability benefit denials\n• Employment standards complaints, unpaid wages, and wrongful dismissal\n• Human rights applications\n• Public legal education sessions for community groups\n\nThe clinic does not handle criminal charges, family law, or immigration matters, and will refer those elsewhere. Summary advice is available without an appointment on drop-in mornings. Full representation requires an intake interview and a financial eligibility check.\nFees: None\nLanguages: English, French, interpretation on request",
   "address": "88 Bellwether Street, Suite 3, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0101",
     "tel": "+15555550101"
    }
   ],
   "email": "advice@alderportlegal.example",
   "website": "https://www.alderportlegal.example",
   "eligibility": "Residents whose household income falls under the clinic's financial test. Summary advice is available to anyone.",
   "categories": [
    "Legal Aid",
    "Legal Clinics and Education",
    "Housing",
    "Employment"
   ],
   "needs": [
    "Justice & Legal",
    "Housing & Shelter",
    "Education & Employment"
   ],
   "indigenous": false
  },
  {
   "name": "Alderport Employment Resource Centre",
   "services": "Walk-in employment help for job seekers at any stage. Staff assist with resumes, cover letters, online applications, and interview practice. The centre keeps a posted board of local openings and runs a weekly hiring circle where employers meet candidates directly.\nSupports include computer and printer access, a phone for calls to employers, and help setting up an email address.",
   "address": "14 Quarry Lane, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0102",
     "tel": "+15555550102"
    }
   ],
   "email": "reception@alderportwork.example",
   "website": "https://www.alderportwork.example",
   "eligibility": "",
   "categories": [
    "Employment",
    "Skills-Based Education"
   ],
   "needs": [
    "Education & Employment"
   ],
   "indigenous": false
  },
  {
   "name": "Alderport Youth Justice Services",
   "services": "Community supervision and support for young people involved with the youth justice system. Workers meet the young person where they are, at home, at school, or at the office, and build a plan that covers the court conditions alongside school, work, and family.\nServices include supervision of community sentences, referrals to counselling and substance use supports, help re-entering school, and support at court appearances. Family members can call for information about the process even if the young person is not yet connected.",
   "address": "225 Harrow Road, Second Floor, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0103",
     "tel": "+15555550103"
    }
   ],
   "email": "",
   "website": "https://www.alderportyouthjustice.example",
   "eligibility": "Ages 12 to 17",
   "categories": [
    "Youth Probation"
   ],
   "needs": [
    "Justice & Legal"
   ],
   "indigenous": false
  },
  {
   "name": "Anchorstone Adult Probation Office",
   "services": "Supervision of adults on probation and conditional sentences, with referrals to counselling, employment, and substance use programs as part of the supervision plan. Reporting appointments can be arranged by phone for people without transportation.",
   "address": "225 Harrow Road, Main Floor, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0104",
     "tel": "+15555550104"
    }
   ],
   "email": "anchorstone.probation@alderportjustice.example",
   "website": "https://www.alderportjustice.example",
   "eligibility": "N/A",
   "categories": [
    "Adult Probation"
   ],
   "needs": [
    "Justice & Legal"
   ],
   "indigenous": false
  },
  {
   "name": "Beacon Ridge Withdrawal Management",
   "services": "Short stay withdrawal management, open around the clock, with no appointment and no referral needed. Nursing staff monitor withdrawal, manage symptoms, and arrange the next step before discharge.\nA person can arrive on their own, be dropped off by family, or come by ambulance. Average stay is three to five days. Staff will hold a bed for someone travelling in from outside the city if they call ahead.\nOn discharge every guest leaves with a named next contact, not a pamphlet. That handoff is warm, meaning the receiving program has already agreed to the referral.",
   "address": "6 Beacon Ridge Road, Alderport",
   "phones": [
    {
     "label": "Crisis",
     "display": "(555) 555-0105",
     "tel": "+15555550105"
    },
    {
     "label": "Phone",
     "display": "(555) 555-0106",
     "tel": "+15555550106"
    }
   ],
   "email": "intake@beaconridge.example",
   "website": "https://www.beaconridge.example",
   "eligibility": "Adults 16 and over. No referral required.",
   "categories": [
    "Community Treatment",
    "Residential Treatment",
    "Addiction",
    "Crisis"
   ],
   "needs": [
    "Treatment & Recovery",
    "Addiction & Substance Use",
    "Crisis & Emergency"
   ],
   "indigenous": false
  },
  {
   "name": "Birchway Learning Collective",
   "services": "Indigenous-led adult learning centre offering upgrading, high school credits, and preparation for college entrance. Classes run in small groups with a land-based component each term.\nProgram areas:\n• Literacy and numeracy upgrading at any starting level\n• High school credit completion\n• College and apprenticeship preparation\n• Digital skills, from first-time computer use through office software\n• Cultural programming, including language classes open to learners and their families\n\nLearners set their own pace. There are four intakes a year, and someone who leaves partway through keeps their completed credits and can restart at any intake. Childminding is available during day classes, and bus tickets are provided to learners who need them.\nFees: None\nApplication: Meet with a learning advisor, no formal testing required to start",
   "address": "410 Birchway Avenue, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0107",
     "tel": "+15555550107"
    }
   ],
   "email": "learn@birchwaycollective.example",
   "website": "https://www.birchwaycollective.example",
   "eligibility": "",
   "categories": [
    "Education",
    "Skills-Based Education",
    "Indigenous"
   ],
   "needs": [
    "Education & Employment"
   ],
   "indigenous": true
  },
  {
   "name": "Cedarline Health Alliance",
   "services": "A multi-site health organization serving the Alderport area, bringing primary care, allied health, and community programs under one roof so a person is not sent across town for each piece.\nPrimary care:\n• Family physicians and nurse practitioners, accepting new patients\n• Same-day and next-day appointments for urgent but non-emergency needs\n• Chronic disease management for diabetes, heart conditions, and respiratory illness\n• Immunization and travel health\n• Prenatal care and postpartum follow-up\n\nAllied health:\n• Dietitians, with group sessions on cooking for a household budget\n• Physiotherapy and occupational therapy\n• Social work, including help applying for benefits and drug coverage\n• Chiropody and diabetes foot care\n• Pharmacy consultations for people taking several medications\n\nCommunity programs:\n• Falls prevention and strength classes for older adults\n• Youth health drop-in, staffed by a nurse practitioner two afternoons a week\n• Smoking and vaping cessation, with free replacement therapy\n• Community kitchen and food security programming\n• Health bus, a mobile clinic that visits outlying neighbourhoods on a posted schedule\n\nThe alliance runs a shared intake so a person calling any one program can be moved to the right one without repeating their story. Interpretation is available for any appointment with two business days of notice.\nFees: Services covered by provincial health insurance carry no charge. Some allied health visits have a sliding scale.\nLanguages: English, French, interpretation on request",
   "address": "1200 Cedarline Way, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0108",
     "tel": "+15555550108"
    },
    {
     "label": "Toll-Free",
     "display": "1 (555) 555-0109",
     "tel": "+15555550109"
    }
   ],
   "email": "contact@cedarlinehealth.example",
   "website": "https://www.cedarlinehealth.example",
   "eligibility": "",
   "categories": [
    "Clinical Health Services",
    "General Health",
    "Family and Community Health"
   ],
   "needs": [
    "Health & Wellness",
    "Family & Community Health"
   ],
   "indigenous": false
  },
  {
   "name": "Clearwater Counselling Collective",
   "services": "Counselling for adults, youth, and couples, offered in person and by video. The collective holds a set of no-cost sessions each week for people without benefits coverage, and a sliding scale for everyone else.\nCommon reasons people call: anxiety, depression, grief, workplace stress, and the aftermath of a difficult event. First appointments are usually available within two weeks. Longer waits apply for specialized trauma work.",
   "address": "77 Millrace Street, Suite 210, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0110",
     "tel": "+15555550110"
    }
   ],
   "email": "intake@clearwatercounselling.example",
   "website": "https://www.clearwatercounselling.example",
   "eligibility": "",
   "categories": [
    "Mental Health Services",
    "Community Treatment"
   ],
   "needs": [
    "Mental Health"
   ],
   "indigenous": false
  },
  {
   "name": "Driftwood Family Health Team",
   "services": "Family practice serving households across the east end, with a focus on keeping care in one place across a lifetime. Services include routine primary care, well baby visits, mental health counselling on site, and home visits for patients who cannot travel.",
   "address": "9 Driftwood Crescent, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0111",
     "tel": "+15555550111"
    }
   ],
   "email": "reception@driftwoodfht.example",
   "website": "https://www.driftwoodfht.example",
   "eligibility": "N/A",
   "categories": [
    "Clinical Health Services",
    "Family and Community Health"
   ],
   "needs": [
    "Health & Wellness",
    "Family & Community Health"
   ],
   "indigenous": false
  },
  {
   "name": "Eastgate Restorative Justice Program",
   "services": "Community alternative to the court process for people who have caused harm and are willing to take responsibility for it. Trained facilitators bring together the person harmed, the person responsible, and their supports, and the group agrees on what repair looks like.\nReferrals come from police, the Crown, schools, and sometimes directly from families. Participation is voluntary on all sides, and a person harmed who does not want to meet can still shape the agreement through a facilitator.\nThe program also runs conflict resolution workshops for schools and workplaces.",
   "address": "31 Eastgate Square, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0112",
     "tel": "+15555550112"
    }
   ],
   "email": "referrals@eastgaterj.example",
   "website": "https://www.eastgaterj.example",
   "eligibility": "",
   "categories": [
    "Diversion and Restorative Justice",
    "Restorative Justice and Diversion"
   ],
   "needs": [
    "Justice & Legal"
   ],
   "indigenous": false
  },
  {
   "name": "Fernhollow Child and Family Centre",
   "services": "A single site for families with children from birth to age six, combining licensed child care, drop-in play, and early intervention services.\nChild care:\n• Licensed infant, toddler, and preschool rooms\n• Fee subsidy accepted, with staff on site to help apply\n• Extended hours two days a week for parents on shift work\n\nDrop-in and family programs:\n• Daily supervised play, no registration and no cost\n• Parenting circles, running six weeks at a time, with childminding provided\n• Infant feeding support, including lactation help\n• Clothing and equipment exchange, including car seats checked by a certified technician\n\nEarly intervention:\n• Developmental screening at 18 months and again before school entry\n• Speech and language services, referral or self-referral\n• Occupational therapy consultation for feeding, sleep, and sensory concerns\n• Connection to specialized services when a screening flags something\n\nA family worker can meet a caregiver at the centre or at home. Families who miss appointments are followed up rather than discharged, because the missed appointment is usually the signal that more help is needed.\nFees: Drop-in and family programs are free. Licensed care is charged at posted rates with subsidy available.\nApplication: Walk in for drop-in programs. Licensed care requires registration on the central waitlist.",
   "address": "58 Fernhollow Drive, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0113",
     "tel": "+15555550113"
    },
    {
     "label": "Toll-Free",
     "display": "1 (555) 555-0114",
     "tel": "+15555550114"
    }
   ],
   "email": "families@fernhollowcentre.example",
   "website": "https://www.fernhollowcentre.example",
   "eligibility": "",
   "categories": [
    "Childcare",
    "Family and Community Health"
   ],
   "needs": [
    "Childcare & Family Support",
    "Family & Community Health"
   ],
   "indigenous": false
  },
  {
   "name": "Greenmarsh Community Food Bank",
   "services": "Emergency food hampers, available twice a month per household, plus a low-cost market open to anyone with no proof of income required. Hampers are built around what a household can actually cook, and staff will ask before including items that need an oven or a full kitchen.\nThe food bank also runs a delivery route for residents who cannot carry a hamper home, and holds a small fund for emergency prescriptions and transit fare.",
   "address": "3 Greenmarsh Road, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0115",
     "tel": "+15555550115"
    }
   ],
   "email": "",
   "website": "https://www.greenmarshfood.example",
   "eligibility": "Residents of the Lakeside district. Bring identification if you have it, but service is not refused without it.",
   "categories": [
    "Financial Supports"
   ],
   "needs": [
    "Financial Supports"
   ],
   "indigenous": false
  },
  {
   "name": "Harbourlight Housing Support",
   "services": "Housing help for people who are homeless or at risk of losing their housing. Workers negotiate with landlords, apply for arrears assistance, and search for units alongside the household rather than handing over a list.",
   "address": "44 Harbourlight Street, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0116",
     "tel": "+15555550116"
    }
   ],
   "email": "housing@harbourlightsupport.example",
   "website": "https://www.harbourlightsupport.example",
   "eligibility": "",
   "categories": [
    "Housing",
    "Crisis"
   ],
   "needs": [
    "Housing & Shelter",
    "Crisis & Emergency"
   ],
   "indigenous": false
  },
  {
   "name": "Hollowbrook Sexual Assault Support Line",
   "services": "Confidential support for survivors of sexual violence, of any age and any gender, whether the assault happened last night or decades ago. The line is answered by a trained counsellor at all hours.\nSupport includes accompaniment to hospital or police if the caller wants it, help understanding options without pressure to report, and connection to longer term counselling.",
   "address": "Mailing address only, PO Box 220, Alderport",
   "phones": [
    {
     "label": "Crisis",
     "display": "(555) 555-0117",
     "tel": "+15555550117"
    },
    {
     "label": "Toll Free",
     "display": "1 (555) 555-0118",
     "tel": "+15555550118"
    }
   ],
   "email": "support@hollowbrooksupport.example",
   "website": "https://www.hollowbrooksupport.example",
   "eligibility": "",
   "categories": [
    "Sexual Violence",
    "Family Violence",
    "Crisis"
   ],
   "needs": [
    "Family & Sexual Violence",
    "Crisis & Emergency"
   ],
   "indigenous": false
  },
  {
   "name": "Kestrel House Youth Shelter",
   "services": "Emergency beds for young people with nowhere safe to sleep. Twelve beds, staffed overnight, with no requirement to be sober and no requirement to have a referral.",
   "address": "19 Kestrel Street, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0119",
     "tel": "+15555550119"
    }
   ],
   "email": "",
   "website": "https://www.kestrelhouse.example",
   "eligibility": "Ages 16 to 24",
   "categories": [
    "Housing",
    "Crisis"
   ],
   "needs": [
    "Housing & Shelter",
    "Crisis & Emergency"
   ],
   "indigenous": false
  },
  {
   "name": "Lantern Bay Residential Treatment",
   "services": "Twenty-eight day residential treatment for substance use, followed by twelve weeks of structured aftercare. The program runs in cohorts, so a group starts and finishes together.\nDays combine group work, individual counselling, physical activity, and practical planning for the return home. Family members are invited to two sessions during the stay and one after discharge.\nBeds are held for people coming directly from withdrawal management. Someone who leaves early is welcome to return, and a return does not go to the back of the waitlist.\nFees: None\nApplication: Assessment by phone, usually within a week of the first call",
   "address": "500 Lantern Bay Road, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0120",
     "tel": "+15555550120"
    },
    {
     "label": "Toll Free",
     "display": "1 (555) 555-0121",
     "tel": "+15555550121"
    }
   ],
   "email": "admissions@lanternbaytreatment.example",
   "website": "https://www.lanternbaytreatment.example",
   "eligibility": "Adults 18 and over who have completed withdrawal or do not require medical withdrawal.",
   "categories": [
    "Residential Treatment",
    "Community Treatment",
    "Addiction",
    "Housing"
   ],
   "needs": [
    "Treatment & Recovery",
    "Addiction & Substance Use",
    "Housing & Shelter"
   ],
   "indigenous": false
  },
  {
   "name": "Maplewind Indigenous Healing Lodge",
   "services": "Land-based residential healing program grounded in Indigenous teachings, for adults working through substance use and the experiences underneath it. Ceremony, Elder guidance, and cultural practice sit at the centre of the program rather than beside it.\nThe lodge runs six week intakes with fourteen beds. Participants take part in daily circles, one to one work with a counsellor, and seasonal activities on the land. Family visiting weekends are held twice per intake.\nAftercare continues for six months, delivered by the same staff the participant already knows, in person for those who stay nearby and by phone for those who travel home.",
   "address": "22 Maplewind Trail, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0122",
     "tel": "+15555550122"
    },
    {
     "label": "Toll Free",
     "display": "1 (555) 555-0123",
     "tel": "+15555550123"
    }
   ],
   "email": "",
   "website": "https://www.maplewindlodge.example",
   "eligibility": "Indigenous adults 19 years and older. Self-referral accepted.",
   "categories": [
    "Residential Treatment",
    "Addiction",
    "Housing",
    "Indigenous"
   ],
   "needs": [
    "Treatment & Recovery",
    "Addiction & Substance Use",
    "Housing & Shelter"
   ],
   "indigenous": true
  },
  {
   "name": "Marrow Creek Indigenous Court Support",
   "services": "Court support workers who assist Indigenous people at every stage of a criminal matter, from first appearance through sentencing and release. Workers explain the process in plain language, connect people to counsel, prepare background reports for sentencing, and arrange culturally appropriate release plans.",
   "address": "225 Harrow Road, Third Floor, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0124",
     "tel": "+15555550124"
    }
   ],
   "email": "courtsupport@marrowcreek.example",
   "website": "https://www.marrowcreek.example",
   "eligibility": "",
   "categories": [
    "Legal Aid",
    "Legal Clinics and Education",
    "Restorative Justice and Diversion",
    "Indigenous"
   ],
   "needs": [
    "Justice & Legal"
   ],
   "indigenous": true
  },
  {
   "name": "Northshore Indigenous Wellness Circle",
   "services": "A partnership table of Indigenous, municipal, and health care organizations working toward one connected system of care across the Lakeside district. The Circle does not deliver clinical services directly. It coordinates the organizations that do, holds the shared care agreements, and runs the joint intake that lets a person tell their story once.\nMember organizations include community health providers, education partners, housing providers, and municipal services. Residents can call the Circle when they do not know which door to knock on.",
   "address": "35 Northshore Street, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0125 ext. 8503",
     "tel": "+15555550125,,8503"
    }
   ],
   "email": "info@northshorecircle.example",
   "website": "https://www.northshorecircle.example",
   "eligibility": "",
   "categories": [
    "General Health",
    "Indigenous"
   ],
   "needs": [
    "Health & Wellness"
   ],
   "indigenous": true
  },
  {
   "name": "Oakvale Financial Assistance Office",
   "services": "Income assistance, emergency benefits, and help with the applications behind them. Staff assist with the online application, gather the documents a person cannot easily get, and follow a file through if a decision takes too long.\nEmergency benefits cover items such as a rent deposit, a hydro arrears payment, a prescription, or a replacement identification document. These are decided quickly, often the same day.",
   "address": "160 Oakvale Avenue, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0126",
     "tel": "+15555550126"
    }
   ],
   "email": "assistance@oakvalefinancial.example",
   "website": "https://www.oakvalefinancial.example",
   "eligibility": "Individuals who require financial assistance and meet the provincial income and asset test.",
   "categories": [
    "Financial Supports"
   ],
   "needs": [
    "Financial Supports"
   ],
   "indigenous": false
  },
  {
   "name": "Pinehurst Adult Education Centre",
   "services": "High school credit courses and academic upgrading for adults, offered daytime and evening, in class and online. Guidance counsellors help build a path toward a diploma, an apprenticeship, or a college program.",
   "address": "700 Pinehurst Road, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0127",
     "tel": "+15555550127"
    }
   ],
   "email": "register@pinehursteducation.example",
   "website": "https://www.pinehursteducation.example",
   "eligibility": "",
   "categories": [
    "Education"
   ],
   "needs": [
    "Education & Employment"
   ],
   "indigenous": false
  },
  {
   "name": "Quarry Lane Supportive Housing",
   "services": "Forty units of permanent supportive housing for adults with mental health or substance use histories who have been homeless. Tenants hold their own lease. Support workers are on site daily and available overnight by phone.\nSupports are offered, not required, and a tenant who declines them keeps their housing. That is the point of the model.",
   "address": "12 Quarry Lane, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0128",
     "tel": "+15555550128"
    }
   ],
   "email": "tenancy@quarrylanehousing.example",
   "website": "https://www.quarrylanehousing.example",
   "eligibility": "Adults 18 and over with a history of homelessness. Referral through the coordinated access list.",
   "categories": [
    "Housing",
    "Mental Health Services"
   ],
   "needs": [
    "Housing & Shelter",
    "Mental Health"
   ],
   "indigenous": false
  },
  {
   "name": "Riverbend Family Services",
   "services": "• Administers bicultural child protection and prevention services for Indigenous children and youth\n• Focus is on services that respect Indigenous heritage, culture, and traditions\n• Provides on-call services 24 hours a day, 7 days a week\n• Investigates all reports of child abuse and neglect\n• Works with extended family and community before considering placement outside it\n\nServices include:\n• Alternative care\n• Child protection services\n• Children's mental health services\n• Customary care\n• Prevention services\n\nChild protection services\n• Mandated for Indigenous children and youth 17 years of age and under in need of protection\n• Voluntary for youth 16 years of age and over\n\nPrevention services: families requiring intervention in order to prevent family breakdown\n\nFees: None\nApplication: Intake assessment required for all programs\nLanguages: English, Indigenous language interpretation on request\nArea served: the Lakeside district and surrounding communities",
   "address": "270 Riverbend Road, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0129",
     "tel": "+15555550129"
    },
    {
     "label": "Crisis",
     "display": "(555) 555-0130",
     "tel": "+15555550130"
    }
   ],
   "email": "",
   "website": "https://www.riverbendfamily.example",
   "eligibility": "Fees: None\nApplication: Intake assessment required for all programs",
   "categories": [
    "Childcare",
    "Crisis",
    "Indigenous"
   ],
   "needs": [
    "Childcare & Family Support",
    "Crisis & Emergency"
   ],
   "indigenous": true
  },
  {
   "name": "Rockfield Skills and Trades Institute",
   "services": "Indigenous-governed post-secondary institute offering certificate and diploma programs with a trades focus, delivered locally so students do not have to leave home to train.\nProgram areas:\n• Construction craft worker and general carpentry\n• Electrical and plumbing pre-apprenticeship\n• Heavy equipment operation\n• Personal support worker\n• Business administration and bookkeeping\n• Early childhood education\n\nEvery program includes a paid work placement. The institute keeps relationships with local employers so the placement usually leads to an offer.\nStudent services include housing help, a bursary fund for tools and equipment, tutoring, and an Elder in residence available to any student.\nFees: Tuition varies by program. Funding support is available and staff help students apply.\nApplication: Rolling admission with three intakes per year",
   "address": "845 Rockfield Way, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0131",
     "tel": "+15555550131"
    }
   ],
   "email": "admissions@rockfieldinstitute.example",
   "website": "https://www.rockfieldinstitute.example",
   "eligibility": "",
   "categories": [
    "Post-Secondary Education",
    "Skills-Based Education",
    "Employment",
    "Indigenous"
   ],
   "needs": [
    "Education & Employment"
   ],
   "indigenous": true
  },
  {
   "name": "Saltmarsh Women's Resource Centre",
   "services": "A drop-in centre and program hub for women, offering practical help alongside longer term supports.\nOn any given day the centre provides:\n• Drop-in space with coffee, laundry, showers, and a phone\n• One to one support from a counsellor, no appointment needed\n• Safety planning for women leaving or considering leaving a violent relationship\n• Court accompaniment and help with restraining order applications\n• Help applying for housing, income assistance, and identification\n\nProgram streams:\n• Employment readiness, a twelve week course with a placement at the end\n• Financial literacy, run in partnership with a credit union\n• Peer support groups for survivors of family and sexual violence\n• Women's health nights with a visiting nurse practitioner\n• A weekly group for mothers who have had children removed from their care\n\nThe centre does not require a woman to name what happened to her in order to receive help. Staff describe the work as starting where she is on the day she walks in.\nFees: None\nLanguages: English, French, interpretation on request",
   "address": "101 Saltmarsh Street, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0132",
     "tel": "+15555550132"
    }
   ],
   "email": "info@saltmarshcentre.example",
   "website": "https://www.saltmarshcentre.example",
   "eligibility": "",
   "categories": [
    "Skills-Based Education",
    "Family Violence",
    "Sexual Violence"
   ],
   "needs": [
    "Education & Employment",
    "Family & Sexual Violence"
   ],
   "indigenous": false
  },
  {
   "name": "Silverpine Indigenous Family Health",
   "services": "Family and community health programming rooted in Indigenous practice, including traditional healing, family violence prevention, and support for survivors of violence.\nServices include one to one counselling, healing circles, parenting programs delivered with cultural teachings, and accompaniment for people navigating hospitals, courts, or child welfare. Elders are available for consultation on request.",
   "address": "63 Silverpine Road, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0133",
     "tel": "+15555550133"
    },
    {
     "label": "Toll Free",
     "display": "1 (555) 555-0134",
     "tel": "+15555550134"
    }
   ],
   "email": "health@silverpinefamily.example",
   "website": "https://www.silverpinefamily.example",
   "eligibility": "",
   "categories": [
    "Family and Community Health",
    "Family Violence",
    "Sexual Violence",
    "Indigenous"
   ],
   "needs": [
    "Family & Community Health",
    "Family & Sexual Violence"
   ],
   "indigenous": true
  },
  {
   "name": "Stonegate Mobile Crisis Response",
   "services": "A crisis worker and a paramedic respond together to mental health calls, in place of a police response where it is safe to do so. The team can be reached directly by phone, and is also dispatched through the emergency line.\nThe team de-escalates on scene, arranges same-day follow-up, and can transport to hospital only when that is what the situation actually needs. Most calls end without a trip to the emergency department.",
   "address": "Mobile team, dispatched across the Lakeside district",
   "phones": [
    {
     "label": "Crisis",
     "display": "(555) 555-0135",
     "tel": "+15555550135"
    },
    {
     "label": "Phone",
     "display": "(555) 555-0136",
     "tel": "+15555550136"
    }
   ],
   "email": "stonegate@alderportcrisis.example",
   "website": "https://www.alderportcrisis.example",
   "eligibility": "N/A",
   "categories": [
    "Crisis",
    "Mental Health Services",
    "Community Treatment"
   ],
   "needs": [
    "Crisis & Emergency",
    "Mental Health"
   ],
   "indigenous": false
  },
  {
   "name": "Thistlewood Young Parents Housing",
   "services": "Transitional housing for young parents and their children, with eighteen self-contained units and staff on site. Tenancy runs up to two years, long enough to finish school or establish work.\nEach household works with a support worker on a plan covering education, child development, budgeting, and the move to permanent housing at the end. On-site child care is available during class and work hours.\nApplications are taken directly, without a referral, and being pregnant is enough to apply.",
   "address": "24 Thistlewood Court, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0137",
     "tel": "+15555550137"
    }
   ],
   "email": "apply@thistlewoodhousing.example",
   "website": "https://www.thistlewoodhousing.example",
   "eligibility": "Young parents aged 16 to 29 with a child or children in their care, or expecting.",
   "categories": [
    "Housing",
    "Childcare"
   ],
   "needs": [
    "Housing & Shelter",
    "Childcare & Family Support"
   ],
   "indigenous": false
  },
  {
   "name": "Two Rivers Indigenous Community Services",
   "services": "A large Indigenous-governed service organization delivering programs across health, justice, education, housing, and family support. The organization operates on the principle that a person should be able to enter through any program and reach any other one without starting over.\nHealth and wellness:\n• Community mental health workers, available for home and community visits\n• Substance use counselling, individual and group\n• Traditional healing and Elder services\n• Diabetes education and foot care clinics\n• Youth wellness programming, including after school groups\n\nJustice:\n• Bail supervision and bail beds\n• Court support workers at every sitting\n• Restorative justice and diversion for youth and adults\n• Reintegration support for people leaving custody, beginning before release\n• Support with warrants, fines, and identification\n\nEducation and employment:\n• Adult upgrading and high school credits\n• Trades exposure programming for youth\n• Employment counselling and paid work placements\n• Bursaries for students leaving the district to study\n\nHousing and family:\n• Transitional beds for adults and for youth\n• Housing search and landlord mediation\n• Family support workers, including work alongside child welfare files\n• Cultural programming open to the whole community, including language classes and seasonal camps\n\nCentral intake runs Monday through Friday, and every program shares one record so a person is not asked the same questions at each door. Outreach workers travel to outlying communities on a posted schedule. Transportation is provided for appointments where a person has no other way to get there.\nFees: None for community members\nLanguages: English, Indigenous language interpretation on request",
   "address": "900 Two Rivers Road, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0138",
     "tel": "+15555550138"
    },
    {
     "label": "Toll-Free",
     "display": "1 (555) 555-0139",
     "tel": "+15555550139"
    }
   ],
   "email": "intake@tworiversservices.example",
   "website": "https://www.tworiversservices.example",
   "eligibility": "N/A",
   "categories": [
    "Bail Supervision",
    "Bail Residency",
    "Childcare",
    "Restorative Justice and Diversion",
    "Education",
    "Skills-Based Education",
    "Employment",
    "Family and Community Health",
    "Community Treatment",
    "Mental Health Services",
    "Housing",
    "Indigenous"
   ],
   "needs": [
    "Justice & Legal",
    "Housing & Shelter",
    "Childcare & Family Support",
    "Education & Employment",
    "Family & Community Health",
    "Health & Wellness",
    "Treatment & Recovery",
    "Mental Health"
   ],
   "indigenous": true
  },
  {
   "name": "Westhaven Transitional Shelter",
   "services": "Emergency shelter for women and children leaving violence, open at all hours, with a crisis line answered by shelter staff rather than a call centre.\nWhile staying at the shelter, residents have access to:\nSafety planning: staff work through the specific risks in a woman's situation, including risks that continue after she leaves.\nAdvocacy: help with police reports, court applications, housing applications, and income assistance. Staff attend appointments alongside residents when asked.\nCounselling: a therapist on staff provides individual counselling to residents and to former residents for six months after they leave.\nChildren's programming: a child and youth worker runs daily programming, and supports children who have witnessed violence.\nReferrals and resources: staff know the local system well and connect residents to health, legal, education, income, and housing supports.\nVisiting nurse: a nurse practitioner visits weekly to assist women and children with primary health needs in a safe and supportive setting.\nThe shelter accepts women with older sons, and does not turn away a woman because she is using substances.",
   "address": "Mailing address: PO Box 49, Alderport",
   "phones": [
    {
     "label": "Crisis",
     "display": "(555) 555-0140",
     "tel": "+15555550140"
    },
    {
     "label": "Phone",
     "display": "(555) 555-0141",
     "tel": "+15555550141"
    }
   ],
   "email": "shelter@westhavenshelter.example",
   "website": "https://www.westhavenshelter.example",
   "eligibility": "",
   "categories": [
    "Housing",
    "Crisis",
    "Sexual Violence",
    "Family Violence"
   ],
   "needs": [
    "Housing & Shelter",
    "Crisis & Emergency",
    "Family & Sexual Violence"
   ],
   "indigenous": false
  },
  {
   "name": "Whitecap Indigenous Education Council",
   "services": "Education council supporting Indigenous learners from elementary school through post-secondary. The council funds tuition and living allowances for eligible students, places student success advisors in local high schools, and runs a summer transition program for students starting college or university.\nAdditional supports include tutoring, a laptop lending library, and travel assistance for students studying outside the district. Advisors stay with a student across the whole path rather than handing them off at each stage.",
   "address": "310 Whitecap Avenue, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0143",
     "tel": "+15555550143"
    },
    {
     "label": "Toll-Free",
     "display": "1 (555) 555-0144",
     "tel": "+15555550144"
    }
   ],
   "email": "",
   "website": "https://www.whitecapeducation.example",
   "eligibility": "Indigenous students. Funding applications close twice yearly.",
   "categories": [
    "Education",
    "Post Secondary Education",
    "Indigenous"
   ],
   "needs": [
    "Education & Employment"
   ],
   "indigenous": true
  },
  {
   "name": "Willowmere Peer Recovery Network",
   "services": "Peer-run recovery groups and one to one peer support, facilitated entirely by people with their own lived experience of substance use. Meetings run daily at rotating locations, and the schedule is posted at partner agencies across the district. No registration, no referral, and no requirement to be abstinent to attend.",
   "address": "Meets at rotating locations across the Lakeside district",
   "phones": [],
   "email": "",
   "website": "https://www.willowmererecovery.example",
   "eligibility": "",
   "categories": [
    "Community Treatment",
    "Addiction",
    "Indigenous"
   ],
   "needs": [
    "Addiction & Substance Use",
    "Treatment & Recovery"
   ],
   "indigenous": true
  },
  {
   "name": "Wrenfield Community Health Centre",
   "services": "Community health centre serving residents without a family doctor, with a walk-in clinic four days a week and a mental health team on site. The centre also runs harm reduction services, including supply distribution and overdose prevention education.\nAnyone can register as a patient. Health card, address, and status are not required to be seen.",
   "address": "5 Wrenfield Lane, Alderport",
   "phones": [
    {
     "label": "Phone",
     "display": "(555) 555-0145",
     "tel": "+15555550145"
    }
   ],
   "email": "reception@wrenfieldchc.example",
   "website": "https://www.wrenfieldchc.example",
   "eligibility": "N/A",
   "categories": [
    "Clinical Health Services",
    "Mental Health Services",
    "Addiction"
   ],
   "needs": [
    "Health & Wellness",
    "Mental Health",
    "Addiction & Substance Use"
   ],
   "indigenous": false
  }
 ],
 "needs": [
  "Education & Employment",
  "Housing & Shelter",
  "Crisis & Emergency",
  "Justice & Legal",
  "Family & Sexual Violence",
  "Family & Community Health",
  "Health & Wellness",
  "Childcare & Family Support",
  "Treatment & Recovery",
  "Addiction & Substance Use",
  "Mental Health",
  "Financial Supports"
 ],
 "count": 33
};
