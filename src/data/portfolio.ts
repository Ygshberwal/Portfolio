export const identity = {
  name: 'Yogesh Berwal',
  email: 'yogeshberwal266@gmail.com',
  github: 'https://github.com/Ygshberwal',
  linkedin: 'https://www.linkedin.com/in/ygshberwal/',
  location: 'Bengaluru, India',
  leetcode: 'https://leetcode.com/yogeshberwal/',
  geeksforgeeks: 'https://www.geeksforgeeks.org/profile/ygshberwal?tab=activity',
  gfgLeaderboard: 'https://www.geeksforgeeks.org/colleges/indian-institute-of-technology-iit-mandi/students/',
  instagram: 'https://www.instagram.com/ygshberwal26/',
  photography: 'https://www.instagram.com/through_the_lens.eye/',
  resume: 'https://drive.google.com/file/d/19q5LmZmuvKb35tK3pa1UunjTUf1nGga5/view?usp=sharing',
  resumeDownload: '/resume.pdf',
};

// Owner-confirmed college placement as of November 2026. This is a static
// college leaderboard snapshot (including alumni), not a global ranking.
export const codingHighlights = {
  problemsSolved: '2,000+',
  gfgCollegeRank: 2,
  institution: 'IIT Mandi',
  rankingAsOf: 'November 2026',
};

export interface ResearchPaper {
  title: string;
  authors: string[];
  affiliations: string[];
  documentUrl: string;
  role: 'First author' | 'Co-author';
  venue: string;
  presentedAt: string;
  status: string;
  summary: string;
}

// Titles and author order checked against the supplied PDF title pages.
// The owner confirms both were presented and accepted at MBCC in May 2026.
// Proceedings publication is pending; manuscript links are not DOI links.
export const researchPapers: ResearchPaper[] = [
  {
    title: 'Byte-Level Sequence-to-Sequence Architectures for Pitch Accent Restoration in Vedic Sanskrit',
    authors: ['Yogesh Berwal', 'Rohit Saluja'],
    affiliations: ['Indian Institute of Technology Mandi'],
    documentUrl: 'https://drive.google.com/file/d/1JAmSV71oGaGegxmPcAIcC-t4hNqxPc5D/view?usp=sharing',
    role: 'First author',
    venue: 'MBCC · IIT Mandi',
    presentedAt: 'May 2026',
    status: 'Presented & accepted · Publication pending',
    summary: 'Comparing subword and byte-level sequence-to-sequence models for restoring Vedic Sanskrit pitch accents, including the trade-offs of adding sentence context.',
  },
  {
    title: 'Improving AI Quality in Open-domain chatbots through Epistemic Embedding of IKS-derived Ontological systems within Transformer Architectures.',
    authors: ['Roshan Mohandas Palat', 'Yogesh Berwal', 'Rohit Saluja'],
    affiliations: ['Profundis AI Pvt. Ltd.', 'Indian Institute of Technology Mandi'],
    documentUrl: 'https://drive.google.com/file/d/1mgee8U17roJyorT0fxOJKsZj9Jk5ZeBI/view?usp=sharing',
    role: 'Co-author',
    venue: 'MBCC · IIT Mandi',
    presentedAt: 'May 2026',
    status: 'Presented & accepted · Publication pending',
    summary: 'Research into user modeling and response quality in open-domain chatbots, exploring an IKS-derived ontological framework and a multi-agent prototype.',
  },
];

export interface Project {
  slug: string;
  title: string;
  category: 'Product engineering' | 'Backend & systems' | 'Language research' | 'Data engineering' | 'Computer vision' | 'Algorithms';
  summary: string;
  subtitle: string;
  repo: string;
  stack: string[];
  tone: 'mint' | 'slate' | 'sand';
  mark: string;
  problem: string;
  approach: string;
  decisions: { title: string; text: string }[];
  limitation: string;
  evidence: { label: string; path: string }[];
  featured?: boolean;
  live?: string;
  backend?: string;
  play?: string;
  certificate?: string;
  ownerStory?: string;
  paper?: string;
  demo?: { url: string; availability: 'frontend-only' | 'unverified'; note: string };
}

