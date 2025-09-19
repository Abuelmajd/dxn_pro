
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { HealthCheckResult } from '../types';

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SetupCheckPage: React.FC = () => {
    const { t, runHealthCheck } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<HealthCheckResult[]>([]);
    
    const handleRunCheck = async () => {
        setIsLoading(true);
        setResults([]);
        const checkResults = await runHealthCheck();
        setResults(checkResults);
        setIsLoading(false);
    };

    const getTranslatedDetails = (result: HealthCheckResult): string => {
        if (result.status === 'success') {
            return result.details.includes("Sheet exists") ? t('sheetExists') : t('headersCorrect');
        }
        if (result.details.includes("Sheet is missing")) {
            return t('sheetMissing');
        }
        if (result.details.includes("Missing headers")) {
            const missing = result.details.split(': ')[1];
            return `${t('missingHeaders')}: ${missing}`;
        }
        return result.details;
    }


    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('setupCheck')}</h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">{t('setupCheckDescription')}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                <p className="mb-6 text-sm text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    {t('setupInstructions')}
                </p>

                <div className="text-center">
                    <button 
                        onClick={handleRunCheck} 
                        disabled={isLoading}
                        className="px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? t('checking') : t('startCheck')}
                    </button>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center mt-8">
                        <div className="w-8 h-8 border-4 border-t-4 border-t-indigo-600 border-slate-200 dark:border-slate-700 rounded-full animate-spin"></div>
                    </div>
                )}
                
                {results.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{t('checkResults')}</h2>
                        <div className="space-y-3">
                            {results.map((result, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <div className="flex-shrink-0">
                                        {result.status === 'success' ? <CheckIcon /> : <XCircleIcon />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{result.check}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{getTranslatedDetails(result)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SetupCheckPage;
