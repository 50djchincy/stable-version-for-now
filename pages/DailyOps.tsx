import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Power, 
  Plus, 
  Minus, 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Beer, 
  Globe, 
  Users, 
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Receipt,
  Wallet,
  Zap,
  Calendar,
  ArrowRight,
  Settings as SettingsIcon,
  Loader2,
  PlusCircle,
  ArrowDownCircle,
  Star,
  Snowflake,
  ShoppingBag,
  Flame,
  Truck,
  Package,
  ListFilter
} from 'lucide-react';
import { ShiftInjection, ShiftExpense, CreditBillEntry } from '../types';

// --- DEFAULTS SYNCED WITH EXPENSES PAGE ---
const DEFAULT_PRESETS = [
  { id: 'p1', label: 'Ice Delivery', amount: 45.00, iconName: 'Snowflake', color: 'text-cyan-600', bg: 'bg-cyan-50', category: 'Inventory' },
  { id: 'p2', label: 'Linen Service', amount: 120.00, iconName: 'ShoppingBag', color: 'text-purple-600', bg: 'bg-purple-50', category: 'Utilities' },
  { id: 'p3', label: 'Gas Refill', amount: 85.50, iconName: 'Flame', color: 'text-red-600', bg: 'bg-red-50', category: 'Utilities' },
  { id: 'p4', label: 'Produce', amount: 0, iconName: 'Truck', color: 'text-emerald-600', bg: 'bg-emerald-50', category: 'Inventory' },
];

