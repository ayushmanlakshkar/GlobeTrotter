import AddActivities from './pages/AddActivities';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import AdminDashboard from './pages/AdminDashboard';
import TripDetails from './pages/TripDetails';
import Calendar from './pages/Calendar';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import CombinedSearch from './pages/CombinedSearch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth isSignUp={true} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/search" element={<CombinedSearch />} />
        <Route path="/cities" element={<CitySearch />} />
        <Route path="/activities" element={<ActivitySearch />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="/trips/:tripId/activities" element={<AddActivities />} />
      </Routes>
    </Router>
  );
}

export default App;
