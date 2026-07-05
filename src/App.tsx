import { useState } from 'react';
import { CRMProvider } from './store';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Clients from './components/Clients';
import Targets from './components/Targets';
import Units from './components/Units';
import Drivers from './components/Drivers';
import SalesPerformance from './components/SalesPerformance';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'clients' | 'targets' | 'units' | 'drivers' | 'sales-performance'>('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab as any}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'pipeline' && <Pipeline />}
      {activeTab === 'clients' && <Clients />}
      {activeTab === 'targets' && <Targets />}
      {activeTab === 'units' && <Units />}
      {activeTab === 'drivers' && <Drivers />}
      {activeTab === 'sales-performance' && <SalesPerformance />}
    </Layout>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}
