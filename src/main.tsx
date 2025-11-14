import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminPanel } from './components/AdminPanel';

function Router() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  return isAdmin ? <AdminPanel /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
