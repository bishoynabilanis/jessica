export interface MascotStage {
  level: number
  name: string
  emoji: string
  threshold: number
  title: string
  blurb: string
  aura: string
}

export const mascotStages: MascotStage[] = [
  {
    level: 1,
    name: 'Jessling',
    emoji: '🌱',
    threshold: 0,
    title: 'The Curious Seed',
    blurb: 'Every great learner starts as a tiny seed of curiosity.',
    aura: '#21e6c9',
  },
  {
    level: 5,
    name: 'Spark',
    emoji: '✨',
    threshold: 600,
    title: 'The Idea Spark',
    blurb: 'You are asking better questions and your spark is showing.',
    aura: '#5cc8ff',
  },
  {
    level: 10,
    name: 'Fennec',
    emoji: '🦊',
    threshold: 1500,
    title: 'The Clever Desert Fox',
    blurb: 'Quick, sharp and always sniffing out the right answer.',
    aura: '#ffd166',
  },
  {
    level: 18,
    name: 'Nova',
    emoji: '🦅',
    threshold: 3000,
    title: 'The Sky Explorer',
    blurb: 'You see the whole curriculum from above now.',
    aura: '#a78bfa',
  },
  {
    level: 28,
    name: 'Dragon',
    emoji: '🐉',
    threshold: 5200,
    title: 'The Knowledge Dragon',
    blurb: 'You breathe confidence and guard your knowledge fiercely.',
    aura: '#ff7a8a',
  },
  {
    level: 40,
    name: 'Astral',
    emoji: '🦄',
    threshold: 8000,
    title: 'The Astral Legend',
    blurb: 'A legendary learner. Your consistency is your superpower.',
    aura: '#f0abfc',
  },
]

export function mascotForXp(xp: number) {
  let current = mascotStages[0]
  for (const stage of mascotStages) {
    if (xp >= stage.threshold) current = stage
  }
  const index = mascotStages.indexOf(current)
  return { current, next: mascotStages[index + 1], index }
}

export interface MascotLook {
  id: string
  label: string
  emoji: string
  unlockXp: number
}

export const mascotLooks: MascotLook[] = [
  { id: 'classic', label: 'Classic', emoji: '✨', unlockXp: 0 },
  { id: 'scholar', label: 'Scholar', emoji: '🎓', unlockXp: 400 },
  { id: 'cool', label: 'Cool shades', emoji: '😎', unlockXp: 1200 },
  { id: 'crown', label: 'Study crown', emoji: '👑', unlockXp: 2500 },
  { id: 'medal', label: 'Champion', emoji: '🏅', unlockXp: 4500 },
  { id: 'wizard', label: 'Word wizard', emoji: '🧙', unlockXp: 7000 },
]

export const cosmeticUnlocks = [
  { id: 'hat', label: 'Graduation cap', emoji: '🎓', xp: 400 },
  { id: 'glasses', label: 'Genius glasses', emoji: '👓', xp: 900 },
  { id: 'scarf', label: 'House scarf', emoji: '🧣', xp: 1400 },
  { id: 'crown', label: 'XP crown', emoji: '👑', xp: 2500 },
  { id: 'wings', label: 'Wings of wisdom', emoji: '🪽', xp: 3800 },
  { id: 'aura', label: 'Aurora aura', emoji: '🌈', xp: 5500 },
]
