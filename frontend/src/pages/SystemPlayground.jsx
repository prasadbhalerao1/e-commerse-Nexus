import React, { useEffect, useState } from 'react';
import { Terminal, RefreshCcw, Database, ShieldAlert, Cpu, HardDrive, Wifi, Play, HelpCircle } from 'lucide-react';

export default function SystemPlayground() {
  const [telemetry, setTelemetry] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([
    '// SYSTEM PLAYGROUND TERMINAL LOADED...',
    '// ESTABLISHED ENCRYPTED TELEMETRY STREAM.'
  ]);

  // Webhook inputs
  const [webhookOrderNum, setWebhookOrderNum] = useState('');
  const [webhookStatus, setWebhookStatus] = useState('Completed');

  // Add line to terminal console simulator
  const logMessage = (msg) => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // Fetch telemetry health data
  const fetchTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const response = await fetch('/api/system-control/health');
      if (response.ok) {
        const body = await response.json();
        setTelemetry(body.data);
        logMessage('SYS_TELEMETRY: Connection active. Telemetry packets successfully retrieved.');
      } else {
        logMessage('SYS_TELEMETRY_ERROR: Health status endpoint responded with non-200 status code.');
      }
    } catch (err) {
      logMessage(`SYS_TELEMETRY_ERROR: Connection failed: ${err.message}`);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  // Reseed DB
  const handleReseed = async () => {
    if (!window.confirm('WARNING: This will drop all database collections and re-seed clean default mock records. Proceed?')) return;
    logMessage('DB_SEED: Launching database reseed protocol...');
    try {
      const response = await fetch('/api/system-control/seed', { method: 'POST' });
      const body = await response.json();
      if (response.ok) {
        logMessage(`DB_SEED_SUCCESS: ${body.message}`);
        fetchTelemetry(); // Refresh stats
      } else {
        logMessage(`DB_SEED_FAILURE: Reseed failed: ${body.message}`);
      }
    } catch (err) {
      logMessage(`DB_SEED_FAILURE: Command failed: ${err.message}`);
    }
  };

  // Cart Sweep
  const handleCartSweep = async () => {
    logMessage('CART_SWEEP: Dispatching manual abandoned cart scan and recovery scan sweep...');
    try {
      const response = await fetch('/api/system-control/sweep', { method: 'POST' });
      const body = await response.json();
      if (response.ok) {
        logMessage(`CART_SWEEP_SUCCESS: ${body.message}`);
        fetchTelemetry(); // Refresh stats
      } else {
        logMessage(`CART_SWEEP_FAILURE: Sweep returned error: ${body.message}`);
      }
    } catch (err) {
      logMessage(`CART_SWEEP_FAILURE: Command failed: ${err.message}`);
    }
  };

  // Mock Stripe Webhook
  const handleWebhookSubmit = async (e) => {
    e.preventDefault();
    if (!webhookOrderNum.trim()) {
      logMessage('WEBHOOK_WARNING: Refusing to submit webhook with empty orderNumber field.');
      return;
    }
    logMessage(`STRIPE_WEBHOOK: Simulating successful payment webhook event for Order ${webhookOrderNum}...`);
    try {
      const response = await fetch('/api/system-control/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: webhookOrderNum, status: webhookStatus })
      });
      const body = await response.json();
      if (response.ok) {
        logMessage(`STRIPE_WEBHOOK_SUCCESS: Mock payment updated successfully: ${body.message}`);
        fetchTelemetry(); // Refresh stats
      } else {
        logMessage(`STRIPE_WEBHOOK_FAILURE: Webhook rejected by server: ${body.message}`);
      }
    } catch (err) {
      logMessage(`STRIPE_WEBHOOK_FAILURE: Webhook submission failed: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash space-y-8">
      
      {/* Playground Header */}
      <div className="flex items-center justify-between border-b border-acid/20 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Terminal className="h-6 w-6 text-acid animate-pulse" />
          <h2 className="font-display font-black text-xl tracking-widest text-acid">
            SYSTEM_CONTROL_ROOM
          </h2>
        </div>
        <button 
          onClick={fetchTelemetry} 
          disabled={loadingTelemetry}
          className="flex items-center gap-1 text-[10px] text-acid border border-acid/30 hover:border-acid px-3 py-1.5 rounded transition-all bg-void"
        >
          <RefreshCcw className={`h-3 w-3 ${loadingTelemetry ? 'animate-spin' : ''}`} /> REFRESH_METRICS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Controls Hub */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer space-y-6">
            <div className="flex items-center gap-2 font-display text-xs font-black text-f0f0f0 border-b border-acid/15 pb-2">
              <ShieldAlert className="h-4 w-4 text-hazard" />
              DIRECT_SYSTEM_CONTROLS
            </div>

            {/* Reseed DB Trigger */}
            <div className="space-y-2">
              <span className="text-[10px] text-acid/70 uppercase">01_Database_Reseed</span>
              <p className="text-[10px] text-soft-ash/60 leading-relaxed">
                Wipes and re-installs categories, coupons, and orders matching default roles configurations.
              </p>
              <button
                onClick={handleReseed}
                className="w-full py-2 bg-hazard text-void font-display font-black text-xs tracking-wider rounded hover:shadow-hazard transition-all"
              >
                EXECUTE_DB_RESET
              </button>
            </div>

            {/* Cart sweep Trigger */}
            <div className="space-y-2">
              <span className="text-[10px] text-acid/70 uppercase">02_Cart_Recovery_Sweep</span>
              <p className="text-[10px] text-soft-ash/60 leading-relaxed">
                Manually triggers Node scheduler check to look for abandoned carts (24h idle) and send mock emails.
              </p>
              <button
                onClick={handleCartSweep}
                className="w-full py-2 bg-acid text-void font-display font-black text-xs tracking-wider rounded hover:shadow-acid transition-all"
              >
                TRIGGER_RECOVERY_SWEEP
              </button>
            </div>

            {/* Stripe Webhook Simulator */}
            <div className="space-y-3">
              <div className="border-t border-acid/10 pt-4">
                <span className="text-[10px] text-acid/70 uppercase">03_Stripe_Webhook_Simulator</span>
              </div>
              <p className="text-[10px] text-soft-ash/60 leading-relaxed">
                Dispatches a simulated Stripe checkout payment status webhook updating active order transactions.
              </p>
              <form onSubmit={handleWebhookSubmit} className="space-y-3 text-[11px]">
                <div className="space-y-1">
                  <label className="text-[9px] text-soft-ash/50">ORDER NUMBER REF</label>
                  <input
                    type="text"
                    placeholder="e.g. NEX-100001-22"
                    value={webhookOrderNum}
                    onChange={(e) => setWebhookOrderNum(e.target.value)}
                    className="w-full bg-void border border-acid/30 px-2 py-1.5 text-f0f0f0 rounded outline-none text-xs focus:border-acid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-soft-ash/50">PAYMENT STATUS</label>
                  <select
                    value={webhookStatus}
                    onChange={(e) => setWebhookStatus(e.target.value)}
                    className="w-full bg-void border border-acid/30 px-2 py-1.5 text-f0f0f0 rounded outline-none text-xs"
                  >
                    <option value="Completed">COMPLETED / SUCCESS</option>
                    <option value="Refunded">REFUNDED / RETURNED</option>
                    <option value="Failed">FAILED / CHARGEBACK</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blaze text-void font-display font-black text-xs tracking-wider rounded hover:shadow-blaze transition-all"
                >
                  DISPATCH_MOCK_WEBHOOK
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Right Columns: Telemetry Monitor & Simulated Terminal Console */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Telemetry Status Monitor */}
          <div className="bg-sludge border border-acid/25 p-5 rounded clip-chamfer space-y-4">
            <div className="flex items-center gap-2 font-display text-xs font-black text-f0f0f0 border-b border-acid/15 pb-2">
              <Cpu className="h-4 w-4 text-acid" />
              CORE_TELEMETRY_DATAFRAME
            </div>

            {telemetry ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Stats Section 1 */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50 flex items-center gap-1"><HardDrive className="h-3.5 w-3.5" /> Database Uplink</span>
                    <span className="text-acid font-bold">{telemetry.database.status.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50">Total Registered Users</span>
                    <span className="text-f0f0f0 font-semibold">{telemetry.database.users}</span>
                  </div>
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50">Active Inventory SKU</span>
                    <span className="text-f0f0f0 font-semibold">{telemetry.database.products}</span>
                  </div>
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50">Global Order Records</span>
                    <span className="text-f0f0f0 font-semibold">{telemetry.database.orders}</span>
                  </div>
                </div>

                {/* Stats Section 2 */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50 flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> WebSocket Uplink</span>
                    <span className="text-acid font-bold">{telemetry.websockets.status.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50">Active Socket Clients</span>
                    <span className="text-f0f0f0 font-semibold">{telemetry.websockets.activeConnections} Connections</span>
                  </div>
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50">Server Runtime Uptime</span>
                    <span className="text-hazard font-mono">{telemetry.uptime} Seconds</span>
                  </div>
                  <div className="flex justify-between border-b border-acid/10 pb-1">
                    <span className="text-soft-ash/50">Process Memory usage</span>
                    <span className="text-f0f0f0 font-mono">
                      {Math.round(telemetry.resources.memoryUsage.rss / 1024 / 1024)} MB
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-soft-ash/40">
                // COMPILING TELEMETRY DATA PACKETS...
              </div>
            )}
          </div>

          {/* Console simulator logs */}
          <div className="bg-void border border-acid/20 p-5 rounded clip-chamfer space-y-3 flex flex-col h-80 justify-between">
            <div className="flex items-center justify-between border-b border-acid/15 pb-2 text-[10px]">
              <span className="text-acid font-bold flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-acid" /> COMMAND_PLAYGROUND_LOGS
              </span>
              <button 
                onClick={() => setConsoleLogs(['// CONSOLE LOGS FLUSHED.'])} 
                className="text-blaze hover:underline"
              >
                FLUSH_CONSOLE
              </button>
            </div>
            
            {/* Logs display */}
            <div className="flex-grow overflow-y-auto space-y-1 pr-2 font-mono text-[10px] leading-relaxed text-soft-ash/85">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className={log.includes('ERROR') ? 'text-blaze font-bold' : log.includes('SUCCESS') ? 'text-acid font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>

            <div className="border-t border-acid/10 pt-2 text-[9px] text-soft-ash/40 flex justify-between">
              <span>Node Environment: development</span>
              <span>Memory Heap active</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
