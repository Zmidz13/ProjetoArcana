import type { Metadata } from 'next'

import { CalendarPanel } from '@/components/pages/calendar-panel.tsx'

export const metadata: Metadata = {
  title: 'Calendário lunar e de sabbats',
  description: 'Uma carta por dia, fase da Lua e os oito sabbats, apresentados como tradição simbólica e memória visual.',
}

export default function CalendarPage() {
  return <CalendarPanel />
}
