import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 font-mono">
                    <div className="max-w-3xl w-full bg-gray-800 rounded-xl border border-red-500/50 shadow-2xl overflow-hidden">
                        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <h1 className="text-xl font-bold text-red-400">Application Crashed</h1>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Error Message</h2>
                                <div className="bg-black/50 rounded-lg p-4 border border-gray-700 text-red-300 whitespace-pre-wrap break-words">
                                    {this.state.error?.toString()}
                                </div>
                            </div>

                            {this.state.errorInfo && (
                                <div>
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Component Stack</h2>
                                    <div className="bg-black/50 rounded-lg p-4 border border-gray-700 text-gray-400 text-xs overflow-auto max-h-96 whitespace-pre">
                                        {this.state.errorInfo.componentStack}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                                >
                                    Reload Page
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.reload();
                                    }}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
                                >
                                    Clear Cache & Reload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
