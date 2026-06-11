import React, { useMemo, useState } from 'react';
import { useCRM } from '../store';
import { formatIDR } from '../utils';
import { PRODUCT_CATEGORIES, ProductCategory, User } from '../types';
import { ChevronLeft, TrendingUp, Target, Briefcase, Award, Zap, Car, BarChart3, PieChart, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend } from 'recharts';

export default function Dashboard() {
  const { currentUser, deals, targets, users, units } = useCRM();

  // Calculations Helper
  const calculateMetrics = (salesIds: string[]) => {
    let totalTarget = 0;
    let totalActual = 0;
    const productMetrics = PRODUCT_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = { target: 0, actual: 0 };
      return acc;
    }, {} as Record<ProductCategory, { target: number; actual: number }>);

    targets.forEach(t => {
      if (salesIds.includes(t.userId)) {
        PRODUCT_CATEGORIES.forEach(cat => {
          productMetrics[cat].target += t.productTargets[cat] || 0;
          totalTarget += t.productTargets[cat] || 0;
        });
      }
    });

    let activeDealsCount = 0;
    let activePipelineValue = 0;
    let wonDealsCount = 0;
    let lostDealsCount = 0;

    deals.forEach(d => {
      if (salesIds.includes(d.salesId)) {
        if (d.stage === 'Won') {
          const val = d.actualValue || 0;
          const prods = d.products || [];
          let totalEst = prods.reduce((acc, p) => acc + (p.estimatedValue * (p.quantity || 1)), 0);
          if (totalEst === 0) totalEst = 1; // prevent div by zero
          prods.forEach(p => {
             if (productMetrics[p.category]) {
               const proportion = (p.estimatedValue * (p.quantity || 1)) / totalEst;
               productMetrics[p.category].actual += Math.round(val * proportion);
             }
          });
          totalActual += val;
          wonDealsCount++;
        } else if (d.stage === 'Lost') {
          lostDealsCount++;
        } else {
          activeDealsCount++;
          activePipelineValue += (d.estimatedValue || 0);
        }
      }
    });

    const totalClosed = wonDealsCount + lostDealsCount;
    const winRate = totalClosed > 0 ? (wonDealsCount / totalClosed) * 100 : 0;

    return { 
      totalTarget, 
      totalActual, 
      productMetrics,
      activeDealsCount,
      activePipelineValue,
      winRate
    };
  };

  const allSalesIds = useMemo(() => users.filter(u => u.role === 'Sales').map(u => u.id), [users]);
  const myTeamIds = useMemo(() => users.filter(u => u.managerId === (currentUser.role === 'Manager' ? currentUser.id : currentUser.managerId) && u.role === 'Sales').map(u => u.id), [users, currentUser]);
  const myIndividualIds = [currentUser.id];

  const visibleSalesIds = currentUser.role === 'GM' || currentUser.role === 'Manager' ? allSalesIds : myTeamIds;

  const metrics = useMemo(() => calculateMetrics(visibleSalesIds), [deals, targets, visibleSalesIds]);
  
  const personalMetrics = useMemo(() => {
    if (currentUser.role === 'Sales') return calculateMetrics(myIndividualIds);
    if (currentUser.role === 'Manager') return calculateMetrics(myTeamIds);
    return null;
  }, [deals, targets, currentUser, myTeamIds]);

  const globalProgress = metrics.totalTarget > 0 ? (metrics.totalActual / metrics.totalTarget) * 100 : 0;

  // Leaderboard Logic
  const leaderboard = useMemo(() => {
    const scores: Record<string, { user: User; revenue: number }> = {};
    users.filter(u => u.role === 'Sales').forEach(u => {
      if (visibleSalesIds.includes(u.id)) {
        scores[u.id] = { user: u, revenue: 0 };
      }
    });

    deals.forEach(d => {
      if (d.stage === 'Won' && scores[d.salesId]) {
        scores[d.salesId].revenue += (d.actualValue || 0);
      }
    });

    return Object.values(scores).sort((a, b) => b.revenue - a.revenue);
  }, [deals, users, visibleSalesIds]);

  const managerLeaderboard = useMemo(() => {
    const managers: Record<string, { user: User; revenue: number; reps: { user: User; revenue: number }[] }> = {};
    
    users.filter(u => u.role === 'Manager').forEach(u => {
      managers[u.id] = { user: u, revenue: 0, reps: [] };
    });

    const reps: Record<string, { user: User; revenue: number; managerId?: string }> = {};
    users.filter(u => u.role === 'Sales').forEach(u => {
      if (visibleSalesIds.includes(u.id)) {
        reps[u.id] = { user: u, revenue: 0, managerId: u.managerId };
      }
    });

    deals.forEach(d => {
      if (d.stage === 'Won' && reps[d.salesId]) {
        reps[d.salesId].revenue += (d.actualValue || 0);
      }
    });

    Object.values(reps).forEach(rep => {
      if (rep.managerId && managers[rep.managerId]) {
        managers[rep.managerId].reps.push(rep);
        managers[rep.managerId].revenue += rep.revenue;
      }
    });

    Object.values(managers).forEach(m => {
      m.reps.sort((a, b) => b.revenue - a.revenue);
    });

    return Object.values(managers)
      .filter(m => m.reps.length > 0)
      .sort((a, b) => b.revenue - a.revenue);

  }, [deals, users, visibleSalesIds]);

  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

  const getRankStyle = (idx: number) => {
    if (idx === 0) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (idx === 1) return 'bg-slate-300/20 text-slate-300 border-slate-300/30';
    if (idx === 2) return 'bg-amber-700/20 text-amber-600 border-amber-700/30';
    return 'bg-slate-800 text-slate-400 border-white/5';
  };

  const fleetMetrics = useMemo(() => {
    if (!units || units.length === 0) return { total: 0, active: 0, utilization: 0 };
    const active = units.filter(u => u.status === 'Rent Out').length;
    const utilization = (active / units.length) * 100;
    return { total: units.length, active, utilization };
  }, [units]);

  const productChartData = useMemo(() => {
    return PRODUCT_CATEGORIES.map(cat => ({
      name: cat,
      target: metrics.productMetrics[cat].target,
      actual: metrics.productMetrics[cat].actual,
      progress: metrics.productMetrics[cat].target > 0 
                ? (metrics.productMetrics[cat].actual / metrics.productMetrics[cat].target) * 100 
                : 0
    }));
  }, [metrics]);

  const pipelineChartData = useMemo(() => {
    let prospecting = 0, negotiation = 0;
    deals.forEach(d => {
      if (visibleSalesIds.includes(d.salesId)) {
        if (d.stage === 'Prospecting') prospecting++;
        if (d.stage === 'Negotiation') negotiation++;
      }
    });
    return [
      { name: 'Prospecting', value: prospecting, color: '#3b82f6' }, // blue
      { name: 'Negotiation', value: negotiation, color: '#f59e0b' }, // amber
      { name: 'Won', value: metrics.totalActual > 0 ? deals.filter(d => visibleSalesIds.includes(d.salesId) && d.stage === 'Won').length : 0, color: '#10b981' }, // emerald
      { name: 'Lost', value: deals.filter(d => visibleSalesIds.includes(d.salesId) && d.stage === 'Lost').length, color: '#ef4444' }, // red
    ].filter(d => d.value > 0);
  }, [deals, visibleSalesIds, metrics.totalActual]);

  const salesPerformanceData = useMemo(() => {
    const performance: Record<string, { name: string, totalWon: number }> = {};
    users.filter(u => u.role === 'Sales').forEach(user => {
      performance[user.id] = { name: user.name, totalWon: 0 };
    });
    
    deals.forEach(deal => {
      if (deal.stage === 'Won' && performance[deal.salesId]) {
        performance[deal.salesId].totalWon += (deal.actualValue || deal.estimatedValue || 0);
      }
    });
    
    return Object.values(performance)
      .filter(p => p.totalWon > 0)
      .sort((a, b) => b.totalWon - a.totalWon)
      .slice(0, 5);
  }, [deals, users]);

  const fleetStatusData = useMemo(() => {
    const statuses = { 'Available': 0, 'Rent Out': 0, 'In Maintenance': 0 };
    let hasData = false;
    units.forEach(unit => {
        if (statuses[unit.status as keyof typeof statuses] !== undefined) {
             statuses[unit.status as keyof typeof statuses]++;
             hasData = true;
        }
    });
    
    if (!hasData) return [];
    
    return [
      { name: 'Available', value: statuses['Available'], color: '#10b981' }, // emerald
      { name: 'Rent Out', value: statuses['Rent Out'], color: '#3b82f6' }, // blue
      { name: 'In Maintenance', value: statuses['In Maintenance'], color: '#f59e0b' }, // amber
    ];
  }, [units]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161d2e]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex gap-4 items-center">
              <span style={{ color: entry.color }} className="text-sm">{entry.name}:</span>
              <span className="text-white font-mono font-bold text-sm">{formatIDR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 flex flex-col h-full overflow-y-auto pb-8">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Performance Overview</h1>
        <p className="text-slate-400">
          Sales Performance Monitoring • <span className="text-indigo-400 font-medium">{currentUser.role === 'Sales' ? 'Team View' : 'Company Overview'}</span>
        </p>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Total Revenue Won</p>
            <p className="text-2xl font-mono font-bold text-white">{formatIDR(metrics.totalActual)}</p>
            <p className="text-xs text-emerald-200 mt-1">Acquired from closed won deals</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl border border-indigo-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Active Pipeline</p>
            <p className="text-2xl font-mono font-bold text-white">{formatIDR(metrics.activePipelineValue)}</p>
            <p className="text-xs text-indigo-200 mt-1">{metrics.activeDealsCount} deals currently active</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Briefcase className="h-6 w-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">Win Rate</p>
            <p className="text-2xl font-mono font-bold text-white">{metrics.winRate.toFixed(1)}%</p>
            <p className="text-xs text-amber-200 mt-1">Closing efficiency</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Fleet Utilization</p>
            <p className="text-2xl font-mono font-bold text-white">{fleetMetrics.utilization.toFixed(1)}%</p>
            <p className="text-xs text-blue-200 mt-1">{fleetMetrics.active} of {fleetMetrics.total} units rented out</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
            <Car className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress & Target */ }
        <div className="lg:col-span-2 space-y-6">
          
          <div className={`grid grid-cols-1 ${personalMetrics ? 'xl:grid-cols-2' : ''} gap-6`}>
            {/* Personal/Team Target Progress */}
            {personalMetrics && (
              <div className="rounded-3xl border border-emerald-500/10 bg-emerald-900/10 backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Target className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {currentUser.role === 'Sales' ? 'My Individual Trajectory' : 'My Team Trajectory'}
                      </h3>
                      <p className="text-xs text-emerald-400/70 font-medium">Tracking towards {formatIDR(personalMetrics.totalTarget)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-end justify-between mb-3 gap-2">
                    <div className="text-3xl 2xl:text-4xl font-mono font-bold tracking-tight text-white flex flex-wrap items-baseline gap-2">
                      {formatIDR(personalMetrics.totalActual)} 
                      <span className="text-sm 2xl:text-lg text-emerald-500/70 font-medium">/ {formatIDR(personalMetrics.totalTarget)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
                        {personalMetrics.totalTarget > 0 ? ((personalMetrics.totalActual / personalMetrics.totalTarget) * 100).toFixed(1) : '0.0'}%
                      </div>
                    </div>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner mt-4">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out relative"
                      style={{ width: `${Math.min(personalMetrics.totalTarget > 0 ? (personalMetrics.totalActual / personalMetrics.totalTarget) * 100 : 0, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Target Progress */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {currentUser.role === 'Sales' ? 'Team Trajectory' : 'Company Trajectory'}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Tracking towards {formatIDR(metrics.totalTarget)}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-end justify-between mb-3 gap-2">
                  <div className="text-3xl 2xl:text-4xl font-mono font-bold tracking-tight text-white flex flex-wrap items-baseline gap-2">
                    {formatIDR(metrics.totalActual)} 
                    <span className="text-sm 2xl:text-lg text-slate-500 font-medium">/ {formatIDR(metrics.totalTarget)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
                      {globalProgress.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(globalProgress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCT_CATEGORIES.map(cat => {
                const actual = metrics.productMetrics[cat].actual;
                const target = metrics.productMetrics[cat].target;
                const progress = target > 0 ? (actual / target) * 100 : 0;
                
                const barColor = progress >= 100 ? 'bg-emerald-500' : progress >= 75 ? 'bg-indigo-500' : progress >= 50 ? 'bg-amber-500' : 'bg-rose-500';
                const statusColor = progress >= 100 ? 'text-emerald-400' : progress >= 75 ? 'text-indigo-400' : progress >= 50 ? 'text-amber-400' : 'text-rose-400';
                
                return (
                  <div key={cat} className="p-5 bg-[#161d2e] border border-white/5 hover:border-white/10 transition-colors rounded-2xl group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm font-bold text-slate-300">{cat}</div>
                      <div className={`text-xs font-black ${statusColor} bg-white/5 px-2 py-0.5 rounded-full`}>
                        {progress.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-xl font-mono font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{formatIDR(actual)}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-4">Target: {formatIDR(target)}</div>
                    
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-700 delay-100`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="rounded-3xl border border-white/10 bg-[#161d2e] p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-lg">Top Performers</h3>
              </div>
              {(currentUser.role === 'GM' || currentUser.role === 'Manager') && selectedManagerId && (
                <button 
                  onClick={() => setSelectedManagerId(null)} 
                  className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors bg-indigo-500/10 px-2 py-1 rounded-md"
                >
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              )}
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {currentUser.role === 'Sales' ? (
                // Standard Sales Rep Leaderboard view for Sales Role
                leaderboard.length > 0 ? leaderboard.map((item, idx) => (
                  <div key={item.user.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs border ${getRankStyle(idx)}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-white">{item.user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-emerald-400">{formatIDR(item.revenue)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-sm text-slate-500 py-8 border border-dashed border-white/10 rounded-2xl">No data available</div>
                )
              ) : selectedManagerId ? (
                // Selected Manager's Reps Leaderboard View
                managerLeaderboard.find(m => m.user.id === selectedManagerId)?.reps.map((item, idx) => (
                  <div key={item.user.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs border ${getRankStyle(idx)}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-white">{item.user.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-emerald-400">{formatIDR(item.revenue)}</p>
                    </div>
                  </div>
                )) || <div className="text-center text-sm text-slate-500 py-8 border border-dashed border-white/10 rounded-2xl">No data available</div>
              ) : (
                // Managers Leaderboard View
                managerLeaderboard.length > 0 ? managerLeaderboard.map((item, idx) => (
                  <div 
                    key={item.user.id} 
                    onClick={() => setSelectedManagerId(item.user.id)}
                    className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 cursor-pointer hover:border-indigo-500/50 hover:bg-white/10 transition group"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs border ${getRankStyle(idx)}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{item.user.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.reps.length} Reps</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-emerald-400">{formatIDR(item.revenue)}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-sm text-slate-500 py-8 border border-dashed border-white/10 rounded-2xl">No data available</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics - Charts */}
      {(currentUser.role === 'GM' || currentUser.role === 'Manager') && (
        <div className="flex flex-col gap-6 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Product Chart */}
            <div className="rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-6">
                   <BarChart3 className="w-5 h-5 text-indigo-400" />
                   <h3 className="font-bold text-white text-lg">Revenue vs Target by Category</h3>
                 </div>
                 
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={productChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: '#94a3b8', fontSize: 12 }}
                         dy={10}
                       />
                       <YAxis 
                         hide 
                       />
                       <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                       <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                       <Bar dataKey="target" name="Target" fill="#334155" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="actual" name="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </div>

            {/* Pipeline Stage Distribution */}
            <div className="rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-6">
                   <PieChart className="w-5 h-5 text-emerald-400" />
                   <h3 className="font-bold text-white text-lg">Pipeline Distribution (Volume)</h3>
                 </div>
                 
                 <div className="h-64 w-full flex items-center justify-center">
                   {pipelineChartData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                       <RePieChart>
                         <Pie
                           data={pipelineChartData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                           stroke="none"
                         >
                           {pipelineChartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend wrapperStyle={{ fontSize: '12px' }} />
                       </RePieChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="text-slate-500 text-sm">No active pipeline data available</div>
                   )}
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Performance Leaderboard */}
            <div className="rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-6">
                   <Users className="w-5 h-5 text-amber-400" />
                   <h3 className="font-bold text-white text-lg">Top Sales Performance (Won Deals)</h3>
                 </div>
                 
                 <div className="h-64 w-full">
                   {salesPerformanceData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart layout="vertical" data={salesPerformanceData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                         <XAxis 
                           type="number" 
                           hide
                         />
                         <YAxis 
                           type="category" 
                           dataKey="name"
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fill: '#94a3b8', fontSize: 12 }}
                           width={80}
                         />
                         <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                         <Bar dataKey="totalWon" name="Total Revenue Won" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-full flex items-center justify-center text-slate-500 text-sm">No sales data recorded yet</div>
                   )}
                 </div>
               </div>
            </div>

            {/* Fleet Status Breakdown */}
            <div className="rounded-3xl border border-white/10 bg-[#161d2e] p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-6">
                   <Activity className="w-5 h-5 text-blue-400" />
                   <h3 className="font-bold text-white text-lg">Overall Fleet Status</h3>
                 </div>
                 
                 <div className="h-64 w-full flex items-center justify-center">
                   {fleetStatusData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                       <RePieChart>
                         <Pie
                           data={fleetStatusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={0}
                           outerRadius={85}
                           dataKey="value"
                           stroke="none"
                         >
                           {fleetStatusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend wrapperStyle={{ fontSize: '12px' }} />
                       </RePieChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="text-slate-500 text-sm">No fleet registered</div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

