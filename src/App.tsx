import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './components/ui/Toast';
import { useAuthStore } from './store/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;
