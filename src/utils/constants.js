export const PERSONAL = {
  name: 'Qaiss Abdelhamid',
  title: 'Senior Fullstack Engineer',
  subtitle: 'Angular Specialist · AI-Augmented Developer',
  location: 'Rabat, Morocco',
  email: 'qaiss.abdelhamid@email.com',
  github: 'https://github.com/qaiss-abdelhamid',
  linkedin: 'https://linkedin.com/in/qaiss-abdelhamid',
  tagline: 'I ship production-grade software faster than anyone else — combining deep frontend expertise with strategic AI orchestration.',
  bio: `Senior Fullstack Engineer with 3+ years building scalable web platforms and mobile applications. Angular specialist, TypeScript purist, and AI-augmented developer who ships clean, maintainable code on time — every time. I work independently in Agile teams, communicate clearly with clients, and bring a product mindset to every engagement. Fluent in English, French, and Arabic.`,
}

export const SKILLS = {
  frontend: [
    { name: 'Angular 17', icon: 'SiAngular' },
    { name: 'TypeScript', icon: 'SiTypescript' },
    { name: 'React', icon: 'SiReact' },
    { name: 'Next.js', icon: 'SiNextdotjs' },
    { name: 'RxJS', icon: 'SiReactivex' },
    { name: 'NgRx', icon: 'SiNgrx' },
    { name: 'Tailwind CSS', icon: 'SiTailwindcss' },
  ],
  backend: [
    { name: 'Node.js', icon: 'SiNodedotjs' },
    { name: 'Spring Boot', icon: 'SiSpring' },
    { name: 'Java', icon: 'FaJava' },
    { name: 'REST APIs', icon: 'TbApi' },
    { name: 'GraphQL', icon: 'SiGraphql' },
    { name: 'PostgreSQL', icon: 'SiPostgresql' },
  ],
  mobile: [
    { name: 'Flutter', icon: 'SiFlutter' },
    { name: 'Dart', icon: 'SiDart' },
  ],
  ai: [
    { name: 'Claude AI', icon: 'SiAnthropic' },
    { name: 'Cursor', icon: 'TbCursorText' },
    { name: 'GitHub Copilot', icon: 'SiGithubcopilot' },
    { name: 'MCP', icon: 'TbBrain' },
    { name: 'Prompt Engineering', icon: 'TbPrompt' },
  ],
  devops: [
    { name: 'Docker', icon: 'SiDocker' },
    { name: 'CI/CD', icon: 'SiGithubactions' },
    { name: 'Jest', icon: 'SiJest' },
    { name: 'Cypress', icon: 'SiCypress' },
    { name: 'SonarQube', icon: 'SiSonarqube' },
  ],
}

export const ACHIEVEMENTS = [
  { value: 40, suffix: '%', label: 'Load time reduction', sublabel: 'via lazy loading + OnPush + NgRx', prefix: '-' },
  { value: 85, suffix: '%+', label: 'Test coverage', sublabel: 'and -60% production bugs', prefix: '' },
  { value: 50, suffix: '%', label: 'Onboarding time cut', sublabel: 'via AI-generated documentation', prefix: '-' },
  { value: 40, suffix: '%', label: 'Faster feature delivery', sublabel: 'via AI agent orchestration', prefix: '-' },
  { value: 10000, suffix: '+', label: 'Active users served', sublabel: 'on production architecture', prefix: '' },
  { value: 4.2, suffix: '/5', label: 'Mobile app rating', sublabel: 'on app stores', prefix: '' },
]

export const EXPERIENCE = [
  {
    id: 1,
    company: 'Netopia',
    role: 'Senior Frontend Engineer',
    period: 'Dec 2024 — Present',
    location: 'Remote',
    current: true,
    highlights: [
      'Built Elivret & Passeport Maroc products using Angular 17 with advanced state management',
      'Implemented OnPush change detection strategy reducing re-render cycles by 40%',
      'Architected NgRx store patterns adopted as team standard across 3 squads',
      'Led frontend technical reviews and established coding standards documentation',
    ],
  },
  {
    id: 2,
    company: 'DXC Technology',
    role: 'Fullstack Developer',
    period: 'Jul 2024 — Dec 2024',
    location: 'Rabat, Morocco',
    current: false,
    highlights: [
      'Developed fullstack features across Angular frontend and Spring Boot microservices',
      'Integrated PostgreSQL schemas with complex query optimization for reporting module',
      'Delivered REST API contracts collaborating with 4 backend engineers',
      'Achieved 85%+ test coverage using Jest + Cypress across assigned modules',
    ],
  },
  {
    id: 3,
    company: 'Mibtech',
    role: 'Frontend Developer',
    period: 'Mar 2024 — Jul 2024',
    location: 'Morocco',
    current: false,
    highlights: [
      'Built Angular SaaS platform from scratch, launching with zero critical bugs',
      'Implemented reusable component library reducing development time by 30%',
      'Integrated CI/CD pipeline with SonarQube quality gates enforcing code standards',
    ],
  },
  {
    id: 4,
    company: 'AtTimeTechnologie / Isicod',
    role: 'Fullstack & Mobile Developer',
    period: 'Sept 2022 — Feb 2024',
    location: 'Morocco',
    current: false,
    highlights: [
      'Built and shipped Flutter mobile application rated 4.2/5 on app stores',
      'Scaled web platform architecture to serve 2,000+ active users',
      'Delivered onboarding documentation using AI tools, reducing ramp-up time by 50%',
      'Contributed across Angular frontend, Node.js backend, and Flutter mobile tracks',
    ],
  },
]

export const AI_FLOW_NODES = [
  { id: 'input', label: 'User Request', x: 50, y: 30, type: 'io' },
  { id: 'orchestrator', label: 'Orchestrator Agent', x: 50, y: 130, type: 'core' },
  { id: 'router', label: 'Tool Router', x: 50, y: 230, type: 'core' },
  { id: 'search', label: 'Web Search', x: 10, y: 340, type: 'tool' },
  { id: 'codegen', label: 'Code Gen', x: 50, y: 340, type: 'tool' },
  { id: 'rag', label: 'RAG Chain', x: 90, y: 340, type: 'tool' },
  { id: 'memory', label: 'Memory / Context', x: 50, y: 450, type: 'store' },
  { id: 'synthesizer', label: 'Response Synthesizer', x: 50, y: 550, type: 'core' },
  { id: 'output', label: 'Final Output', x: 50, y: 650, type: 'io' },
]

export const MARQUEE_ITEMS = [
  'Angular', 'TypeScript', 'React', 'Next.js', 'NgRx', 'RxJS',
  'Spring Boot', 'Node.js', 'Java', 'PostgreSQL', 'GraphQL',
  'Flutter', 'Docker', 'CI/CD', 'Jest', 'Cypress',
  'Claude AI', 'MCP', 'Prompt Engineering', 'Agent Orchestration',
  'TDD', 'SonarQube', 'REST APIs', 'Agile', 'Fullstack',
]
