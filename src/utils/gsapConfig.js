import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, TextPlugin, Flip)

export { gsap, ScrollTrigger, TextPlugin, Flip }