const DailyOps: React.FC = () => {
  const { activeShift, shifts, customers, startShift, updateActiveShift, closeShift, flowConfig, accounts, setCurrentPage } = useApp();
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Note: We no longer rely on lastShift.actualCash for carry forward, but strictly on the Account Balance.
  const isConfigComplete = Object.values(flowConfig).every(val => val !== '');

  // If no active shift is found, we show the "Start Shift" screen.
  if (!activeShift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-24 h-24 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-blue-600">
          <Zap size={48} className="animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Shift is Closed</h1>
          <p className="text-slate-500 font-medium">Ready to start the next service?</p>
        </div>
        <button 
          onClick={() => setShowOpenModal(true)}
          className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-95"
        >
          <Play size={24} fill="white" />
          START SHIFT
        </button>

        {showOpenModal && (
          <ShiftStartModal 
            onClose={() => setShowOpenModal(false)} 
            onStart={startShift}
            accounts={accounts}
            flowConfig={flowConfig}
          />
        )}
      </div>
    );
  }

  const menuItems = [
    { id: 'sales', label: 'Gross Sales', icon: <Calculator size={24} />, color: 'bg-blue-50 text-blue-600', description: 'Log Register Totals', target: flowConfig.salesAccount },
    { id: 'cards', label: 'Card & Digital', icon: <CreditCard size={24} />, color: 'bg-purple-50 text-purple-600', description: 'Bank Settlement', target: flowConfig.cardsAccount },
    { id: 'hiking', label: 'Hiking Bar', icon: <Beer size={24} />, color: 'bg-orange-50 text-orange-600', description: 'Move to Hiking Rec', target: flowConfig.hikingAccount },
    { id: 'fx', label: 'Foreign Reserve', icon: <Globe size={24} />, color: 'bg-indigo-50 text-indigo-600', description: 'FX Till Transfer', target: flowConfig.fxAccount },
    { id: 'bills', label: 'Credit Bills', icon: <Users size={24} />, color: 'bg-emerald-50 text-emerald-600', description: 'Bills to Receive', target: flowConfig.billsAccount },
    { id: 'expenses', label: 'Shift Expenses', icon: <Receipt size={24} />, color: 'bg-red-50 text-red-600', description: 'Paid from Till', target: flowConfig.cashAccount },
  ];

  const totalBills = activeShift.creditBills.reduce((a, b) => a + b.amount, 0);
  const totalNonCash = activeShift.cards + activeShift.hikingBar + activeShift.foreignCurrency.value + totalBills;
  const cashSales = activeShift.totalSales - totalNonCash;

  const getAccountName = (id: string) => {
    if (!id) return 'UNMAPPED';
    return accounts.find(a => a.id === id)?.name || 'Unknown Account';
  };

  const handleFinalClose = async (actualCash: number) => {
    setIsProcessing(true);
    try {
      await closeShift(actualCash);
      setShowCloseModal(false);
      // The component will naturally re-render to the "Shift is Closed" state because activeShift becomes null
    } catch (error) {
      console.error("Sweep failed", error);
      alert("Error executing sweep. Please check your account connections.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Configuration Alert */}
      {!isConfigComplete && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-orange-700">
            <AlertCircle size={24} />
            <p className="text-sm font-bold">Incomplete Flow Configuration! Shift cannot be swept until accounts are mapped.</p>
          </div>
          <button 
            onClick={() => setCurrentPage('settings')}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-orange-100"
          >
            <SettingsIcon size={14} />
            FIX IN SETTINGS
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <Zap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Flow Editor</h1>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={14} />
              <p className="font-bold text-sm">Accounting for: {activeShift.accountingDate}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="px-6 py-4 bg-blue-50 rounded-3xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center mb-1">Expected Till</p>
            <p className="text-2xl font-black text-blue-600 text-center">${activeShift.expectedCash.toLocaleString()}</p>
          </div>
          <div className="px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Cash Sales</p>
            <p className="text-2xl font-black text-emerald-600 text-center">${cashSales.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left flex flex-col h-56 active:scale-[0.98]"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${item.color}`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.label}</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">{item.description}</p>
            
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              <span>{item.id === 'expenses' ? 'FROM' : 'TO'}</span>
              <span className={`truncate max-w-[120px] ${!item.target ? 'text-red-500 font-black animate-pulse' : 'text-slate-500'}`}>
                {getAccountName(item.target)}
              </span>
            </div>

            <div className="mt-auto flex items-center justify-between w-full pt-2">
              <span className="text-xl font-black text-slate-800">
                {item.id === 'sales' && `$${activeShift.totalSales.toLocaleString()}`}
                {item.id === 'cards' && `$${activeShift.cards.toLocaleString()}`}
                {item.id === 'hiking' && `$${activeShift.hikingBar.toLocaleString()}`}
                {item.id === 'fx' && `$${activeShift.foreignCurrency.value.toLocaleString()}`}
                {item.id === 'bills' && `$${totalBills.toLocaleString()}`}
                {item.id === 'expenses' && `$${activeShift.expenses.reduce((s,e)=>s+e.amount, 0).toLocaleString()}`}
              </span>
              <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:text-blue-500 transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center pt-8 space-y-4">
        <button 
          onClick={() => setShowCalcModal(true)}
          className="flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isConfigComplete}
        >
          <Calculator size={24} />
          FINAL CASH COUNT
        </button>
        {!isConfigComplete && <p className="text-red-500 text-xs font-black uppercase tracking-widest">Complete Configuration to Unlock Close</p>}
        <p className="text-slate-400 text-sm font-medium italic">Count denomination-by-denomination for total accuracy</p>
      </div>

      {activeMenu === 'sales' && <SalesModal targetAccount={getAccountName(flowConfig.salesAccount)} current={activeShift.totalSales} onClose={()=>setActiveMenu(null)} onSave={(val: any)=>updateActiveShift({totalSales: val})} />}
      {activeMenu === 'cards' && <CardsModal targetAccount={getAccountName(flowConfig.cardsAccount)} current={activeShift.cards} onClose={()=>setActiveMenu(null)} onSave={(val: any)=>updateActiveShift({cards: val})} />}
      {activeMenu === 'hiking' && <HikingModal targetAccount={getAccountName(flowConfig.hikingAccount)} current={activeShift.hikingBar} onClose={()=>setActiveMenu(null)} onSave={(val: any)=>updateActiveShift({hikingBar: val})} />}
      {activeMenu === 'fx' && <FXModal targetAccount={getAccountName(flowConfig.fxAccount)} current={activeShift.foreignCurrency} onClose={()=>setActiveMenu(null)} onSave={(val: any)=>updateActiveShift({foreignCurrency: val})} />}
      {activeMenu === 'bills' && <BillsModal targetAccount={getAccountName(flowConfig.billsAccount)} current={activeShift.creditBills} customers={customers} onClose={()=>setActiveMenu(null)} onSave={(val: any)=>updateActiveShift({creditBills: val})} />}
      {activeMenu === 'expenses' && <ExpensesModal targetAccount={getAccountName(flowConfig.cashAccount)} current={activeShift.expenses} onClose={()=>setActiveMenu(null)} onSave={(val: any)=>updateActiveShift({expenses: val})} />}
      
      {showCalcModal && <CashCalcModal expectedAmount={activeShift.expectedCash} onClose={() => setShowCalcModal(false)} onFinalize={() => setShowCloseModal(true)} />}
      {showCloseModal && <CloseShiftModal activeShift={activeShift} isProcessing={isProcessing} onClose={() => setShowCloseModal(false)} onConfirm={handleFinalClose} />}
    </div>
  );
};

// --- HELPER COMPONENT ---
const IconRenderer = ({ name, size = 10 }: { name: string, size?: number }) => {
  switch(name) {
    case 'Snowflake': return <Snowflake size={size} />;
    case 'ShoppingBag': return <ShoppingBag size={size} />;
    case 'Flame': return <Flame size={size} />;
    case 'Truck': return <Truck size={size} />;
    case 'Package': return <Package size={size} />;
    case 'Receipt': return <Receipt size={size} />;
    case 'DollarSign': return <DollarSign size={size} />;
    default: return <Zap size={size} />;
  }
};

// Shift Initialization Modal Component - UPDATED
const ShiftStartModal = ({ onClose, onStart, accounts, flowConfig }: any) => {
  const [accountingDate, setAccountingDate] = useState(new Date().toISOString().split('T')[0]);
  const [injectedAmount, setInjectedAmount] = useState('');
  const [injectedSourceId, setInjectedSourceId] = useState('');

  // Find the Main Cash Till account to deduce the carry forward
  // We prefer the ID from flowConfig, but fallback to searching by name "Main Cash Till"
  const mainTillAccount = accounts.find((a: any) => a.id === flowConfig?.cashAccount) || accounts.find((a: any) => a.name === "Main Cash Till");
  const carryForward = mainTillAccount ? mainTillAccount.balance : 0;

  const liquidAccounts = accounts.filter((a: any) => ['cash', 'bank', 'asset'].includes(a.type) && a.id !== mainTillAccount?.id);
  
  const currentInjectedValue = parseFloat(injectedAmount) || 0;
  const totalOpeningFloatValue = carryForward + currentInjectedValue;

  const handleStart = () => {
    const injections = [];
    if (currentInjectedValue > 0 && injectedSourceId) {
      const sourceAcc = accounts.find((a: any) => a.id === injectedSourceId);
      injections.push({ 
        id: Date.now().toString(), 
        source: sourceAcc?.name || 'Injected Funds', 
        amount: currentInjectedValue 
      });
    }
    onStart(totalOpeningFloatValue, injections, accountingDate);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Service Initialization</h2>
        <p className="text-slate-500 text-sm mb-8 font-medium">Setup your operational data for this session.</p>
        
        <div className="space-y-6">
          {/* Accounting Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Accounting Date</label>
            <input 
              type="date"
              value={accountingDate}
              onChange={(e) => setAccountingDate(e.target.value)}
              className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Inject Float Section */}
          <div className="space-y-4 pt-2">
             <div className="flex items-center gap-2">
               <ArrowDownCircle size={14} className="text-blue-500" />
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inject Float from Source</label>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                 <input 
                   type="number"
                   placeholder="Amount"
                   value={injectedAmount}
                   onChange={(e) => setInjectedAmount(e.target.value)}
                   className="w-full h-12 pl-8 pr-4 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-400 outline-none"
                 />
               </div>
               <select 
                 value={injectedSourceId}
                 onChange={(e) => setInjectedSourceId(e.target.value)}
                 className="h-12 px-3 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-500 appearance-none focus:ring-2 focus:ring-blue-400 outline-none"
               >
                 <option value="">Select Source...</option>
                 {liquidAccounts.map((a: any) => (
                   <option key={a.id} value={a.id}>{a.name}</option>
                 ))}
               </select>
             </div>
          </div>

          {/* Float Carry Forward (Updated to use Account Balance) */}
          <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Main Till Balance</label>
              <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-blue-50">
                <Wallet size={10} />
                LIVE BALANCE
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-blue-700">${carryForward.toLocaleString()}</span>
              {/* Optional: Show account name if found, else warning */}
              <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wide">
                {mainTillAccount ? 'Account Linked' : 'Account Not Found'}
              </span>
            </div>
          </div>

          {/* Total Opening Float */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Opening Float</label>
            <div className="w-full h-14 px-6 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between opacity-80">
              <span className="text-slate-400 font-black text-xl">$</span>
              <span className="text-slate-900 font-black text-2xl">{totalOpeningFloatValue.toLocaleString()}</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium italic text-center">Sum of carry forward and injected funds.</p>
          </div>

          <button 
            onClick={handleStart}
            className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 mt-4 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Play size={20} fill="white" />
            OPEN REGISTER
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuModal = ({ title, targetAccount, children, onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
      </div>
      <div className="flex items-center gap-2 mb-6 px-3 py-1 bg-slate-50 rounded-xl w-fit">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post to:</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${targetAccount === 'UNMAPPED' ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>{targetAccount}</span>
      </div>
      {children}
    </div>
  </div>
);

const SalesModal = ({ current, targetAccount, onClose, onSave }: any) => {
  const [val, setVal] = useState(current.toString());
  return (
    <MenuModal title="Register Sales" targetAccount={targetAccount} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 font-medium">Enter the total sales from your register system.</p>
        <div className="relative">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">$</span>
          <input 
            type="number" autoFocus
            className="w-full h-20 pl-12 pr-6 bg-slate-50 rounded-3xl text-3xl font-black focus:ring-2 focus:ring-blue-500 border-none outline-none"
            value={val} onChange={e=>setVal(e.target.value)}
          />
        </div>
        <button onClick={()=>{onSave(parseFloat(val)||0); onClose();}} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black mt-4 shadow-lg shadow-blue-100">SAVE TOTAL</button>
      </div>
    </MenuModal>
  );
};

const CardsModal = ({ current, targetAccount, onClose, onSave }: any) => {
  const [val, setVal] = useState(current.toString());
  return (
    <MenuModal title="Card Payments" targetAccount={targetAccount} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 font-medium">Total bank settlement (Card/Digital).</p>
        <input 
          type="number" autoFocus
          className="w-full h-16 px-6 bg-slate-50 rounded-2xl text-2xl font-black focus:ring-2 focus:ring-purple-500 border-none outline-none"
          value={val} onChange={e=>setVal(e.target.value)}
        />
        <button onClick={()=>{onSave(parseFloat(val)||0); onClose();}} className="w-full h-14 bg-purple-600 text-white rounded-2xl font-black mt-4">LOG CARDS</button>
      </div>
    </MenuModal>
  );
};

const HikingModal = ({ current, targetAccount, onClose, onSave }: any) => {
  const [val, setVal] = useState(current.toString());
  return (
    <MenuModal title="Hiking Bar" targetAccount={targetAccount} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 font-medium">Move specific portion to Hiking Bar Receivable.</p>
        <input 
          type="number" autoFocus
          className="w-full h-16 px-6 bg-slate-50 rounded-2xl text-2xl font-black focus:ring-2 focus:ring-orange-500 border-none outline-none"
          value={val} onChange={e=>setVal(e.target.value)}
        />
        <button onClick={()=>{onSave(parseFloat(val)||0); onClose();}} className="w-full h-14 bg-orange-600 text-white rounded-2xl font-black mt-4">MOVE TO HIKING</button>
      </div>
    </MenuModal>
  );
};

const FXModal = ({ current, targetAccount, onClose, onSave }: any) => {
  const [val, setVal] = useState(current.value.toString());
  const [comment, setComment] = useState(current.comment);
  return (
    <MenuModal title="Foreign Reserve" targetAccount={targetAccount} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Value</label>
          <input 
            type="number" autoFocus
            className="w-full h-14 px-6 bg-slate-50 rounded-xl text-xl font-black focus:ring-2 focus:ring-indigo-500 border-none outline-none"
            value={val} onChange={e=>setVal(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comment (e.g. 50 USD x 2)</label>
          <input 
            className="w-full h-14 px-6 bg-slate-50 rounded-xl font-bold border-none outline-none"
            value={comment} onChange={e=>setComment(e.target.value)}
          />
        </div>
        <button onClick={()=>{onSave({value: parseFloat(val)||0, comment}); onClose();}} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black mt-4">LOG FX</button>
      </div>
    </MenuModal>
  );
};

const BillsModal = ({ current, targetAccount, customers, onClose, onSave }: any) => {
  const [bills, setBills] = useState<CreditBillEntry[]>(current);
  const [selectedCust, setSelectedCust] = useState(customers[0]?.id || '');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    const cust = customers.find((c: any) => c.id === selectedCust);
    if (!cust || !amount) return;
    setBills([...bills, { customerId: cust.id, customerName: cust.name, amount: parseFloat(amount) }]);
    setAmount('');
  };

  return (
    <MenuModal title="Credit Bills" targetAccount={targetAccount} onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-3xl space-y-3">
          <select 
            className="w-full h-12 px-4 bg-white border-none rounded-xl font-bold outline-none"
            value={selectedCust}
            onChange={(e) => setSelectedCust(e.target.value)}
          >
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input 
              type="number" placeholder="Amt"
              className="flex-1 h-12 px-4 bg-white border-none rounded-xl font-bold outline-none"
              value={amount} onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleAdd} className="px-6 h-12 bg-emerald-600 text-white rounded-xl font-black">ADD</button>
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {bills.map((b, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">{b.customerName}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-900">${b.amount}</span>
                <button onClick={()=>setBills(bills.filter((_, idx)=>idx !== i))}><X size={14} className="text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>{onSave(bills); onClose();}} className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-black mt-2">SAVE BILLS</button>
      </div>
    </MenuModal>
  );
};

const ExpensesModal = ({ current, targetAccount, onClose, onSave }: any) => {
  const [exps, setExps] = useState<ShiftExpense[]>(current);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [presets, setPresets] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mozza_expense_presets');
    if (saved) {
      setPresets(JSON.parse(saved));
    } else {
      // If no custom presets, show defaults to ensure "One-Tap" always has content
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  const handleAdd = () => {
    if (!amt || !desc) return;
    setExps([...exps, { id: Date.now().toString(), category: 'Till Expense', description: desc, amount: parseFloat(amt) }]);
    setDesc(''); setAmt('');
  };

  const handleApplyPreset = (p: any) => {
    setDesc(p.label);
    if (p.amount > 0) setAmt(p.amount.toString());
  };

  return (
    <MenuModal title="Shift Expenses" targetAccount={targetAccount} onClose={onClose}>
      <div className="space-y-6">
        {/* One-Tap Presets Section - Compact Grid */}
        {presets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">One-Tap Presets</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
              {presets.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className={`p-3 border rounded-2xl transition-all flex items-center gap-3 active:scale-95 group text-left
                    ${desc === p.label ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-slate-50'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${p.bg} ${p.color} shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                    <IconRenderer name={p.iconName} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-black uppercase tracking-wider truncate ${desc === p.label ? 'text-blue-700' : 'text-slate-700'}`}>
                      {p.label}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{p.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Description</label>
            <input 
              placeholder="e.g. Fresh Produce, Ice, Gas..."
              className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-red-100 transition-all"
              value={desc} onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input 
                  type="number" placeholder="0.00"
                  className="w-full h-14 pl-10 pr-4 bg-white border border-slate-100 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  value={amt} onChange={(e) => setAmt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <button 
                onClick={handleAdd} 
                disabled={!amt || !desc}
                className="h-14 px-8 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95 transition-all disabled:opacity-50"
              >
                LOG
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged Items</p>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Total: ${exps.reduce((s,e)=>s+e.amount, 0).toLocaleString()}</p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-1">
            {exps.map((e, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right-2">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Receipt size={14} /></div>
                   <span className="text-xs font-bold text-slate-700">{e.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-red-600">${e.amount.toLocaleString()}</span>
                  <button 
                    onClick={()=>setExps(exps.filter((_, idx)=>idx !== i))}
                    className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            {exps.length === 0 && (
              <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                <Receipt size={32} className="mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">No entries yet</p>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={()=>{onSave(exps); onClose();}} 
          className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black text-lg mt-2 shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
        >
          <CheckCircle2 size={24} />
          COMMIT EXPENSES
        </button>
      </div>
    </MenuModal>
  );
};

// CashCalcModal - UPDATED (Compact & Expected Value)
const CashCalcModal = ({ onClose, onFinalize, expectedAmount = 0 }: any) => {
  const [counts, setCounts] = useState<any>({ 5000: 0, 2000: 0, 1000: 0, 500: 0, 100: 0, 50: 0, 20: 0, coins: 0 });
  const total = Object.entries(counts).reduce((sum, [den, count]: any) => den === 'coins' ? sum + count : sum + (parseInt(den) * count), 0);

  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900">Actual Cash Count</h2>
          <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
        </div>

        {/* Header Summary for Live Comparison */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-6">
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected</p>
             <p className="text-lg font-black text-slate-500">${expectedAmount.toLocaleString()}</p>
           </div>
           <div className="h-8 w-px bg-slate-200"></div>
           <div className="text-center">
             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Counted</p>
             <p className={`text-lg font-black ${total === expectedAmount ? 'text-emerald-600' : 'text-blue-600'}`}>${total.toLocaleString()}</p>
           </div>
        </div>

        {/* Compact Grid Layout for Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[5000, 2000, 1000, 500, 100, 50, 20].map((den) => (
            <div key={den} className="flex items-center gap-2 bg-slate-50 px-3 py-3 rounded-2xl">
              <div className="w-10 font-black text-slate-400 text-[10px] uppercase text-right">{den}</div>
              <input type="number" className="flex-1 bg-transparent border-none text-right font-black text-lg focus:ring-0 outline-none p-0" value={counts[den] || ''} onChange={(e) => setCounts({...counts, [den]: parseInt(e.target.value) || 0})} />
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
            <div className="w-16 font-black text-slate-400 text-xs uppercase pl-2">Coins</div>
            <input type="number" className="flex-1 bg-transparent border-none text-right font-black text-xl focus:ring-0 outline-none" value={counts.coins || ''} onChange={(e) => setCounts({...counts, coins: parseFloat(e.target.value) || 0})} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Final Count</p>
          <p className="text-4xl font-black mb-6">${total.toLocaleString()}</p>
          <button onClick={() => { localStorage.setItem('mozza_last_calc_total', total.toString()); onFinalize(); onClose(); }} className="w-full py-4 bg-blue-600 rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">VERIFY & PROCEED</button>
        </div>
      </div>
    </div>
  );
};

// CloseShiftModal - UPDATED (Breakdown & Variance Signs)
const CloseShiftModal = ({ activeShift, isProcessing, onClose, onConfirm }: any) => {
  const lastCalc = localStorage.getItem('mozza_last_calc_total');
  const [actual, setActual] = useState(lastCalc || '');
  
  const actualVal = parseFloat(actual) || 0;
  const diff = actualVal - activeShift.expectedCash;
  const absDiff = Math.abs(diff);

  // Derive values for waterfall breakdown
  const totalBills = activeShift.creditBills.reduce((a: number, b: any) => a + b.amount, 0);
  const totalNonCash = activeShift.cards + activeShift.hikingBar + activeShift.foreignCurrency.value + totalBills;
  const netCashSales = activeShift.totalSales - totalNonCash;
  const totalExpenses = activeShift.expenses.reduce((s: number, e: any) => s + e.amount, 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Shift Closure Summary</h2>
        
        <div className="space-y-6 mb-8">
          
          {/* Waterfall Breakdown */}
          <div className="bg-slate-50 p-5 rounded-3xl space-y-3">
             <div className="flex justify-between items-center text-xs font-bold text-slate-400">
               <span>Opening Float</span>
               <span>${activeShift.openingFloat.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
               <span className="flex items-center gap-1"><PlusCircle size={10} /> Net Cash Sales</span>
               <span>+${netCashSales.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-xs font-bold text-red-500">
               <span className="flex items-center gap-1"><Minus size={10} /> Expenses</span>
               <span>-${totalExpenses.toLocaleString()}</span>
             </div>
             <div className="h-px bg-slate-200 my-1"></div>
             <div className="flex justify-between items-center font-black text-slate-900">
               <span className="uppercase text-[10px] tracking-widest">Calculated Expected</span>
               <span>${activeShift.expectedCash.toLocaleString()}</span>
             </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Verified Handover Cash</label>
            <span className="text-3xl font-black text-slate-900">${actualVal.toLocaleString()}</span>
          </div>

          {/* Variance Display with Signs */}
          <div className={`p-6 rounded-3xl flex items-center justify-between ${diff === 0 ? 'bg-emerald-50 text-emerald-600' : diff > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Cash Variance</p>
              <p className="text-xl font-black">
                {diff === 0 ? 'Perfect Match' : diff > 0 ? `+$${absDiff.toLocaleString()} (Over)` : `-$${absDiff.toLocaleString()} (Short)`}
              </p>
            </div>
            {diff === 0 ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            disabled={isProcessing}
            onClick={onClose} 
            className="h-16 rounded-2xl font-black text-slate-400 bg-slate-100 disabled:opacity-50"
          >
            RE-CHECK
          </button>
          <button 
            disabled={isProcessing}
            onClick={() => { onConfirm(parseFloat(actual)); localStorage.removeItem('mozza_last_calc_total'); }} 
            className="h-16 rounded-2xl font-black text-white bg-slate-900 disabled:bg-slate-700 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                SWEEPING...
              </>
            ) : (
              'EXECUTE SWEEP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyOps;