import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Applications from "./pages/Applications";
import Lobby from "./pages/Lobby";
import { DashboardProvider } from "./contexts/DashboardContext";

function App() {
  return (
    <Router>
      <DashboardProvider>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/applications" element={<Applications />} />
        </Routes>
      </DashboardProvider>
    </Router>
  );
}

export default App;