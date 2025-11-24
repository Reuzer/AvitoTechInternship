import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styles from './App.module.css';
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import clsx from 'clsx';
import AdsList from './pages/adsList/AdsList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
})

const Layout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <NavLink to='/list' className={styles.logo}>
              Avito Модерация
            </NavLink>
            <nav className={styles.navLinks}>
              <NavLink 
              to='/list'
              className={({isActive}) => clsx(styles.link, isActive && styles.activeLink)}
              >
                Объявления
              </NavLink>
              <NavLink 
              to='/stats'
              className={({isActive}) => clsx(styles.link, isActive && styles.activeLink)}
              >
                Статистика
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<Navigate to='/list' replace/>} />
            <Route path='list' element={<AdsList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;