import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  Coins, 
  Wallet,
  X,
  PlusCircle,
  HelpCircle,
  ChevronRight,
  CreditCard,
  Beer,
  Receipt,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Save,
  ArrowRightLeft
} from 'lucide-react';
import { AccountType, Transaction } from '../types';

const MoneyLab: React.FC = () => {
  const { accounts, addAccount, setSelectedAccountId, setCurrentPage, transactions, addTransaction } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<'card_bills' | 'bar_sales' | 'bills_rec' | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    type: 'asset' as AccountType
  });

  const accountTypes: { id: AccountType; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    { 
      id: 'receivable', 
      label: 'Receivables', 
      icon: <ArrowDownLeft size={20} />, 
      color: 'text-emerald-600 bg-emerald-50',
      desc: 'Money others owe you (Pending receiving)'
    },
    { 
      id: 'income', 
      label: 'Income Accounts', 
      icon: <Coins size={20} />, 
      color: 'text-blue-600 bg-blue-50',
      desc: 'Revenue tracking accounts'
    },
    { 
      id: 'payable', 
      label: 'Payables', 
      icon: <ArrowUpRight size={20} />, 
      color: 'text-red-600 bg-red-50',
      desc: 'Money you owe (Pending payments)'
    },
    { 
      id: 'asset', 
      label: 'Asset Accounts', 
      icon: <Layers size={20} />, 
      color: 'text-purple-600 bg-purple-50',
      desc: 'Equipment, inventory, property'
    }
  ];

  const handleAccountClick = (id: string) => {
    setSelectedAccountId(id);
    setCurrentPage('ledger');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAccount({
      name: formData.name,
      balance: parseFloat(formData.balance) || 0,
      type: formData.type
    });
    setFormData({ name: '', balance: '', type: 'asset' });
    setIsModalOpen(false);
  };

  const groupedAccounts = accounts.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, typeof accounts>);

  // --- PORTAL CONFIG & LOGIC ---
  const portalButtons = [
    { id: 'card_bills', label: 'Card Bills', icon: <CreditCard size={18} />, color: 'text-purple-600', border: 'hover:border-purple-200' },
    { id: 'bar_sales', label: 'Bar Sales', icon: <Beer size={18} />, color: 'text-amber-600', border: 'hover:border-amber-200' },
    { id: 'bills_rec', label: 'Bills Received', icon: <Receipt size={18} />, color: 'text-cyan-600', border: 'hover:border-cyan-200' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Money Lab</h1>
          <p className="text-slate-500 font-medium">Manage your restaurant financial ecosystem</p>
        </div>
        
        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* New Portal Buttons */}
          {portalButtons.map(p => (
            <button 
              key={p.id}
              onClick={() => setActivePortal(p.id as any)}
              className={`flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 ${p.color} ${p.border} hover:shadow-md`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-8 bg-slate-300 mx-1 hidden sm:block"></div>

          {/* Original Setup Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
          >
            <PlusCircle size={20} />
            <span>Setup Account</span>
          </button>
        </div>
      </div>

      {/* Account Type Grid (Unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accountTypes.map((type) => {
          const count = accounts.filter(a => a.type === type.id).length;
          const total = accounts.filter(a => a.type === type.id).reduce((sum, a) => sum + a.balance, 0);
          
          return (
            <div key={type.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl mb-4 ${type.color}`}>
                {type.icon}
              </div>
              <h3 className="font-bold text-slate-900">{type.label}</h3>
              <p className="text-xs text-slate-400 mb-4">{type.desc}</p>
              <div className="mt-auto">
                <p className="text-lg font-bold text-slate-900">${total.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{count} Accounts</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Lists (Unchanged) */}
      <div className="space-y-10">
        {accountTypes.map((type) => (
          <div key={type.id + "_list"} className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
              <div className={`p-2 rounded-lg ${type.color}`}>
                {React.cloneElement(type.icon as React.ReactElement<any>, { size: 16 })}
              </div>
              <h2 className="text-lg font-bold text-slate-800">{type.label}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedAccounts[type.id]?.length > 0 ? (
                groupedAccounts[type.id].map((acc) => (
                  <div 
                    key={acc.id} 
                    onClick={() => handleAccountClick(acc.id)}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{acc.name}</p>
                      <p className="text-xs text-slate-400">Created {new Date(acc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-bold text-lg ${type.id === 'payable' ? 'text-red-500' : 'text-slate-900'}`}>
                        ${acc.balance.toLocaleString()}
                      </p>
                      <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 px-4 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                  <HelpCircle size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">No accounts in this category yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Portal Modals */}
      {activePortal && (
        <PortalContainer 
          type={activePortal} 
          onClose={() => setActivePortal(null)} 
          accounts={accounts}
          transactions={transactions}
          onSettle={addTransaction}
        />
      )}

      {/* Create Account Modal (Unchanged) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">New Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Main Sales"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-5 bg-slate-50 border-none rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Starting Balance</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={e => setFormData({...formData, balance: e.target.value})}
                    className="w-full h-12 pl-10 pr-5 bg-slate-50 border-none rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {accountTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.id})}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.type === type.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-slate-50 bg-slate-50 text-slate-500 grayscale'
                      }`}
                    >
                      {React.cloneElement(type.icon as React.ReactElement<any>, { size: 16 })}
                      <span className="text-xs font-bold whitespace-nowrap">{type.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-0.5 mt-4"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PORTAL IMPLEMENTATIONS
// ==========================================

const PortalContainer: React.FC<{ type: string; onClose: () => void; accounts: any[]; transactions: any[]; onSettle: any }> = (props) => {
  const titles = {
    card_bills: 'Card & Bank Settlements',
    bar_sales: 'Bar Sales Logic',
    bills_rec: 'Bills Receivable Center'
  };

  const colors = {
    card_bills: 'text-purple-600 bg-purple-50',
    bar_sales: 'text-amber-600 bg-amber-50',
    bills_rec: 'text-cyan-600 bg-cyan-50'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={props.onClose} />
      <div className="relative bg-white w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl p-0 overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start border-b border-slate-100">
          <div>
            <div className={`px-4 py-1.5 rounded-full w-fit mb-3 text-xs font-black uppercase tracking-widest ${(colors as any)[props.type]}`}>
              Portal Active
            </div>
            <h2 className="text-3xl font-black text-slate-900">{(titles as any)[props.type]}</h2>
            <p className="text-slate-500 font-medium mt-1">Manage pending transactions and settlements</p>
          </div>
          <button onClick={props.onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {props.type === 'card_bills' && <CardBillsPortal {...props} />}
          {props.type === 'bar_sales' && <BarSalesPortal {...props} />}
          {props.type === 'bills_rec' && <BillsRecPortal {...props} />}
        </div>
      </div>
    </div>
  );
};

// --- CARD BILLS PORTAL (Gross Settlement Logic) ---
const CardBillsPortal = ({ accounts, transactions, onSettle, onClose }: any) => {
  const [sourceId, setSourceId] = useState<string>('');
  const [destId, setDestId] = useState<string>('');
  const [expenseId, setExpenseId] = useState<string>('');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [receivedAmount, setReceivedAmount] = useState('');

  // Save/Load Settings
  useEffect(() => {
    const saved = localStorage.getItem('mozza_portal_card');
    if (saved) {
      const config = JSON.parse(saved);
      if (config.source) setSourceId(config.source);
      if (config.dest) setDestId(config.dest);
      if (config.expense) setExpenseId(config.expense);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('mozza_portal_card', JSON.stringify({ source: sourceId, dest: destId, expense: expenseId }));
  };

  const potentialSources = accounts.filter((a: any) => ['receivable', 'asset', 'bank'].includes(a.type));
  const potentialDests = accounts.filter((a: any) => ['bank', 'cash', 'asset'].includes(a.type));
  const potentialExpenses = accounts.filter((a: any) => ['payable', 'expense', 'income'].includes(a.type)); 

  const availableTx = useMemo(() => {
    if (!sourceId) return [];
    return transactions
      .filter((t: Transaction) => 
        t.accountId === sourceId && 
        t.amount > 0 &&
        t.shiftId // STRICTLY FILTER for Daily Ops Shifts
      )
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sourceId, transactions]);

  const toggleTx = (id: string) => {
    if (selectedTxIds.includes(id)) setSelectedTxIds(prev => prev.filter(x => x !== id));
    else setSelectedTxIds(prev => [...prev, id]);
  };

  const totalSelected = selectedTxIds.reduce((sum, id) => {
    const tx = availableTx.find((t: any) => t.id === id);
    return sum + (tx?.amount || 0);
  }, 0);

  const fee = totalSelected - (parseFloat(receivedAmount) || 0);
  const feePercent = totalSelected > 0 ? (fee / totalSelected) * 100 : 0;

  const handleSettle = async () => {
    if (!receivedAmount || !sourceId || !destId || !expenseId) return;
    saveSettings();
    const now = new Date().toISOString();

    // 1. Credit Source (Reduce Pending) - Full Amount
    await onSettle({
      description: `Settlement Batch: ${selectedTxIds.length} Txns`,
      amount: -totalSelected,
      category: 'Transfer',
      date: now,
      accountId: sourceId
    });

    // 2. Debit Destination - Full Gross Amount (To show full income in ledger)
    await onSettle({
      description: `Gross Settlement Received`,
      amount: totalSelected, 
      category: 'Settlement',
      date: now,
      accountId: destId
    });

    // 3. Credit Destination - Bank Fee Deduction (Money leaving bank)
    if (fee !== 0) {
       // This creates the "Expense made the amount" effect in the Bank Ledger
       // Entry 1: +$100 (Gross)
       // Entry 2: -$5 (Fee)
       await onSettle({
        description: `Bank Fee Deduction`,
        amount: -fee,
        category: 'Bank Fee',
        date: now,
        accountId: destId
      });

      // 4. Debit Expense Account (Record the Cost)
      // Note: addTransaction usually handles single account updates. 
      // Since we just reduced DestId, we need to Record the Expense in the Expense Account too?
      // Our `addTransaction` hook in AppContext usually updates the balance of the `accountId` passed.
      // So to increase the Expense Account balance (cost), we add positive or negative depending on account type.
      // Usually expenses are positive balance (Cost).
      await onSettle({
        description: `Settlement Fee Cost`,
        amount: fee, 
        category: 'Bank Fee',
        date: now,
        accountId: expenseId
      });
    }

    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 mb-3 text-slate-400">
           <SettingsIcon size={14} />
           <p className="text-xs font-black uppercase tracking-widest">Portal Configuration</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pending Source</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100" value={sourceId} onChange={e=>setSourceId(e.target.value)}>
                <option value="">Select Pending Account...</option>
                {potentialSources.map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Bank Destination</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100" value={destId} onChange={e=>setDestId(e.target.value)}>
                <option value="">Select Bank Account...</option>
                {potentialDests.map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fee Expense Account</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-100" value={expenseId} onChange={e=>setExpenseId(e.target.value)}>
                <option value="">Select Expense Ledger...</option>
                {potentialExpenses.map((a:any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Transaction List */}
        <div className="flex-1 space-y-3">
           <div className="flex justify-between items-end px-2">
             <h3 className="font-bold text-slate-700">Select Pending Transactions</h3>
             <span className="text-xs font-bold text-slate-400">{selectedTxIds.length} Selected</span>
           </div>
           <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden max-h-[400px] overflow-y-auto">
             {availableTx.length === 0 ? (
               <div className="p-12 text-center text-slate-400 text-sm font-medium">Select a source account to view pending shift items</div>
             ) : (
               availableTx.map((tx: any) => (
                 <div 
                    key={tx.id} 
                    onClick={() => toggleTx(tx.id)}
                    className={`p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors ${selectedTxIds.includes(tx.id) ? 'bg-purple-50/50' : ''}`}
                 >
                   <div>
                     <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                     <div className="flex gap-2 mt-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{new Date(tx.date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">{tx.category}</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="font-black text-slate-700 text-lg">${tx.amount.toLocaleString()}</span>
                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedTxIds.includes(tx.id) ? 'border-purple-500 bg-purple-500' : 'border-slate-300'}`}>
                       {selectedTxIds.includes(tx.id) && <CheckCircle2 size={14} className="text-white" />}
                     </div>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Calculator Panel */}
        <div className="w-full lg:w-96 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl h-fit">
          <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
            <Calculator className="text-purple-500" />
            Settlement Calc
          </h3>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending Total</span>
              <span className="text-2xl font-black text-slate-900">${totalSelected.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Actual Amount Received</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" 
                  className="w-full h-14 pl-10 pr-4 bg-slate-50 rounded-2xl font-black text-xl border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none transition-all"
                  placeholder="0.00"
                  value={receivedAmount}
                  onChange={e => setReceivedAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-500">Bank Fee (Calc)</span>
                 <span className={`font-black ${fee > 0 ? 'text-red-500' : 'text-slate-900'}`}>${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="font-bold text-slate-500">Fee Percentage</span>
                 <span className="font-bold text-slate-900">{feePercent.toFixed(2)}%</span>
              </div>
            </div>

            <button 
              disabled={!receivedAmount || totalSelected === 0 || !sourceId || !destId || !expenseId}
              onClick={handleSettle}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              CONFIRM & SETTLE
            </button>
            
            {(!sourceId || !destId || !expenseId) && (
              <p className="text-[10px] text-center text-red-400 font-bold uppercase">Configure all accounts above to proceed</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- BAR SALES PORTAL (Distribution Logic) ---
const BarSalesPortal = ({ accounts, transactions, onSettle, onClose }: any) => {
  const [settings, setSettings] = useState({
    sourceId: '',
    primaryDestId: '', // Changed to Primary Receiving Account
    cardDestId: '',
    svcId: '',
    drinksId: ''
  });
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Split State
  const [splits, setSplits] = useState({ card: '', svc: '', drinks: '' });

  useEffect(() => {
    const saved = localStorage.getItem('mozza_portal_bar');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const saveSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem('mozza_portal_bar', JSON.stringify(newSettings));
  };

  const potentialSources = accounts.filter((a: any) => ['receivable', 'asset'].includes(a.type));
  const potentialDests = accounts.filter((a: any) => ['cash', 'bank', 'asset'].includes(a.type));
  const potentialExpenses = accounts.filter((a: any) => ['expense', 'payable'].includes(a.type));

  const availableTx = useMemo(() => {
    if (!settings.sourceId) return [];
    return transactions
      .filter((t: Transaction) => 
        t.accountId === settings.sourceId && 
        t.amount > 0 &&
        t.shiftId // STRICTLY FILTER for Daily Ops Shifts
      )
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [settings.sourceId, transactions]);

  // Calc Remaining Cash
  const totalDeductions = (parseFloat(splits.card)||0) + (parseFloat(splits.svc)||0) + (parseFloat(splits.drinks)||0);
  const remainingCash = selectedTx ? (selectedTx.amount - totalDeductions) : 0;
  const isBalanced = remainingCash >= 0;

  const handleSettle = async () => {
    if (!selectedTx || !isBalanced || !settings.primaryDestId) return;
    const now = new Date().toISOString();

    // 1. Credit Pending Source (Full Amount)
    await onSettle({
      description: `Bar Settle: ${selectedTx.description}`,
      amount: -selectedTx.amount,
      category: 'Transfer',
      date: now,
      accountId: settings.sourceId
    });

    // 2. Debit Primary Destination (Full Amount) - "Full amount is coming to that account"
    await onSettle({
      description: `Bar Sales (Gross): ${selectedTx.description}`,
      amount: selectedTx.amount,
      category: 'Revenue',
      date: now,
      accountId: settings.primaryDestId
    });

    // 3. Distribute (Deduct from Primary)
    
    // Distribute Card Portion
    if (parseFloat(splits.card) > 0) {
      await onSettle({
        description: `Bar Card Transfer`,
        amount: -parseFloat(splits.card), // Remove from Primary
        category: 'Transfer',
        date: now,
        accountId: settings.primaryDestId
      });
      await onSettle({
        description: `Bar Card Receipt`,
        amount: parseFloat(splits.card), // Add to Card Account
        category: 'Transfer',
        date: now,
        accountId: settings.cardDestId
      });
    }

    // Distribute Service Charge
    if (parseFloat(splits.svc) > 0) {
      await onSettle({
        description: `Bar Svc Charge Ded.`,
        amount: -parseFloat(splits.svc), // Remove from Primary
        category: 'Expense',
        date: now,
        accountId: settings.primaryDestId
      });
      await onSettle({
        description: `Bar Svc Charge Cost`,
        amount: parseFloat(splits.svc), // Add to Expense
        category: 'Expense',
        date: now,
        accountId: settings.svcId
      });
    }

    // Distribute Drinks
    if (parseFloat(splits.drinks) > 0) {
      await onSettle({
        description: `Bar Drinks Ded.`,
        amount: -parseFloat(splits.drinks), // Remove from Primary
        category: 'Cost of Goods',
        date: now,
        accountId: settings.primaryDestId
      });
      await onSettle({
        description: `Bar Drinks Cost`,
        amount: parseFloat(splits.drinks), // Add to Expense
        category: 'Cost of Goods',
        date: now,
        accountId: settings.drinksId
      });
    }

    setSelectedTx(null);
    setSplits({ card: '', svc: '', drinks: '' });
  };

  return (
    <div className="space-y-6">
       {/* Config Bar */}
       <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 mb-3 text-slate-400">
           <SettingsIcon size={14} />
           <p className="text-xs font-black uppercase tracking-widest">Bar Portal Configuration</p>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Pending Source', val: settings.sourceId, key: 'sourceId', opts: potentialSources },
              { label: 'Primary Dest (Cash)', val: settings.primaryDestId, key: 'primaryDestId', opts: potentialDests },
              { label: 'Card Dest', val: settings.cardDestId, key: 'cardDestId', opts: potentialDests },
              { label: 'Svc Charge Exp', val: settings.svcId, key: 'svcId', opts: potentialExpenses },
              { label: 'Drinks Cost Exp', val: settings.drinksId, key: 'drinksId', opts: potentialExpenses },
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 truncate">{field.label}</label>
                <select 
                  className="w-full p-2 bg-slate-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-amber-200"
                  value={field.val}
                  onChange={e => saveSettings({ ...settings, [field.key]: e.target.value })}
                >
                  <option value="">Select...</option>
                  {field.opts.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            ))}
         </div>
       </div>

       <div className="flex flex-col lg:flex-row gap-6">
          {/* List */}
          <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 p-2 max-h-[400px] overflow-y-auto">
             {availableTx.length === 0 && <div className="p-8 text-center text-slate-400 text-xs">No pending shift transactions found</div>}
             {availableTx.map((tx: any) => (
                <div 
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`p-4 m-2 rounded-2xl cursor-pointer transition-all border flex justify-between items-center ${
                    selectedTx?.id === tx.id 
                    ? 'bg-amber-50 border-amber-300 shadow-md transform scale-[1.01]' 
                    : 'bg-white border-slate-100 hover:border-amber-100'
                  }`}
                >
                  <div>
                     <p className="font-bold text-slate-700 text-sm">{tx.description}</p>
                     <p className="text-[10px] text-slate-400 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-black text-slate-900 text-lg">${tx.amount.toLocaleString()}</span>
                </div>
             ))}
          </div>

          {/* Action Panel */}
          <div className="w-full lg:w-96 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl h-fit">
             {!selectedTx ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                 <Beer size={48} className="mb-4 opacity-20" />
                 <p className="font-bold text-sm">Select a transaction to distribute</p>
               </div>
             ) : (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Gross Sales</p>
                    <p className="text-3xl font-black text-slate-900">${selectedTx.amount.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Card Portion</label>
                      <input type="number" className="w-full p-3 bg-purple-50 rounded-xl font-bold outline-none" placeholder="0" value={splits.card} onChange={e=>setSplits({...splits, card: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Service Charge</label>
                      <input type="number" className="w-full p-3 bg-red-50 rounded-xl font-bold text-red-500 outline-none" placeholder="0" value={splits.svc} onChange={e=>setSplits({...splits, svc: e.target.value})} />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Drinks Cost (Deducted)</label>
                      <input type="number" className="w-full p-3 bg-red-50 rounded-xl font-bold text-red-500 outline-none" placeholder="0" value={splits.drinks} onChange={e=>setSplits({...splits, drinks: e.target.value})} />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl flex justify-between items-center ${isBalanced ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <span className="text-xs font-black uppercase">Net Cash to Keep</span>
                    <span className="font-black text-2xl">${remainingCash.toFixed(2)}</span>
                  </div>

                  <button 
                    disabled={!isBalanced || !settings.primaryDestId}
                    onClick={handleSettle}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft size={18} />
                    DISTRIBUTE FUNDS
                  </button>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- BILLS REC PORTAL (Unchanged Logic - Just stricter filter) ---
const BillsRecPortal = ({ accounts, transactions, onSettle, onClose }: any) => {
  const [settings, setSettings] = useState({
    sourceId: '',
    dest1Id: '',
    dest2Id: ''
  });
  
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [payAmount1, setPayAmount1] = useState('');
  const [payAmount2, setPayAmount2] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('mozza_portal_bills');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const saveSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem('mozza_portal_bills', JSON.stringify(newSettings));
  };

  const potentialSources = accounts.filter((a: any) => ['receivable', 'asset'].includes(a.type));
  const potentialDests = accounts.filter((a: any) => ['cash', 'bank', 'asset'].includes(a.type));

  const customerGroups = useMemo(() => {
    if (!settings.sourceId) return {};
    const groups: Record<string, { total: number, txs: Transaction[] }> = {};
    
    transactions
      .filter((t: Transaction) => 
        t.accountId === settings.sourceId && 
        t.amount > 0 &&
        t.shiftId // STRICTLY FILTER for Daily Ops Shifts
      )
      .forEach((t: Transaction) => {
        // DailyOps "Guest Receivable: NAME"
        const name = t.description.includes(':') ? t.description.split(':')[1].trim() : 'Unknown';
        if (!groups[name]) groups[name] = { total: 0, txs: [] };
        groups[name].total += t.amount;
        groups[name].txs.push(t);
      });
    return groups;
  }, [settings.sourceId, transactions]);

  const activeGroup = selectedCustomer ? customerGroups[selectedCustomer] : null;
  const totalSettling = (parseFloat(payAmount1)||0) + (parseFloat(payAmount2)||0);
  const remaining = activeGroup ? activeGroup.total - totalSettling : 0;

  const handleSettle = async () => {
    if (!activeGroup || Math.abs(remaining) > 0.01) return;
    const now = new Date().toISOString();

    // 1. Credit Source (Clear Bill)
    await onSettle({
      description: `Bill Payment: ${selectedCustomer}`,
      amount: -activeGroup.total,
      category: 'Transfer',
      date: now,
      accountId: settings.sourceId
    });

    // 2. Debit Destinations
    if (parseFloat(payAmount1) > 0) {
      await onSettle({
        description: `Bill Receipt (Cash/Bank) - ${selectedCustomer}`,
        amount: parseFloat(payAmount1),
        category: 'Revenue',
        date: now,
        accountId: settings.dest1Id
      });
    }
    if (parseFloat(payAmount2) > 0) {
      await onSettle({
        description: `Bill Receipt (Alt) - ${selectedCustomer}`,
        amount: parseFloat(payAmount2),
        category: 'Revenue',
        date: now,
        accountId: settings.dest2Id
      });
    }
    
    setSelectedCustomer(null);
    setPayAmount1(''); setPayAmount2('');
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2 mb-3 text-slate-400">
           <SettingsIcon size={14} />
           <p className="text-xs font-black uppercase tracking-widest">Bills Configuration</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pending Source (Daily Ops)</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" value={settings.sourceId} onChange={e=>saveSettings({...settings, sourceId: e.target.value})}>
                <option value="">Select Pending Account...</option>
                {potentialSources.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Settlement Dest 1</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" value={settings.dest1Id} onChange={e=>saveSettings({...settings, dest1Id: e.target.value})}>
                <option value="">Select Account...</option>
                {potentialDests.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Settlement Dest 2</label>
              <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" value={settings.dest2Id} onChange={e=>saveSettings({...settings, dest2Id: e.target.value})}>
                <option value="">Select Account...</option>
                {potentialDests.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Customer List */}
        <div className="w-full lg:w-80 bg-white rounded-[2rem] border border-slate-200 p-4 max-h-[500px] overflow-y-auto">
          <h3 className="font-bold text-slate-700 mb-4 ml-2">Pending Guests</h3>
          {Object.keys(customerGroups).length === 0 && <p className="text-xs text-slate-400 text-center py-8">No pending bills found in source</p>}
          {Object.entries(customerGroups).map(([name, data]) => (
            <div 
              key={name}
              onClick={() => { setSelectedCustomer(name); setPayAmount1(data.total.toString()); setPayAmount2('0'); }}
              className={`p-4 mb-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${
                selectedCustomer === name ? 'bg-cyan-50 border border-cyan-200 shadow-md' : 'bg-slate-50 border border-transparent hover:bg-white hover:shadow-sm'
              }`}
            >
              <span className="font-bold text-sm text-slate-800 truncate max-w-[120px]">{name}</span>
              <span className="font-black text-slate-900">${data.total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Payment Panel */}
        <div className="flex-1 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col justify-center">
          {!selectedCustomer ? (
            <div className="text-center text-slate-300">
              <Receipt size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">Select a guest to settle</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Settling Bill For</p>
                <h2 className="text-3xl font-black text-slate-900">{selectedCustomer}</h2>
                <div className="mt-4 inline-block px-6 py-2 bg-slate-100 rounded-full">
                  <span className="font-black text-xl text-slate-700">Total Due: ${activeGroup?.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Pay to Dest 1</label>
                    <input 
                      type="number" 
                      className="w-full h-16 bg-slate-50 rounded-2xl text-2xl font-black px-4 border-2 border-transparent focus:border-cyan-500 outline-none" 
                      value={payAmount1} onChange={e=>setPayAmount1(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Pay to Dest 2</label>
                    <input 
                      type="number" 
                      className="w-full h-16 bg-slate-50 rounded-2xl text-2xl font-black px-4 border-2 border-transparent focus:border-cyan-500 outline-none" 
                      value={payAmount2} onChange={e=>setPayAmount2(e.target.value)}
                    />
                 </div>
              </div>

              <div className={`p-4 rounded-xl text-center font-bold text-sm ${Math.abs(remaining) < 0.01 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {Math.abs(remaining) < 0.01 ? 'PAYMENT BALANCED' : `REMAINING: $${remaining.toFixed(2)}`}
              </div>

              <button 
                 disabled={Math.abs(remaining) > 0.01}
                 onClick={handleSettle}
                 className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                COMPLETE SETTLEMENT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default MoneyLab;