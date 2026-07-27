import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { ROUTES } from './routes';

// The whole site's route table lives in src/routes.tsx. Adding a new chapter
// or tool means: 1) build the component, 2) add one entry to ROUTES there.
// It shows up in the sidebar, the home page, and prev/next automatically.
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Home />} />
          {ROUTES.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
