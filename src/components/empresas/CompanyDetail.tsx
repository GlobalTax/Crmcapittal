
import { useParams } from 'react-router-dom';
import CompanyPage from '@/pages/CompanyPage';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  console.log("🔗 CompanyDetail wrapper - ID:", id);
  
  return <CompanyPage />;
}
