/* Fictional region, fictional agencies, fictional numbers. Nothing here
   describes a real organization, program or person. Days are counted back
   from the demonstration day, so the page reads the same on any date. */

window.CL_DATA = {
  region: "Ashgrove region",
  towns: ["Ashgrove", "Millbrook", "Fernhill", "Stonebridge"],

  services: [
    { id: "s1",  name: "Family drop-in",        agency: "Ashgrove Family Centre",       town: "Ashgrove",    tags: ["family", "children"],        hours: "Mon to Fri, 9:00 to 4:00",  phone: "555-0110", status: "open",     checked: 12, desc: "Play space, parent chats and help finding the next service." },
    { id: "s2",  name: "Food cupboard",         agency: "Ashgrove Family Centre",       town: "Ashgrove",    tags: ["food"],                      hours: "Tue and Thu, 1:00 to 5:00", phone: "555-0111", status: "open",     checked: 20, desc: "Groceries once a week. No paperwork at the door." },
    { id: "s3",  name: "Housing intake",        agency: "Millbrook Housing Collective", town: "Millbrook",   tags: ["housing", "rent"],           hours: "Mon to Thu, 9:00 to 3:00",  phone: "555-0120", status: "waitlist", checked: 74, desc: "First stop for anyone looking for housing help.", owned: true },
    { id: "s4",  name: "Rent bank",             agency: "Millbrook Housing Collective", town: "Millbrook",   tags: ["housing", "rent", "money"], hours: "Wed, 10:00 to 2:00",        phone: "555-0121", status: "open",     checked: 31, desc: "One-time help with rent arrears, repaid over time.", owned: true },
    { id: "s5",  name: "Winter warming room",   agency: "Millbrook Housing Collective", town: "Millbrook",   tags: ["housing", "shelter"],       hours: "Nightly, 8:00 pm to 8:00 am", phone: "555-0122", status: "paused", checked: 96, desc: "Warm space overnight in the cold months.", owned: true },
    { id: "s6",  name: "Youth evening space",   agency: "Fernhill Youth Services",      town: "Fernhill",    tags: ["youth"],                     hours: "Mon to Fri, 4:00 to 9:00",  phone: "555-0130", status: "open",     checked: 8,  desc: "Drop-in for ages 13 to 19. Meals on Fridays." },
    { id: "s7",  name: "Youth job coaching",    agency: "Fernhill Youth Services",      town: "Fernhill",    tags: ["youth", "work"],             hours: "By booking",                phone: "555-0131", status: "waitlist", checked: 44, desc: "Resumes, first interviews and a first paycheque." },
    { id: "s8",  name: "Walk-in counselling",   agency: "Stonebridge Community Centre", town: "Stonebridge", tags: ["counselling", "support"],    hours: "Sat, 10:00 to 2:00",        phone: "555-0140", status: "open",     checked: 15, desc: "One free session, no appointment needed." },
    { id: "s9",  name: "Rides to appointments", agency: "Stonebridge Community Centre", town: "Stonebridge", tags: ["transport", "rides"],        hours: "Book two days ahead",       phone: "555-0141", status: "open",     checked: 27, desc: "Volunteer drivers across the region." },
    { id: "s10", name: "Settlement help",       agency: "Ridgeway Newcomer Centre",     town: "Ashgrove",    tags: ["newcomers"],                 hours: "Mon to Fri, 9:00 to 5:00",  phone: "555-0150", status: "open",     checked: 5,  desc: "Forms, school registration and finding your way." },
    { id: "s11", name: "Conversation circle",   agency: "Ridgeway Newcomer Centre",     town: "Ashgrove",    tags: ["newcomers", "language"],     hours: "Wed, 6:00 to 7:30",         phone: "555-0151", status: "open",     checked: 38, desc: "Practise English over tea." },
    { id: "s12", name: "Tax clinic",            agency: "Ridgeway Newcomer Centre",     town: "Ashgrove",    tags: ["money", "tax"],              hours: "March and April, Sat",      phone: "555-0152", status: "paused",   checked: 63, desc: "Free returns filed by trained volunteers." },
    { id: "s13", name: "Seniors lunch",         agency: "Larkspur Seniors Network",     town: "Millbrook",   tags: ["food", "seniors"],           hours: "Tue and Fri, 12:00",        phone: "555-0160", status: "open",     checked: 18, desc: "Hot lunch and company. Pay what you can." },
    { id: "s14", name: "Friendly visiting",     agency: "Larkspur Seniors Network",     town: "Fernhill",    tags: ["seniors", "support"],        hours: "Weekly, by match",          phone: "555-0161", status: "waitlist", checked: 52, desc: "A volunteer visitor, once a week." }
  ],

  systems: {
    records:    { name: "Records",    reads: "Only that a referral exists, and its step.", never: "Names, contact details, notes, anything clinical." },
    scheduling: { name: "Scheduling", reads: "Open intake times, so a handoff can offer a slot.", never: "Who is booked, or why." },
    payroll:    { name: "Payroll",    reads: "Which roles are staffed this week, so a handoff lands on someone at work.", never: "Pay, hours worked, or anything personal." },
    email:      { name: "Email",      reads: "Nothing. It sends short notices through the email you already use.", never: "Personal details. Notices say where to look, not what is inside." }
  },

  referral: {
    service: "Housing intake",
    steps: [
      { agency: "Ashgrove Family Centre",       role: "Front desk worker",           act: "Opens the referral in Ashgrove's own records.", button: "Send to Millbrook",               time: "Day 1, 10:14" },
      { agency: "Millbrook Housing Collective", role: "Housing intake coordinator",  act: "Accepts it and offers a first meeting time.",   button: "Accept and book a time",         time: "Day 1, 14:02" },
      { agency: "Millbrook Housing Collective", role: "Housing worker",              act: "Meets the family and sets the plan.",           button: "Mark the first meeting done",    time: "Day 3, 11:30" },
      { agency: "Ashgrove Family Centre",       role: "Front desk worker",           act: "Hears it landed. Closes the loop.",            button: "Close the loop",                 time: "Day 3, 11:31" }
    ]
  }
};
