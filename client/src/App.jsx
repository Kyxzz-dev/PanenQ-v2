import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HarvestForm from './pages/HarvestForm';
import HarvestHistory from './pages/HarvestHistory';
import Locations from './pages/Locations';
import Harvesters from './pages/Harvesters';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/harvest" element={<HarvestForm />} />
      <Route path="/history" element={<HarvestHistory />} />
      <Route path="/locations" element={<Locations />} />
      <Route path="/harvesters" element={<Harvesters />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

