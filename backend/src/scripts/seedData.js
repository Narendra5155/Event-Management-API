// Demo content for `npm run seed`. Dates are relative to the day the seed runs.

export const STAFF = [
  { name: 'Ada Admin', email: 'admin@eventsphere.dev', password: 'Admin@1234', role: 'admin' },
  { name: 'Olivia Organizer', email: 'organizer@eventsphere.dev', password: 'Organizer@1234', role: 'organizer' },
  { name: 'Marcus Rivera', email: 'marcus@eventsphere.dev', password: 'Organizer@1234', role: 'organizer' },
  { name: 'Priya Sharma', email: 'priya@eventsphere.dev', password: 'Organizer@1234', role: 'organizer' },
  { name: 'Aiden Attendee', email: 'attendee@eventsphere.dev', password: 'Attendee@1234', role: 'attendee' },
];

// Combined into 60 demo attendees who fill the seats.
export const FIRST_NAMES = [
  'Maya', 'Liam', 'Zara', 'Noah', 'Ananya', 'Ethan', 'Sofia', 'Kenji', 'Amara', 'Lucas',
  'Isla', 'Arjun', 'Chloe', 'Mateo', 'Leah', 'Omar', 'Hana', 'Felix', 'Nia', 'Ravi',
];
export const LAST_NAMES = ['Chen', 'Patel', 'Okafor', 'Silva', 'Novak', 'Kim', 'Haddad', 'Larsen', 'Mehta', 'Rossi'];
export const DEMO_ATTENDEE_COUNT = 60;
export const DEMO_ATTENDEE_PASSWORD = 'Demo@1234';

/**
 * day      days from today (negative = already happened)
 * hour     local start hour; hours = duration
 * fill     share of capacity to fill with demo attendees (capped by how many exist)
 * organizer index into the organizers in STAFF (0 = Olivia, 1 = Marcus, 2 = Priya)
 * joins    whether the main demo attendee has a seat
 */
