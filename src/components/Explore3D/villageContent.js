import { PERSONAL, SKILLS, EXPERIENCE, PROJECTS } from '@/utils/constants'

const names = (arr) => arr.map((s) => s.name)

// Compact, 3D-text-friendly content for each village's two roadside billboards
// (left / right) and the floating landmark number. Kept short so the text stays
// legible in-world; the full detail still lives in the DOM ContentPanel.
export const VILLAGE_CONTENT = {
  profile: {
    banner: 'PROFILE',
    monument: '01',
    left: { title: 'WHO', lines: [PERSONAL.name, PERSONAL.title] },
    right: { title: 'ABOUT', lines: [PERSONAL.location, 'EN · FR · AR', 'Freelance ready'] },
  },
  skills: {
    banner: 'SKILLS',
    monument: '02',
    left: { title: 'FRONTEND', lines: names(SKILLS.frontend).slice(0, 5) },
    right: {
      title: 'BACKEND · AI',
      lines: [...names(SKILLS.backend).slice(0, 3), ...names(SKILLS.ai).slice(0, 2)],
    },
  },
  experience: {
    // station id 'experience' → titled "Impact"
    banner: 'IMPACT',
    monument: '03',
    left: { title: 'BY THE NUMBERS', lines: ['5+ years shipping', '-40% load time', '85%+ coverage'] },
    right: { title: 'RESULTS', lines: ['-60% prod bugs', '10k+ users', '4.2 / 5 rating'] },
  },
  work: {
    // station id 'work' → titled "Experience"
    banner: 'EXPERIENCE',
    monument: '04',
    left: { title: 'NOW', lines: [EXPERIENCE[0].company, EXPERIENCE[0].role] },
    right: { title: 'BEFORE', lines: EXPERIENCE.slice(1).map((e) => e.company) },
  },
  projects: {
    banner: 'PROJECTS',
    monument: '05',
    left: { title: 'BUILT', lines: PROJECTS.slice(0, 3).map((p) => p.name) },
    right: { title: 'ALSO', lines: PROJECTS.slice(3).map((p) => p.name) },
  },
}
