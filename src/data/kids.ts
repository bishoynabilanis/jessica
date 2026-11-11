export interface KidSticker {
  id: string
  emoji: string
  label: string
}

/** Little collectibles the child can win from the daily gift. */
export const giftStickers: KidSticker[] = [
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'lion', emoji: '🦁', label: 'Brave lion' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'dolphin', emoji: '🐬', label: 'Dolphin' },
  { id: 'icecream', emoji: '🍦', label: 'Ice cream' },
  { id: 'palette', emoji: '🎨', label: 'Artist' },
  { id: 'puzzle', emoji: '🧩', label: 'Puzzle' },
  { id: 'star', emoji: '🌟', label: 'Shining star' },
  { id: 'dino', emoji: '🦖', label: 'Dino' },
  { id: 'balloon', emoji: '🎈', label: 'Balloon' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'magic', emoji: '🪄', label: 'Magic wand' },
]
