import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { RequireAuth } from './auth/RouteGuards'
import { I18nProvider } from './i18n/I18nContext'
import { Add } from './pages/Add'
import { Grammar } from './pages/Grammar'
import { History } from './pages/History'
import { Import } from './pages/Import'
import { Login } from './pages/Login'
import { Search } from './pages/Search'
import { Settings } from './pages/Settings'
import { Tabellen } from './pages/Tabellen'
import { WordDetail } from './pages/WordDetail'
import { WordsProvider } from './state/WordsContext'

function AuthedApp({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <>{children}</>
  return <WordsProvider>{children}</WordsProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <AuthedApp>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Search />} />
                  <Route path="/add" element={<Add />} />
                  <Route path="/word/:id" element={<WordDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/grammar" element={<Grammar />} />
                  <Route path="/import" element={<Import />} />
                  <Route path="/tabellen" element={<Tabellen />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </AuthedApp>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}
