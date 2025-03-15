import AppLayout from './components/app-layout/app-layout';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import About from './pages/about/about';
import NotFound from './pages/not-found/not-found';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
