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
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <Layout headerVariant="minimal">
            <Auth />
          </Layout>
        } />
        <Route path="/signup" element={
          <Layout headerVariant="minimal">
            <Auth isSignUp={true} />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout headerVariant="dashboard">
            <Dashboard />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout headerVariant="admin">
            <AdminDashboard />
          </Layout>
        } />
        <Route path="/calendar" element={
          <Layout headerVariant="dashboard">
            <Calendar />
          </Layout>
        } />
        <Route path="/search" element={
          <Layout headerVariant="dashboard">
            <CombinedSearch />
          </Layout>
        } />
        <Route path="/cities" element={
          <Layout headerVariant="dashboard">
            <CitySearch />
          </Layout>
        } />
        <Route path="/activities" element={
          <Layout headerVariant="dashboard">
            <ActivitySearch />
          </Layout>
        } />
        <Route path="/trips/create" element={
          <Layout headerVariant="dashboard" showBackButton={true} backButtonText="Back to Dashboard">
            <CreateTrip />
          </Layout>
        } />
        <Route path="/trips/:id" element={
          <Layout headerVariant="dashboard" showBackButton={true} backButtonText="Back to Dashboard">
            <TripDetails />
          </Layout>
        } />
        <Route path="/trips/:tripId/activities" element={
          <Layout headerVariant="dashboard" showBackButton={true} backButtonText="Back to Trip">
            <AddActivities />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
