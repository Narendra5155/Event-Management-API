import {
  Music,
  PartyPopper,
  Presentation,
  Sparkles,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/types/api'

export const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon; hue: string }> = {
  conference: { label: 'Conference', icon: Presentation, hue: '#7C5CFF' },
  workshop: { label: 'Workshop', icon: Wrench, hue: '#4FD1C5' },
  meetup: { label: 'Meetup', icon: Users, hue: '#FFB547' },
  concert: { label: 'Concert', icon: Music, hue: '#F0459B' },
  sports: { label: 'Sports', icon: Trophy, hue: '#6EE7A0' },
  festival: { label: 'Festival', icon: PartyPopper, hue: '#FF8A5B' },
  other: { label: 'Other', icon: Sparkles, hue: '#B9B3D6' },
}
