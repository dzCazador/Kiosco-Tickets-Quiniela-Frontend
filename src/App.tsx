import { useState } from 'react';
import type { UserRole } from './components/Login';
import Login from './components/Login';
import TicketForm from './components/TicketForm';
import TicketReport from './components/TicketReport';
import { LayoutDashboard, FilePlus, Ticket, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'report'>('form');
  const [role, setRole] = useState<UserRole | null>(null);

  const handleLogout = () => {
    setRole(null);
    setActiveTab('form');
  };

  if (!role) {
    return <Login onLogin={setRole} />;
  }

  const tabs = [
    { key: 'form' as const, label: 'Cargar Ticket', icon: FilePlus, allowed: role === 'kiosco' },
    { key: 'report' as const, label: 'Ver Reportes', icon: LayoutDashboard, allowed: true },
  ];

  const currentTab = tabs.find(t => t.key === activeTab && t.allowed) ? activeTab : 'report';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <header className="bg-blue-700 text-white shadow-md p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket size={32} />
            <h1 className="text-2xl font-bold tracking-tight">Quiniela - Control de Tickets</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{role === 'kiosco' ? 'Kiosco' : 'Agencia'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4">
        {/* Selector de Pestañas */}
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => tab.allowed && setActiveTab(tab.key)}
              disabled={!tab.allowed}
              className={`flex-1 py-4 flex justify-center items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white font-bold'
                  : tab.allowed
                  ? 'text-gray-500 hover:bg-gray-50'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <div className="transition-all duration-300">
          {currentTab === 'form' ? (
            <div className="animate-in fade-in duration-500">
              <TicketForm />
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <TicketReport role={role} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;