export const projects: Project[] = [
  {
    slug: 'flowboard', title: 'FlowBoard', category: 'Product engineering',
    subtitle: 'A little structure. A lot more flow.',
    summary: 'Task planning and habit tracking, brought into one full-stack workspace. From drag-and-drop boards to a Canvas-based radial habit tracker.',
    repo: 'FlowBoard', stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'], tone: 'mint', mark: '↗', featured: true,
    problem: 'I wanted one place to organize my tasks and keep myself consistent with a routine. I built the planner for my day-to-day work, then added a habits section to keep track of the things I wanted to do regularly.',
    ownerStory: 'FlowBoard started as a personal project, and I now use it every day. Bringing my tasks and habits into one place has made both my professional and personal life easier to organize.',
    approach: 'Built a React and TypeScript frontend backed by asynchronous FastAPI endpoints, SQLAlchemy, and PostgreSQL. The interface includes customizable task boards, comments, habit tracking, a radial Canvas visualization, and an annual activity heatmap.',
    decisions: [
      { title: 'Immediate feedback, with a way back', text: 'Task moves update the TanStack Query cache optimistically. The previous board state is retained for rollback if the API request fails, and the query is invalidated after settlement.' },
      { title: 'Ownership belongs in the backend', text: 'Task service queries join tasks to sections and filter by user ownership. Moves also check that the destination section belongs to the requesting user.' },
      { title: 'Evolving the data model explicitly', text: 'Alembic migrations record changes to users, ownership, token versions, and task ordering rather than relying on manual database edits.' },
    ],
    limitation: 'An independently built application with a deployed frontend. The backend runs on free hosting, so a first visit may involve a cold start. Usage and production reliability have not been measured.',
    live: 'https://flowboard-fontend.vercel.app/',
    backend: 'https://flowboard-backend-v65t.onrender.com/api/health',
    demo: { url: 'https://flowboard-fontend.vercel.app/', availability: 'frontend-only', note: 'The frontend is deployed. The backend health endpoint timed out during the latest check; full application availability has not been confirmed.' },
    evidence: [{ label: 'Board interactions', path: 'frontend/src/components/tasks/Board.tsx' }, { label: 'Task service', path: 'backend/app/services/task_service.py' }, { label: 'Database migrations', path: 'backend/alembic/versions' }],
  },
  {
    slug: 'vehicle-parking', title: 'Vehicle Parking App', category: 'Backend & systems',
    subtitle: 'From available spaces to completed bookings.',
    summary: 'A multi-user parking application with separate administrator and driver workflows, database-backed reservations, reporting, and background jobs.',
    repo: 'Vehicle-Parking-App', stack: ['Python', 'Flask', 'Vue.js', 'SQLAlchemy', 'Redis', 'Celery'], tone: 'slate', mark: 'P', featured: true,
    problem: 'Parking management involves more than displaying empty spots: users need booking and release workflows, while administrators need capacity controls and a clear view of activity.',
    ownerStory: 'This started as a college project. I built the original coursework implementation end-to-end without AI assistance, in line with the academic rules, then continued developing it around my own needs. I am now exploring how to take it further as a commercial product.',
    approach: 'Built a Flask API and Vue interface with token-based authentication, role-based workflows, parking lot and slot management, reservations, transaction tracking, and usage dashboards.',
    decisions: [
      { title: 'Keep reporting outside the request path', text: 'The full local setup uses Redis and Celery for exports, scheduled reporting, and email notifications. MailHog supports local email testing.' },
      { title: 'Different environments, explicit trade-offs', text: 'The local setup uses SQLite, Redis, and Celery. The documented hosted-demo configuration instead uses PostgreSQL, in-process caching, direct CSV downloads, and no email workers.' },
      { title: 'A reproducible demo, not invented traction', text: 'Deployment documentation separates fictional shared demo data from real customer usage and describes migrations and guarded initialization.' },
    ],
    limitation: 'I am exploring a commercial direction for the project. A peer-to-peer marketplace, payments, and payouts remain future possibilities, not shipped functionality. The hosted demo runs a simplified configuration rather than the full local Redis/Celery setup.',
    live: 'https://vehicle-parking-q9h1.onrender.com/#/',
    demo: { url: 'https://vehicle-parking-q9h1.onrender.com/#/', availability: 'unverified', note: 'The owner-supplied hosted demo timed out during the latest check; availability has not been confirmed.' },
    evidence: [{ label: 'Setup and features', path: 'README.md' }, { label: 'Deployment trade-offs', path: 'DEPLOYMENT.md' }, { label: 'Data model', path: 'vehicle-parking-app/backend/models/models.py' }],
  },
  {
    slug: 'sanskrit-pitch', title: 'Sanskrit Pitch Prediction', category: 'Language research',
    subtitle: 'Finding the accents between the characters.',
    summary: 'Sequence-to-sequence research into restoring Vedic pitch accents, comparing subword and byte-level language models on 32,864 curated sentences.',
    repo: 'PitchPrediction', stack: ['Python', 'PyTorch', 'ByT5', 'mBART', 'NLP'], tone: 'sand', mark: 'अ', featured: true,
    problem: 'Digitized Vedic Sanskrit can lose the accent marks that carry important information. Restoring them requires attention to individual characters and their surrounding context.',
    approach: 'Curated 32,864 pitch-annotated sentences from SanskritDoc and evaluated mBART, SanskritByT5, and ByT5 under single-sentence and context-aware sequence-to-sequence formulations. The manuscript reports a 70/15/15 train/validation/test split, with pitch edit distance, pitch F1, exact match, and character-level corpus BLEU for evaluation.',
    decisions: [
      { title: 'Evaluate more than fluent output', text: 'BLEU, pitch-level F1, and sentence exact match describe different aspects of restoration. A single score is not a substitute for looking at accent-level errors.' },
      { title: 'Byte-level models and a useful negative result', text: 'In the manuscript’s single-sentence experiments, ByT5 reports 84.89 corpus BLEU, 0.78 pitch F1, and 58.77% exact match. Adding an accented reference sentence did not consistently improve the other models; the paired ByT5 setup exceeded input-length constraints. More context was not automatically better.' },
    ],
    limitation: 'The paper was presented and accepted at MBCC, IIT Mandi, in May 2026; publication is pending. Results are manuscript-reported experiments, not an independently reproduced benchmark. The context-aware ByT5 setup was not evaluated because of input-length constraints.',
    paper: researchPapers[0].documentUrl,
    certificate: 'https://drive.google.com/file/d/1XompCTFRd1DKdWavPDiHy8Kwg1LlrAL_/view?usp=share_link',
    evidence: [{ label: 'Experiment source', path: 'One_curve.py' }, { label: 'Model experiments', path: 'bart.py' }, { label: 'Data preparation', path: 'split_and_save_dataset.py' }],
  },
  {
    slug: 'megamart', title: 'MegaMart Capstone', category: 'Data engineering',
    subtitle: 'Raw retail data to analysis-ready tables.',
    summary: 'A learning capstone tracing retail data through ingestion, validation, cleaning, sales and inventory analysis, and dashboard-ready exports.',
    repo: 'MegaMart_Capstone', stack: ['PySpark', 'Spark SQL', 'Databricks', 'Delta tables'], tone: 'mint', mark: 'M',
    problem: 'Raw retail files need consistent validation and transformation before they can support useful reporting on sales, inventory, and suppliers.',
    approach: 'Organized the work into notebooks for ingestion, validation, cleaning, sales analysis, inventory analysis, dashboard data, and exports. The repository contains raw, silver, and dashboard CSV outputs.',
    decisions: [{ title: 'Make the transformation stages visible', text: 'Separate notebooks and named bronze/silver stages make the route from source data to reporting outputs explicit.' }, { title: 'Validate before analysis', text: 'The documented flow checks nulls, duplicate records, invalid values, dates, and referential integrity before building analysis datasets.' }],
    limitation: 'An independent learning project, not a production pipeline for a real retail client. The public repository contains dashboard-ready data; a finished Power BI dashboard is not independently verified.',
    evidence: [{ label: 'Pipeline outline', path: 'notebooks/README.ipynb' }, { label: 'Validation notebook', path: 'notebooks/02_data_validation.ipynb' }, { label: 'Dashboard datasets', path: 'data/dashboard' }],
  },
  {
    slug: 'order-management', title: 'Inventory & Order Management', category: 'Backend & systems',
    subtitle: 'The business rules behind an order.',
    summary: 'A full-stack assignment connecting products, customers, orders, and inventory with server-calculated totals and stock checks.',
    repo: 'EtharaOMS', stack: ['FastAPI', 'React', 'PostgreSQL', 'SQLAlchemy', 'Docker'], tone: 'slate', mark: 'O',
    problem: 'Order entry needs to keep product inventory and customer records connected, and business rules should be enforced by the server rather than only by the interface.',
    approach: 'Built a FastAPI and React assignment with endpoints and interfaces for customers, products, orders, and dashboard statistics. PostgreSQL supplies persistence, with Docker Compose for a reproducible setup.',
    decisions: [{ title: 'Calculate totals on the server', text: 'Order creation computes quantity × product price on the backend and rejects a request when the recorded stock is insufficient.' }, { title: 'Connect order changes to inventory', text: 'Creation decrements stock; deletion restores it. This illustrates a basic inventory lifecycle without claiming a concurrency-safe commercial ordering system.' }],
    limitation: 'Built as a full-stack assignment, separate from employer work. The stock-checking implementation needs stronger transactional handling before it could safely support concurrent purchases in a production system.',
    evidence: [{ label: 'Order API', path: 'backend/app/api/orders.py' }, { label: 'Project documentation', path: 'README.md' }],
  },
  {
    slug: 'attendance', title: 'AI Attendance Management', category: 'Computer vision',
    subtitle: 'From a classroom photo or video to an attendance record.',
    summary: 'An AI-assisted attendance system for identifying students from classroom photos or videos and recording attendance against a class and lecture date.',
    repo: 'AMS', stack: ['Python', 'Flask', 'SQLite', 'DeepFace', 'YOLO'], tone: 'sand', mark: 'A',
    problem: 'Taking attendance student by student interrupts a classroom session. I explored using classroom photos or videos to recognize the students present and turn that visual input into a saved attendance record.',
    approach: 'Combined a Flask application, student and instructor interfaces, and a face-recognition pipeline using detection and embedding matching. The inspected web integration sends classroom video to a separate recognition service, receives matched student roll numbers, and saves attendance with the course and lecture date. Photo/video-based attendance is the project scope; the public API inspected here specifically demonstrates the video workflow.',
    decisions: [{ title: 'From faces to student records', text: 'The recognition service detects heads in video frames, extracts face embeddings, and matches them against enrolled student embeddings. It returns student roll numbers, rather than asking the web application to handle recognition itself.' }, { title: 'Keep the classroom context with the result', text: 'The Flask workflow associates recognized students with a course and lecture date before saving attendance in SQLite. Detection is one part of the system; the attendance record is the useful output.' }],
    limitation: 'An academic prototype with local configuration, not a public biometric service or a privacy/security-reviewed deployment. Recognition accuracy is not claimed. No student images, biometric data, videos, or database contents are reproduced here.',
    evidence: [{ label: 'Application workflow', path: 'Backend/app.py' }, { label: 'Recognition integration', path: 'AI/main.py' }],
  },
  {
    slug: 'kavylm', title: 'KavyLM', category: 'Language research',
    subtitle: 'An experiment in Hindi and rhyme.',
    summary: 'Python and notebook experiments exploring Hindi poetry generation, BERT-related modeling, and rhyme-oriented word processing.',
    repo: 'KavyLM', stack: ['Python', 'Jupyter', 'Hindi NLP'], tone: 'sand', mark: 'क',
    problem: 'Creative language generation opens a different set of questions from conventional classification, particularly around poetic language and rhyme.',
    approach: 'Explored Hindi language-model experiments alongside rhyme-processing utilities. The public repository includes BERT-related scripts and a modeling notebook.',
    decisions: [{ title: 'Language tooling alongside modeling', text: 'Rhyme-related scripts sit alongside modeling experiments, reflecting an interest in the linguistic structure around generated poetry.' }],
    limitation: 'An exploratory code repository rather than a deployed poetry-generation service. Documentation is limited; no generated samples or verified model-quality benchmark are presented here.',
    evidence: [{ label: 'Modeling notebook', path: 'models.ipynb' }, { label: 'Rhyme utilities', path: 'RhymingWords.py' }],
  },
  {
    slug: 'grocery', title: 'Grocery Web App', category: 'Product engineering',
    subtitle: 'A foundation in full-stack workflows.',
    summary: 'An academic Flask application covering product and category management, inventory, pricing, and customer shopping workflows.',
    repo: 'Grocery-App-', stack: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS'], tone: 'mint', mark: 'G',
    problem: 'A grocery application serves two different audiences: administrators managing the catalog and customers browsing and shopping.',
    approach: 'Built server routes and templates around those administrative and customer workflows, with SQLite persistence.',
    decisions: [{ title: 'Build around distinct user tasks', text: 'Separate manager and customer templates organize catalog operations, shopping, and cart interactions around their intended users.' }],
    limitation: 'A foundational academic application, not a commercial e-commerce platform. Payment processing, customer adoption, and production security are not claimed.',
    evidence: [{ label: 'Application source', path: 'app.py' }, { label: 'Interface templates', path: 'templates' }],
  },
  {
    slug: 'tic-tac-toe', title: 'Tic-Tac-Toe AI', category: 'Algorithms',
    subtitle: 'A small game. A search problem underneath.',
    summary: 'A browser game with single-player and local multiplayer modes, backed by a JavaScript minimax implementation.',
    repo: 'Tic-Tac-Toe-AI', stack: ['JavaScript', 'HTML', 'CSS', 'Minimax'], tone: 'slate', mark: '×',
    problem: 'A compact game provides a tangible way to explore how a search algorithm evaluates possible future moves.',
    approach: 'Built the interface and move logic in vanilla JavaScript, HTML, and CSS, with a separate minimax implementation for computer-player decisions.',
    decisions: [{ title: 'A visible application of search', text: 'The dedicated minimax module connects an algorithmic decision process to an interactive browser interface.' }],
    limitation: 'A small foundational project with a public browser demo. No claim of an unbeatable opponent is made without exhaustive game-state testing.',
    play: 'https://ygshberwal.github.io/Tic-Tac-Toe-AI/',
    evidence: [{ label: 'Search implementation', path: 'minimax.js' }],
  },
];

