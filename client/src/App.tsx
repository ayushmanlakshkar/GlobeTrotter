import AddActivities from './pages/AddActivities';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import CreateTrip from './pages/CreateTrip';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth isSignUp={true} />} />
                <Route path="/trips/create" element={<CreateTrip />} />
                <Route path="/trips/:tripId/activities" element={<AddActivities />} />
      </Routes>
    </Router>
  );
}

export default App;
