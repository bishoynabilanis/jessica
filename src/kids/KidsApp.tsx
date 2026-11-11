import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { KidsShell } from '@/kids/KidsShell'
import { KidsHome } from '@/pages/KidsHome'
import { KidsLibrary } from '@/kids/KidsLibrary'
import { KidsPlay } from '@/kids/KidsPlay'
import { KidsCards } from '@/kids/KidsCards'
import { KidsMe } from '@/kids/KidsMe'
import { KidsSettings } from '@/kids/KidsSettings'
import { KidsLesson } from '@/kids/KidsLesson'
import { KidsMap } from '@/kids/KidsMap'
import { ParentZone } from '@/kids/ParentZone'
import { KidsLabs } from '@/kids/KidsLabs'
import { Reader } from '@/pages/Reader'

export function KidsApp() {
  return (
    <HashRouter>
      <Routes>
        <Route path="kids" element={<KidsShell />}>
          <Route index element={<KidsHome />} />
          <Route path="library" element={<KidsLibrary />} />
          <Route path="reader/:bookId" element={<Reader />} />
          <Route path="play" element={<KidsPlay />} />
          <Route path="lesson/:bookId" element={<KidsLesson />} />
          <Route path="map" element={<KidsMap />} />
          <Route path="labs" element={<KidsLabs />} />
          <Route path="cards" element={<KidsCards />} />
          <Route path="me" element={<KidsMe />} />
          <Route path="settings" element={<KidsSettings />} />
          <Route path="parent" element={<ParentZone />} />
          <Route path="*" element={<KidsHome />} />
        </Route>
        <Route path="*" element={<Navigate to="/kids" replace />} />
      </Routes>
    </HashRouter>
  )
}