export const skills = [
  { title: 'Backend & systems', items: ['Java', 'Python', 'FastAPI', 'Flask', 'REST APIs', 'SQLAlchemy', 'Redis', 'Celery'] },
  { title: 'Interfaces & products', items: ['React', 'TypeScript', 'JavaScript', 'Vue.js', 'HTML & CSS'] },
  { title: 'Data & infrastructure', items: ['PostgreSQL', 'SQLite', 'SQL', 'PySpark', 'Databricks', 'Docker', 'AWS SNS / SQS', 'CloudWatch'] },
  { title: 'Research & fundamentals', items: ['NLP', 'PyTorch', 'ByT5', 'mBART', 'Data structures & algorithms', 'OOP', 'DBMS'] },
];

export const education = [
  { school: 'IIT Mandi', degree: 'M.Tech · Computer Science & Engineering', dates: '2024–2026', grade: '8.68 / 10' },
  { school: 'IIT Madras', degree: 'Diplomas · Data Science & Programming', dates: '2021–2025', grade: '8.05 / 10' },
  { school: 'UIET, Kurukshetra University', degree: 'B.Tech · Computer Science & Engineering', dates: '2019–2023', grade: '8.35 / 10' },
];

export interface Experience {
  company: string;
  role: string;
  dates: string;
  location: string;
  current?: boolean;
  earlier?: boolean;
  summary?: string;
  tags?: string[];
  detail?: { label: string; items: string[]; note?: string; link?: { label: string; href: string } };
}

