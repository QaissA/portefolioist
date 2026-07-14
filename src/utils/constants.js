// All portfolio copy now lives in a single editable tree: src/content/content.json.
// This module re-exports slices of that tree under the legacy names/shapes the
// rest of the app already imports, so editing the JSON is the only thing needed
// to change the site's text. Import `CONTENT` directly for section copy
// (headings, labels, button text, …).
import CONTENT from '@/content/content.json'

export { CONTENT }

export const PERSONAL = CONTENT.personal
export const SKILLS = CONTENT.skills.groups
export const ACHIEVEMENTS = CONTENT.achievements.items
export const EXPERIENCE = CONTENT.timeline.experience
export const PROJECTS = CONTENT.projects
export const AI_FLOW_NODES = CONTENT.ai.flowNodes
export const MARQUEE_ITEMS = CONTENT.marqueeItems
