import React, { useState, useEffect } from 'react';
import { useCRM } from '../store';
import { PRODUCT_CATEGORIES, ProductCategory, Target, User } from '../types';
import { formatIDR } from '../utils';
import { Target as TargetIcon, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Targets() {
  const { users, targets, updateTarget, currentUser } = useCRM();

  // Filter only Sales roles. If Manager, return only their team members.
  const salesUsers = users.filter((u) => {
    if (u.role !== 'Sales') return false;
    if (currentUser.role === 'Manager') {
      return u.managerId === currentUser.id;
    }
    return true; // For GM, show all Sales
  });
  
  const [selectedSalesId, setSelectedSalesId] = useState<string>(salesUsers[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  
  // Track form values as strings to prevent editing lag
  const [formTargets, setFormTargets] = useState<Record<ProductCategory, string>>({
    'Mobil Short Term': '0',
    'Bis Short Term': '0',
    'E-Voucher': '0',
    'Mobil Long Term': '0',
    'Bis Long Term': '0',
    'Supir': '0',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync selectedSalesId if salesUsers changes
  useEffect(() => {
    if (salesUsers.length > 0 && !salesUsers.find((u) => u.id === selectedSalesId)) {
      setSelectedSalesId(salesUsers[0].id);
    } else if (salesUsers.length === 0) {
      setSelectedSalesId('');
    }
  }, [salesUsers, selectedSalesId]);

  // Load target for selected sales user and month
  useEffect(() => {
    const currentTarget = targets.find(
      (t) => t.userId === selectedSalesId && t.month === selectedMonth
    );

    if (currentTarget) {
      const newFormTargets = { ...formTargets };
      PRODUCT_CATEGORIES.forEach((cat) => {
        newFormTargets[cat] = String(currentTarget.productTargets[cat] || 0);
      });
      setFormTargets(newFormTargets);
    } else {
      // Empty targets if none found
      const newFormTargets = { ...formTargets };
      PRODUCT_CATEGORIES.forEach((cat) => {
        newFormTargets[cat] = '0';
      });
      setFormTargets(newFormTargets);
    }
  }, [selectedSalesId, selectedMonth, targets]);

  const handleInputChange = (category: ProductCategory, value: string) => {
    // Only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    setFormTargets((prev) => ({
      ...prev,
      [category]: cleanValue || '0',
    }));
  };

  const handleSave = () => {
    if (!selectedSalesId) {
      setNotification({ type: 'error', message: 'Silakan pilih Sales Representative terlebih dahulu.' });
      return;
    }

    const numericalTargets = {} as Record<ProductCategory, number>;
    PRODUCT_CATEGORIES.forEach((cat) => {
      numericalTargets[cat] = parseInt(formTargets[cat], 10) || 0;
    });

    const existingTargetIndex = targets.find(
      (t) => t.userId === selectedSalesId && t.month === selectedMonth
    );

    const newTarget: Target = {
      id: existingTargetIndex?.id || `t_${selectedSalesId}_${selectedMonth}_${Date.now()}`,
      userId: selectedSalesId,
      month: selectedMonth,
      productTargets: numericalTargets,
    };

    updateTarget(newTarget);
    setNotification({
      type: 'success',
      message: `Berhasil memperbarui target KPI untuk ${users.find((u) => u.id === selectedSalesId)?.name}`,
    });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleQuickPreset = (amount: number) => {
    const newFormTargets = { ...formTargets };
    PRODUCT_CATEGORIES.forEach((cat) => {
      newFormTargets[cat] = String(amount);
    });
    setFormTargets(newFormTargets);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Set Sales Targets (KPI)</h1>
        <p className="text-slate-400">
          Management panel to establish target KPIs.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection & Settings */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col space-y-5">
          <h3 className="font-bold text-white text-base">Configuration</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Select Sales Representative
            </label>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#161d2e] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              value={selectedSalesId}
              onChange={(e) => setSelectedSalesId(e.target.value)}
            >
              {salesUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Target Month
            </label>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#161d2e] px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="2026-06">Juni 2026</option>
              <option value="2026-07">Juli 2026</option>
              <option value="2025-08">Agustus 2026</option>
            </select>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickPreset(50000000)}
                className="px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 rounded-lg transition"
              >
                Rp 50 Juta All
              </button>
              <button
                onClick={() => handleQuickPreset(150000000)}
                className="px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 rounded-lg transition"
              >
                Rp 150 Juta All
              </button>
              <button
                onClick={() => handleQuickPreset(300000000)}
                className="px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 rounded-lg transition"
              >
                Rp 300 Juta All
              </button>
              <button
                onClick={() => handleQuickPreset(500000000)}
                className="px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 rounded-lg transition"
              >
                Rp 500 Juta All
              </button>
            </div>
          </div>
        </div>

        {/* Target Inputs for 6 Products */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-6">Target Nominal per Produk (Rupiah)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCT_CATEGORIES.map((cat) => (
                <div key={cat} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {cat}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-mono text-slate-400">Rp</span>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-white/10 bg-[#161d2e] pl-10 pr-4 py-2 text-sm font-mono font-bold text-white outline-none focus:border-indigo-500"
                      value={formTargets[cat]}
                      onChange={(e) => handleInputChange(cat, e.target.value)}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-indigo-300 font-mono">
                    Formatted: {formatIDR(parseInt(formTargets[cat], 10) || 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Total Keseluruhan Target</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{formatIDR(PRODUCT_CATEGORIES.reduce((acc, cat) => acc + (parseInt(formTargets[cat], 10) || 0), 0))}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400 italic">
                * Perubahan target akan langsung diakumulasikan ke performa dashboard.
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition"
              >
                <Save className="w-4 h-4" /> Simpan Target
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
