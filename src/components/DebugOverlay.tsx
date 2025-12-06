import React, { useState } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import { searchByProcessNumber } from '../services/DataJudService';



export const DebugOverlay: React.FC = () => {
    const { isSidebarCollapsed, toggleSidebar } = useGlobalData();
    const [testStatus, setTestStatus] = useState<string>('Idle');
    const [lastError, setLastError] = useState<string>('');
    const [cnjInput, setCnjInput] = useState('');

    const runDataJudTest = async () => {
        setTestStatus('Testing...');
        setLastError('');
        try {
            const logs: string[] = [];
            const addLog = (msg: string) => logs.push(msg);

            addLog('🚀 Starting Test via Service...');

            if (cnjInput) {
                addLog(`🔍 Testing CNJ: ${cnjInput}`);

                // Use the REAL service logic
                const result = await searchByProcessNumber(cnjInput);

                if (result) {
                    addLog(`✅ FOUND in Tribunal: ${result.tribunal.name} (${result.tribunal.id})`);
                    addLog(`📄 Process Number: ${result.data.hits.hits[0]._source.numeroProcesso}`);
                    addLog(`📦 Total Hits: ${result.data.hits.total.value}`);
                    setTestStatus('FOUND!');
                } else {
                    addLog(`⚠️ Process NOT Found in any inferred or fallback tribunal.`);
                    setTestStatus('NOT FOUND');
                }
                setLastError(logs.join('\n'));

            } else {
                addLog('⚠️ Please enter a CNJ to test the full logic.');
                setTestStatus('Idle');
            }
        } catch (error: any) {
            console.error('❌ Test Failed:', error);
            setTestStatus('Failed');
            setLastError(prev => prev + `\n❌ Exception: ${error.message}`);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-xl z-[9999] text-xs font-mono max-w-md shadow-2xl border border-red-500 max-h-[80vh] overflow-auto">
            <h3 className="font-bold text-red-400 mb-2 flex justify-between items-center">
                <span>🔧 DEBUG V4</span>
                <button onClick={() => setLastError('')} className="text-gray-500 hover:text-white">Clear</button>
            </h3>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sidebar:</span>
                    <span className={isSidebarCollapsed ? 'text-green-400' : 'text-yellow-400'}>
                        {isSidebarCollapsed ? 'COLLAPSED' : 'EXPANDED'}
                    </span>
                    <button onClick={toggleSidebar} className="px-2 py-0.5 bg-gray-700 rounded hover:bg-gray-600">
                        Toggle
                    </button>
                </div>

                <div className="border-t border-gray-700 pt-2 mt-2">
                    <label className="block text-gray-400 mb-1">Teste CNJ (Opcional):</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={cnjInput}
                            onChange={(e) => setCnjInput(e.target.value)}
                            placeholder="0000000-00.0000.0.00.0000"
                            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 flex-1 text-white"
                        />
                        <button onClick={runDataJudTest} className="px-2 py-0.5 bg-blue-600 rounded hover:bg-blue-500 font-bold">
                            TESTAR
                        </button>
                    </div>
                </div>

                <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 font-bold ${testStatus.includes('Success') || testStatus.includes('FOUND!') ? 'text-green-400' : testStatus.includes('Failed') || testStatus.includes('NOT FOUND') ? 'text-red-500' : 'text-white'}`}>
                        {testStatus}
                    </span>
                </div>
                {lastError && (
                    <pre className="text-green-300 bg-gray-900 p-2 rounded border border-gray-700 whitespace-pre-wrap break-all text-[10px] mt-2">
                        {lastError}
                    </pre>
                )}
                <div className="text-[10px] text-gray-500 mt-2 text-right">
                    v4.0 - {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
