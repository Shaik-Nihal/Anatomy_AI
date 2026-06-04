import { Routes, Route } from "react-router-dom";

import Splash from "./pages/Splash/Splash";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import BodySelection from "./pages/BodySelection/BodySelection";
import OrganSelection from "./pages/OrganSelection/OrganSelection";
import ARViewer from "./pages/ARViewer/ARViewer";
import LearningProgress from "./pages/LearningProgress/LearningProgress";
import Quiz from "./pages/Quiz/Quiz";
import AITutor from "./pages/AITutor/AITutor";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/body-selection" element={<BodySelection />} />
      <Route path="/organ-selection" element={<OrganSelection />} />
      <Route path="/ar-viewer" element={<ARViewer />} />
      <Route
        path="/learning-progress"
        element={
          <ProtectedRoute>
            <LearningProgress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-tutor"
        element={
          <ProtectedRoute>
            <AITutor />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;