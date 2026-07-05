import React, { useMemo, useState } from 'react';
import { useCRM } from '../store';
import { formatIDR } from '../utils';
import { PRODUCT_CATEGORIES, User } from '../types';
import { Target, TrendingUp, Users, Award, Briefcase, BarChart3, ChevronRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SalesPerformance() {
  const { users, deals, targets, currentUser } = useCRM();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManager, setSelectedManager] = useState('All');

  const salesUsers = useMemo(() => {
    const allSales = users.filter(u => u.role === 'Sales');
    if (currentUser.role === 'Sales') {
      return allSales.filter(u => u.managerId === currentUser.managerId);
    }
    if (currentUser.role === 'Manager') {
      return allSales.filter(u => u.managerId === currentUser.id);
    }
    return allSales;
  }, [users, currentUser]);

  // Compute metrics per user
  const salesMetrics = useMemo(() => {
    return salesUsers.map(user => {
      let totalTarget = 0;
      let totalActual = 0;
      let pipelineValue = 0;
      let wonDealsCount = 0;
      let activeDealsCount = 0;

      // Calculate Target
      const userTarget = targets.find(t => t.userId === user.id);
      if (userTarget) {
        PRODUCT_CATEGORIES.forEach(cat => {
          totalTarget += userTarget.productTargets[cat] || 0;
        });
      }

      // Calculate Actual and Pipeline
      deals.forEach(d => {
        if (d.salesId === user.id) {
          if (d.stage === 'Won') {
            totalActual += (d.actualValue || d.estimatedValue);
            wonDealsCount++;
          } else if (d.stage === 'Prospecting' || d.stage === 'Negotiation' || d.stage === 'Proposal' || d.stage === 'Call/Meeting') {
            pipelineValue += d.estimatedValue;
            activeDealsCount++;
          }
        }
      });

      const achievement = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
      const manager = users.find(u => u.id === user.managerId);
      const managerName = manager ? manager.name : 'Unknown';

      return {
        ...user,
        managerName,
        totalTarget,
        totalActual,
        pipelineValue,
        wonDealsCount,
        activeDealsCount,
        achievement
      };
    });
  }, [salesUsers, deals, targets, users]);

  const uniqueManagers = useMemo(() => {
    const managers = salesMetrics.map(sm => sm.managerName);
    return ['All', ...Array.from(new Set(managers.filter(m => m !== 'Unknown'))).sort()];
  }, [salesMetrics]);

  const filteredSalesMetrics = useMemo(() => {
    return salesMetrics.filter(sm => {
      const matchesSearch = sm.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesManager = selectedManager === 'All' || sm.managerName === selectedManager;
      return matchesSearch && matchesManager;
    });
  }, [salesMetrics, searchQuery, selectedManager]);

  const sortedSalesMetrics = useMemo(() => {
    let sortableItems = [...filteredSalesMetrics];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
        sortableItems.sort((a, b) => b.totalActual - a.totalActual); // default sort
    }
    return sortableItems;
  }, [filteredSalesMetrics, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 text-indigo-400" /> : <ArrowDown className="h-4 w-4 text-indigo-400" />;
  };

  // Redirect or show access denied if Pool (handled by Layout, but just in case)
  if (currentUser.role === 'Pool') {
    return <div className="p-8 text-center text-slate-400">Access Denied</div>;
  }

  return (
    <div className="space-y-8 flex flex-col h-full overflow-y-auto pb-8">
      <div className="shrink-0 flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
           <BarChart3 className="text-indigo-400 h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Sales Performance</h1>
          <p className="text-slate-400">Detailed overview of your sales team's achievements and pipeline.</p>
        </div>
      </div>

      {/* Sales Team Table */}
      <div className="rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
               <Users className="w-5 h-5 text-indigo-400" />
               <h3 className="font-bold text-white text-lg">Team Members Breakdown</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search sales name..."
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-500" />
                </div>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
                >
                  {uniqueManagers.map(manager => (
                    <option key={manager} value={manager} className="bg-slate-800 text-slate-200">
                      {manager === 'All' ? 'All Managers' : manager}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#1e293b]/50">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#1e293b] text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-2">
                      Sales Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('managerName')}>
                    <div className="flex items-center gap-2">
                      Sales Manager {getSortIcon('managerName')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('totalActual')}>
                    <div className="flex items-center gap-2">
                      Revenue Won {getSortIcon('totalActual')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('totalTarget')}>
                    <div className="flex items-center gap-2">
                      Target {getSortIcon('totalTarget')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('achievement')}>
                    <div className="flex items-center gap-2">
                      Achievement % {getSortIcon('achievement')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('pipelineValue')}>
                    <div className="flex items-center gap-2">
                      Pipeline {getSortIcon('pipelineValue')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('activeDealsCount')}>
                    <div className="flex items-center gap-2 text-right justify-end">
                      Active Deals {getSortIcon('activeDealsCount')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 cursor-pointer hover:text-white transition-colors whitespace-nowrap" onClick={() => requestSort('wonDealsCount')}>
                    <div className="flex items-center gap-2 text-right justify-end">
                      Won Deals {getSortIcon('wonDealsCount')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
              {sortedSalesMetrics.map((sales, idx) => (
                <tr key={sales.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="font-bold text-white mb-0.5">{sales.name}</div>
                     <div className="text-xs text-slate-500">{sales.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                     {sales.managerName}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400 whitespace-nowrap">{formatIDR(sales.totalActual)}</td>
                  <td className="px-6 py-4 font-mono whitespace-nowrap">{formatIDR(sales.totalTarget)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white w-12">{sales.achievement.toFixed(1)}%</span>
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, sales.achievement)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-blue-400 whitespace-nowrap">{formatIDR(sales.pipelineValue)}</td>
                  <td className="px-6 py-4 text-right font-mono whitespace-nowrap">{sales.activeDealsCount}</td>
                  <td className="px-6 py-4 text-right font-mono whitespace-nowrap">{sales.wonDealsCount}</td>
                </tr>
              ))}
              {sortedSalesMetrics.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 border-dashed border-t border-white/10">
                    No sales team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

    </div>
  );
}