export const experience: Experience[] = [
  {
    company: 'KPI Partners', role: 'Data Engineer I', dates: 'Aug 2026 — Present', location: 'Bengaluru', current: true,
    summary: 'Hands-on training and independent data engineering projects using SQL, PySpark, and Databricks. Practicing data transformation, validation, and distributed processing through retail and NYC Taxi analytics projects.',
    tags: ['PySpark', 'SQL', 'Databricks'],
    detail: {
      label: "What I've been working on",
      items: [
        'Structured learning in SQL, PySpark, Databricks, Azure Data Factory, dbt, and ETL testing.',
        'Independent NYC Taxi analytics work processing 2.96 million records.',
        'MegaMart capstone: retail data ingestion, quality checks, transformations, and dashboard-ready outputs.',
      ],
      link: { label: 'Explore the capstone', href: '/work/megamart/' },
    },
  },
  // Role/dates confirmed by the owner; scope intentionally omitted until supplied.
  { company: 'Ethara AI', role: 'Software Engineer', dates: 'Jun — Aug 2026', location: 'Gurugram' },
  {
    company: 'Amazon', role: 'Software Development Engineer Intern · Billing & Pricing', dates: 'Jul — Dec 2025', location: 'Hyderabad',
    summary: 'Worked on backend reliability and service communication: API throttling in a Java microservice, an SNS–SQS messaging migration, and pre-production workflow validation.',
    tags: ['Java', 'Microservices', 'AWS SNS / SQS', 'CloudWatch'],
    detail: {
      label: 'A closer look at the engineering',
      items: [
        'Integrated rate limiting across 18 APIs and approximately 97 API–downstream combinations. Used CloudWatch traffic analysis to inform environment-specific policies.',
        'Implemented and deployed Java integration changes moving direct SQS-to-SQS communication toward an SNS–SQS publish/subscribe approach during regional migration.',
        'Debugged workflow failures and validated fixes through logs and end-to-end gamma testing across six regions.',
      ],
      note: 'Descriptions are intentionally generalized to respect confidentiality.',
    },
  },
  {
    company: 'STEMpedia', role: 'AI & Robotics Instructor', dates: 'Apr — Jul 2024', location: 'Hisar', earlier: true,
    summary: 'Taught Python and AI fundamentals and supported student robotics prototypes, connecting programming concepts with hands-on hardware and software projects.',
  },
];
