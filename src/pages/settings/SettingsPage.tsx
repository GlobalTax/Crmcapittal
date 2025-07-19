
import { Navigate } from 'react-router-dom';

export default function SettingsPage() {
  // Redirect to profile by default
  return <Navigate to="/settings/profile" replace />;
}
