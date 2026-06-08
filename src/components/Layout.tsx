import React, { useState, useEffect } from 'react';
import { useCRM } from '../store';
import { LayoutDashboard, ListTodo, Users, Target as TargetIcon, Menu, X, Building2, ChevronDown, ChevronRight, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'pipeline' | 'clients' | 'targets';
  setActiveTab: (tab: 'dashboard' | 'pipeline' | 'clients' | 'targets') => void;
}

const RoleSelector = ({ users, currentUser, setCurrentUser }: { users: any[], currentUser: any, setCurrentUser: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  const toggleTeam = (managerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTeams((prev) => 
      prev.includes(managerId) ? prev.filter((id) => id !== managerId) : [...prev, managerId]
    );
  };

  const handleSelect = (user: any) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  const gms = users.filter((u) => u.role === 'GM');
  const managers = users.filter((u) => u.role === 'Manager');
  const otherSales = users.filter((u) => u.role === 'Sales' && !users.some((m) => m.id === u.managerId));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-[#161d2e] px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:border-indigo-500/50 transition-colors focus:border-indigo-500 outline-none"
      >
        <div className="flex items-center gap-2 truncate">
          <UserIcon className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="truncate">{currentUser.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 z-50 mt-2 w-full max-h-[350px] overflow-y-auto rounded-xl border border-white/10 bg-[#161d2e] shadow-2xl py-2 custom-scrollbar">
            
            {/* GM Section */}
            {gms.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">General Management</div>
                {gms.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${currentUser.id === u.id ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'}`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}

            {/* Managers Section */}
            {managers.length > 0 && (
              <div className="mb-2 border-t border-white/5 pt-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Teams</div>
                {managers.map((manager) => {
                  const team = users.filter((u) => u.role === 'Sales' && u.managerId === manager.id);
                  const isExpanded = expandedTeams.includes(manager.id);
                  return (
                    <div key={manager.id} className="flex flex-col">
                      <div className="flex items-center group relative">
                         {team.length > 0 ? (
                           <button
                             onClick={(e) => toggleTeam(manager.id, e)}
                             className="absolute left-0 p-2 text-slate-400 hover:text-white z-10 h-full flex items-center justify-center w-8"
                           >
                             {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                           </button>
                         ) : (
                           <div className="w-8"></div>
                         )}
                         <button
                           onClick={() => handleSelect(manager)}
                           className={`w-full text-left py-2 pr-4 ${team.length > 0 ? 'pl-8' : 'pl-4'} text-sm transition-colors hover:bg-white/5 ${currentUser.id === manager.id ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'}`}
                         >
                           {manager.name}
                         </button>
                      </div>
                      
                      {isExpanded && team.length > 0 && (
                        <div className="ml-4 border-l border-white/10 flex flex-col py-1">
                          {team.map((rep) => (
                            <button
                              key={rep.id}
                              onClick={() => handleSelect(rep)}
                              className={`flex items-center w-full text-left py-1.5 text-sm transition-colors hover:bg-white/5 ${currentUser.id === rep.id ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-400'}`}
                            >
                               <span className="w-4 h-px bg-white/10 inline-block mr-2 ml-[-1px]"></span>
                               <span className="truncate">{rep.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Other Sales Section */}
            {otherSales.length > 0 && (
              <div className="border-t border-white/5 pt-2">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Other Sales</div>
                {otherSales.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${currentUser.id === u.id ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'text-slate-300'}`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { currentUser, setCurrentUser, users } = useCRM();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser.role !== 'GM' && activeTab === 'targets') {
      setActiveTab('dashboard');
    }
  }, [currentUser.role, activeTab, setActiveTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline', icon: ListTodo },
    { id: 'clients', label: 'Clients', icon: Building2 },
  ];

  // Only allow General Manager (GM) to configure targets
  if (currentUser.role === 'GM') {
    navItems.push({ id: 'targets', label: 'Set KPI Targets', icon: TargetIcon });
  }

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 overflow-hidden font-sans select-none relative">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[150px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-900 rounded-full blur-[100px]"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-white/5 bg-white/5 backdrop-blur-xl md:flex z-10">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <TargetIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">BLUE<span className="text-blue-400">CRM</span></span>
        </div>
        
        <div className="p-4 border-b border-white/5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Role Simulator
          </label>
          <RoleSelector users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 border border-white/20 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shadow-inner">
               {currentUser.name.charAt(0)}
             </div>
             <div className="flex flex-col">
               <span className="text-xs font-bold text-white uppercase">{currentUser.name}</span>
               <span className="text-[11px] text-slate-400">{currentUser.role}</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex w-full flex-1 flex-col overflow-hidden z-10">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0f172a] px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
               <TargetIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">BLUE<span className="text-blue-400">CRM</span></span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
            {isMobileMenuOpen ? <X className="h-6 w-6 text-slate-300" /> : <Menu className="h-6 w-6 text-slate-300" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 border-b border-white/5 bg-[#161d2e] p-4 shadow-2xl md:hidden">
            <div className="mb-2 text-xs font-bold tracking-wider uppercase text-slate-500">
              Role Simulator
            </div>
            <div className="mb-4">
               <RoleSelector users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </div>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                    activeTab === item.id ? 'bg-white/10 text-white' : 'text-slate-400'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-transparent p-4 md:p-8">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