export const EVENTS = [
  // ---- Upcoming ----
  {
    title: 'Future of Web Summit 2026',
    description:
      'A two-day deep dive into the technologies shaping the web: edge rendering, AI-native interfaces, WebGPU and the next generation of frameworks.\n\nFeaturing 30+ speakers, hands-on labs and an evening networking mixer.',
    category: 'conference',
    venue: { name: 'Moscone Center West', address: '800 Howard St', city: 'San Francisco' },
    day: 12, hour: 9, hours: 9, capacity: 150, price: 249, fill: 0.35, organizer: 0, joins: true,
    image: '1540575467063-178a50c2df87', tags: ['web', 'javascript', 'ai'],
  },
  {
    title: 'Hands-on Node.js Performance Workshop',
    description:
      'Profile, benchmark and optimize real Node.js services. Bring a laptop: we will work through flame graphs, event loop lag, memory leaks and MongoDB query tuning with indexes.',
    category: 'workshop',
    venue: { name: 'Hacker Dojo', address: '855 Maude Ave', city: 'Mountain View' },
    day: 5, hour: 10, hours: 6, capacity: 30, price: 79, fill: 0.93, organizer: 1, joins: true,
    image: '1556761175-5973dc0f32e7', tags: ['nodejs', 'performance', 'backend'],
  },
  {
    title: 'Midnight Synthwave Live',
    description:
      'Neon lights, analog synths and a wall of sound. An all-night synthwave showcase featuring four headline acts and immersive visuals.',
    category: 'concert',
    venue: { name: 'The Warfield', address: '982 Market St', city: 'San Francisco' },
    day: 20, hour: 21, hours: 4, capacity: 120, price: 55, fill: 0.45, organizer: 0,
    image: '1514525253161-7a46d19cd819', tags: ['music', 'live', 'nightlife'],
  },
  {
    title: 'Remote Builders Meetup',
    description:
      'A relaxed online meetup for indie hackers and remote engineers. Lightning talks, show-and-tell demos and breakout rooms to meet other builders.',
    category: 'meetup',
    isOnline: true, onlineUrl: 'https://meet.example.com/remote-builders',
    day: 3, hour: 17, hours: 2, capacity: 80, price: 0, fill: 0.5, organizer: 1, joins: true,
    image: '1531058020387-3be344556be6', tags: ['community', 'remote', 'startups'],
  },
  {
    title: 'City Marathon 2026',
    description:
      'Run through the heart of the city on a fast, scenic course. Includes 5K, half and full marathon distances, chip timing and a finish-line festival.',
    category: 'sports',
    venue: { name: 'Golden Gate Park', address: '501 Stanyan St', city: 'San Francisco' },
    day: 40, hour: 6, hours: 7, capacity: 200, price: 65, fill: 0.25, organizer: 0,
    image: '1452626038306-9aae5e071dd3', tags: ['running', 'fitness', 'outdoors'],
  },
  {
    title: 'Lantern Lights Festival',
    description:
      'Three nights of light installations, street food from 40 vendors, live performances and a closing lantern release over the bay.',
    category: 'festival',
    venue: { name: 'Pier 70', address: '420 22nd St', city: 'San Francisco' },
    day: 28, hour: 17, hours: 6, capacity: 150, price: 25, fill: 0.4, organizer: 1,
    image: '1459749411175-04bf5292ceea', tags: ['culture', 'food', 'art'],
  },
  {
    title: 'Designing with Data: UX Research Bootcamp',
    description:
      'Learn to plan, run and synthesize user research that actually changes product decisions. Interviews, surveys, usability tests and turning insights into roadmaps.',
    category: 'workshop',
    isOnline: true, onlineUrl: 'https://meet.example.com/ux-bootcamp',
    day: 9, hour: 15, hours: 3, capacity: 60, price: 39, fill: 0.6, organizer: 2,
    image: '1552664730-d307ca884978', tags: ['design', 'ux', 'research'],
  },
  {
    title: 'AI Product Leaders Forum',
    description:
      'Product and engineering leaders share what is working, and what is not, when shipping AI features to millions of users. Panels, case studies and roundtables.',
    category: 'conference',
    venue: { name: 'Javits Center', address: '429 11th Ave', city: 'New York' },
    day: 33, hour: 9, hours: 8, capacity: 120, price: 349, fill: 0.45, organizer: 1,
    image: '1505373877841-8d25f7d46678', tags: ['ai', 'product', 'leadership'],
  },
  {
    title: 'Jazz on the Rooftop',
    description:
      'An intimate evening of live jazz under the stars with a quartet from the Blue Note circuit. Limited seating, cocktails available.',
    category: 'concert',
    venue: { name: 'Skyline Terrace', address: '15 W 28th St', city: 'New York' },
    day: 7, hour: 20, hours: 3, capacity: 12, price: 45, fill: 1, organizer: 0,
    image: '1415201364774-f6f0bb35f28f', tags: ['jazz', 'music', 'rooftop'],
  },
  {
    title: 'Open Source Saturday',
    description:
      'Pair up with maintainers and contribute to real open source projects. First-timers welcome: we will help you land your first pull request.',
    category: 'meetup',
    venue: { name: 'GitHub HQ', address: '88 Colin P Kelly Jr St', city: 'San Francisco' },
    day: 15, hour: 11, hours: 5, capacity: 40, price: 0, fill: 0.7, organizer: 2, joins: true,
    image: '1522071820081-009f0129c71c', tags: ['opensource', 'community', 'git'],
  },
  {
    title: 'Startup Pitch Night',
    description:
      'Ten early-stage startups pitch to a panel of investors and a live audience. Vote for your favorite and stay for drinks with founders.',
    category: 'other',
    venue: { name: 'WeWork Bryant Park', address: '54 W 40th St', city: 'New York' },
    day: 18, hour: 18, hours: 3, capacity: 50, price: 15, fill: 0.76, organizer: 1,
    image: '1475721027785-f74eccf877e2', tags: ['startups', 'investing', 'networking'],
  },
  {
    title: 'Bengaluru Tech Meetup: Scaling Postgres',
    description:
      'Three engineering teams share how they scaled Postgres past a billion rows: partitioning, connection pooling, read replicas and the mistakes they made along the way. Q&A and chai afterwards.',
    category: 'meetup',
    venue: { name: 'Bangalore International Centre', address: '7 4th Main Rd, Domlur', city: 'Bengaluru' },
    day: 6, hour: 18, hours: 3, capacity: 90, price: 0, fill: 0.55, organizer: 2,
    image: '1515187029135-18ee286d815b', tags: ['postgres', 'databases', 'backend'],
  },
  {
    title: 'React Native in Production',
    description:
      'A practical online workshop on shipping React Native apps that stay fast: the new architecture, navigation, offline storage, OTA updates and crash reporting.',
    category: 'workshop',
    isOnline: true, onlineUrl: 'https://meet.example.com/rn-production',
    day: 11, hour: 16, hours: 4, capacity: 50, price: 49, fill: 0.48, organizer: 0,
    image: '1498050108023-c5249f4df085', tags: ['react-native', 'mobile', 'javascript'],
  },
  {
    title: 'Electronic Nights: Warehouse Edition',
    description:
      'Techno and house until sunrise in a converted warehouse. Two rooms, eight DJs and a sound system built for the space.',
    category: 'concert',
    venue: { name: 'Halle am Berghain', address: 'Am Wriezener Bahnhof', city: 'Berlin' },
    day: 23, hour: 22, hours: 7, capacity: 120, price: 30, fill: 0.5, organizer: 1,
    image: '1470229722913-7c0e2dbbafd3', tags: ['techno', 'house', 'nightlife'],
  },
  {
    title: 'Street Food & Lights Night Market',
    description:
      'Over 60 stalls of regional street food, local crafts and live folk music along the seafront. Family friendly, open late.',
    category: 'festival',
    venue: { name: 'Carter Road Promenade', address: 'Bandra West', city: 'Mumbai' },
    day: 16, hour: 17, hours: 6, capacity: 150, price: 0, fill: 0.36, organizer: 2,
    image: '1555939594-58d7cb561ad1', tags: ['food', 'market', 'family'],
  },
  {
    title: 'Women in Tech Leadership Summit',
    description:
      'A day of talks, workshops and mentoring circles for women leading engineering, product and design teams. Includes a sponsored career fair.',
    category: 'conference',
    venue: { name: 'The Barbican Centre', address: 'Silk St', city: 'London' },
    day: 26, hour: 9, hours: 8, capacity: 140, price: 120, fill: 0.4, organizer: 2, joins: true,
    image: '1528605248644-14dd04022da1', tags: ['leadership', 'careers', 'diversity'],
  },
  {
    title: 'Pickup Basketball League Finals',
    description:
      'The season ends here: the top two rec-league teams play for the trophy. Free entry, food trucks outside and a three-point contest at half time.',
    category: 'sports',
    venue: { name: 'Gallagher Way Courts', address: '3637 N Clark St', city: 'Chicago' },
    day: 8, hour: 19, hours: 2, capacity: 40, price: 0, fill: 0.8, organizer: 0,
    image: '1546519638-68e109498ffc', tags: ['basketball', 'community', 'sports'],
  },
  {
    title: 'Intro to Machine Learning with Python',
    description:
      'A beginner-friendly, hands-on workshop. Load real data with pandas, train your first models with scikit-learn and learn how to tell whether they are any good.',
    category: 'workshop',
    venue: { name: 'Innov8 Connaught Place', address: 'Regal Building, Connaught Place', city: 'New Delhi' },
    day: 4, hour: 10, hours: 5, capacity: 35, price: 25, fill: 0.86, organizer: 2,
    image: '1517245386807-bb43f82c33c4', tags: ['python', 'machine-learning', 'beginners'],
  },
  {
    title: 'Photography Walk: Old Town at Golden Hour',
    description:
      'A slow walk through the old town with a local photographer. Learn composition and light in the hour before sunset. Any camera, including phones, is welcome.',
    category: 'other',
    venue: { name: 'Miradouro de Santa Luzia', address: 'Largo Santa Luzia', city: 'Lisbon' },
    day: 2, hour: 18, hours: 2, capacity: 20, price: 10, fill: 0.9, organizer: 0,
    image: '1513151233558-d860c5398176', tags: ['photography', 'outdoors', 'walking'],
  },
  {
    title: 'Cloud Security Roundtable',
    description:
      'Security engineers compare notes on IAM sprawl, secrets management and incident response in multi-cloud setups. Chatham House rules.',
    category: 'meetup',
    isOnline: true, onlineUrl: 'https://meet.example.com/cloud-security',
    day: 13, hour: 17, hours: 2, capacity: 45, price: 0, fill: 0.42, organizer: 1,
    image: '1504384308090-c894fdcc538d', tags: ['security', 'cloud', 'devops'],
  },
  {
    title: 'Open Air Cinema: Summer Classics',
    description:
      'Classic films on a giant screen under the stars. Bring a blanket; deck chairs and popcorn are available on site.',
    category: 'festival',
    venue: { name: 'Hollywood Forever Cemetery', address: '6000 Santa Monica Blvd', city: 'Los Angeles' },
    day: 19, hour: 19, hours: 3, capacity: 100, price: 18, fill: 0.5, organizer: 0,
    image: '1489599849927-2ee91cede3ba', tags: ['film', 'outdoors', 'summer'],
  },
  {
    title: 'DevOps Days Bay Area',
    description:
      'Two days of talks and open spaces on CI/CD, platform engineering, observability and on-call culture, organized by practitioners for practitioners.',
    category: 'conference',
    venue: { name: 'Computer History Museum', address: '1401 N Shoreline Blvd', city: 'Mountain View' },
    day: 45, hour: 9, hours: 8, capacity: 150, price: 199, fill: 0.2, organizer: 1,
    image: '1523580494863-6f3031224c94', tags: ['devops', 'platform', 'observability'],
  },
  {
    title: 'Sunrise Cycling Club: Coastal 60K',
    description:
      'A no-drop group ride along the coast at a conversational pace, with a coffee stop halfway. Helmets required; e-bikes welcome.',
    category: 'sports',
    venue: { name: 'Crissy Field', address: '1199 E Beach', city: 'San Francisco' },
    day: 10, hour: 6, hours: 4, capacity: 30, price: 0, fill: 0.63, organizer: 0,
    image: '1517649763962-0c623066013b', tags: ['cycling', 'outdoors', 'fitness'],
  },

  // ---- Draft and cancelled ----
  {
    title: 'Mobile Dev Unconference',
    description:
      'An attendee-driven unconference for iOS, Android and cross-platform developers. The agenda is set on the day by the participants.',
    category: 'conference',
    venue: { name: 'Austin Convention Center', address: '500 E Cesar Chavez St', city: 'Austin' },
    day: 60, hour: 9, hours: 8, capacity: 100, price: 99, fill: 0, organizer: 0,
    image: '1511578314322-379afb476865', tags: ['mobile', 'ios', 'android'], status: 'draft',
  },
  {
    title: 'Harbour Kayak Day Trip',
    description:
      'A guided paddle around the harbour islands with a picnic lunch. Cancelled due to a forecast storm; registered attendees have been notified.',
    category: 'sports',
    venue: { name: 'Sausalito Boathouse', address: '100 Bay St', city: 'Sausalito' },
    day: 9, hour: 9, hours: 6, capacity: 24, price: 60, fill: 0.5, organizer: 1,
    image: '1502680390469-be75c86b636f', tags: ['kayaking', 'outdoors'], status: 'cancelled',
  },

  // ---- Past ----
  {
    title: 'Winter JS Conf 2026',
    description:
      'A single-track JavaScript conference with talks on signals, server components, build tooling and the state of TypeScript.',
    category: 'conference',
    venue: { name: 'Kulturbrauerei', address: 'Schönhauser Allee 36', city: 'Berlin' },
    day: -25, hour: 9, hours: 8, capacity: 120, price: 150, fill: 0.75, organizer: 1, joins: true,
    image: '1505373877841-8d25f7d46678', tags: ['javascript', 'typescript', 'web'],
  },
  {
    title: 'Indie Game Dev Jam',
    description:
      'A 48-hour online game jam. Teams formed on the day, theme announced at kickoff, playable builds judged on the final evening.',
    category: 'workshop',
    isOnline: true, onlineUrl: 'https://meet.example.com/game-jam',
    day: -10, hour: 17, hours: 48, capacity: 80, price: 0, fill: 0.8, organizer: 2,
    image: '1492684223066-81342ee5ff30', tags: ['gamedev', 'jam', 'unity'],
  },
  {
    title: 'Sunset Acoustic Sessions',
    description:
      'Singer-songwriters play stripped-back sets on the lawn as the sun goes down. Picnics encouraged.',
    category: 'concert',
    venue: { name: 'Zilker Park', address: '2207 Lou Neff Rd', city: 'Austin' },
    day: -5, hour: 18, hours: 3, capacity: 60, price: 20, fill: 0.9, organizer: 0, joins: true,
    image: '1501281668745-f7f57925c3b4', tags: ['acoustic', 'music', 'outdoors'],
  },
  {
    title: 'Product Managers Breakfast',
    description:
      'Coffee, pastries and an honest conversation about roadmaps, saying no, and working with engineering. Small group, no slides.',
    category: 'meetup',
    venue: { name: 'Storyville Coffee', address: '94 Pike St', city: 'Seattle' },
    day: -3, hour: 8, hours: 2, capacity: 25, price: 0, fill: 0.96, organizer: 2,
    image: '1517457373958-b7bdd4587205', tags: ['product', 'breakfast', 'networking'],
  },
  {
    title: 'Charity 10K Fun Run',
    description:
      'A flat, friendly 10K through the park raising money for local food banks. Costumes encouraged, medals for everyone.',
    category: 'sports',
    venue: { name: 'Hyde Park', address: 'Serpentine Rd', city: 'London' },
    day: -14, hour: 9, hours: 3, capacity: 150, price: 15, fill: 0.4, organizer: 0,
    image: '1461896836934-ffe607ba8211', tags: ['running', 'charity', 'fitness'],
  },
  {
    title: 'Summer Sound Festival',
    description:
      'Three stages, 25 artists and a weekend of indie, electronic and hip-hop in the city’s biggest park.',
    category: 'festival',
    venue: { name: 'Grant Park', address: '337 E Randolph St', city: 'Chicago' },
    day: -40, hour: 12, hours: 10, capacity: 200, price: 89, fill: 0.3, organizer: 1,
    image: '1506157786151-b8491531f063', tags: ['music', 'festival', 'summer'],
  },
];
