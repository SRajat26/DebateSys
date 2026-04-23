import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import OCDashboard from './dashboards/OCDashboard';
import TeamDashboard from './dashboards/TeamDashboard';
import AdjudicatorDashboard from './dashboards/AdjudicatorDashboard';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Common wrapper for standardizing layout if needed
  return (
    <div className="w-full">
      <Routes>
        <Route 
          path="/" 
          element={
            user.role === 'OC' ? <OCDashboard /> :
            user.role === 'Team' ? <TeamDashboard /> :
            user.role === 'Adjudicator' ? <AdjudicatorDashboard /> :
            <div>Role not recognized</div>
          } 
        />
        {/* We can add sub-routes here later like /dashboard/competitions */}
      </Routes>
    </div>
  );
};

export default DashboardRouter;
