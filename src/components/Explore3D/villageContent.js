import { PERSONAL, SKILLS, EXPERIENCE, PROJECTS, CONTENT } from '@/utils/constants'

const names = (arr) => arr.map((s) => s.name)
const V = CONTENT.driveMode.villages

// Compact, 3D-text-friendly content for each village's two roadside billboards
// (left / right) and the floating landmark number. Kept short so the text stays
// legible in-world; the full detail still lives in the DOM ContentPanel.
// Editable strings (banners, billboard titles, static lines) live in
// src/content/content.json (driveMode.villages); the rest is derived from the
// portfolio data so it stays in sync automatically.
export const VILLAGE_CONTENT = {
  profile: {
    banner: V.profile.banner,
    monument: V.profile.monument,
    left: { title: V.profile.leftTitle, lines: [PERSONAL.name, PERSONAL.title] },
    right: { title: V.profile.rightTitle, lines: [PERSONAL.location, ...V.profile.rightExtraLines] },
  },
  skills: {
    banner: V.skills.banner,
    monument: V.skills.monument,
    left: { title: V.skills.leftTitle, lines: names(SKILLS.frontend).slice(0, 5) },
    right: {
      title: V.skills.rightTitle,
      lines: [...names(SKILLS.backend).slice(0, 3), ...names(SKILLS.ai).slice(0, 2)],
    },
  },
  experience: {
    // station id 'experience' → titled "Impact"
    banner: V.experience.banner,
    monument: V.experience.monument,
    left: { title: V.experience.leftTitle, lines: V.experience.leftLines },
    right: { title: V.experience.rightTitle, lines: V.experience.rightLines },
  },
  work: {
    // station id 'work' → titled "Experience"
    banner: V.work.banner,
    monument: V.work.monument,
    left: { title: V.work.leftTitle, lines: [EXPERIENCE[0].company, EXPERIENCE[0].role] },
    right: { title: V.work.rightTitle, lines: EXPERIENCE.slice(1).map((e) => e.company) },
  },
  projects: {
    banner: V.projects.banner,
    monument: V.projects.monument,
    left: { title: V.projects.leftTitle, lines: PROJECTS.slice(0, 3).map((p) => p.name) },
    right: { title: V.projects.rightTitle, lines: PROJECTS.slice(3).map((p) => p.name) },
  },
}
