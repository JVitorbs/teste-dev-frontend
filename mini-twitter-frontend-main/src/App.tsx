import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { TimelinePage } from "./pages/TimelinePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TimelinePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
