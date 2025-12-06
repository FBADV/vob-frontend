import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import api from '../services/api';


interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'lawyer' | 'intern' | 'client';
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    activateAccount: (code: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured. Using mock authentication.');
            // Load mock user from localStorage
            const storedUser = localStorage.getItem('vob_user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }
            setIsLoading(false);
            return;
        }

        // Get initial session
        supabase!.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                loadUserProfile(session.user);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase!.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                loadUserProfile(session.user);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadUserProfile = async (supabaseUser: SupabaseUser) => {
        // In a real app, you'd fetch user profile from a users table
        // For now, we'll create a basic user object
        const userProfile: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
            role: supabaseUser.user_metadata?.role || 'lawyer',
        };
        setUser(userProfile);
    };

    const signIn = async (email: string, password: string) => {
        if (!isSupabaseConfigured()) {
            // Mock login for development
            const mockUser: User = {
                id: 'mock-user-id',
                email,
                name: email.split('@')[0],
                role: 'lawyer',
            };
            setUser(mockUser);
            localStorage.setItem('vob_user', JSON.stringify(mockUser));
            toast.success('Login realizado com sucesso (modo local)');
            return;
        }

        setIsLoading(true);
        try {
            // New Judicial API Login
            // Payload: username/password (OAuth2 Password Request form encoded if strict, but let's try JSON if supported or FormData)
            // The API expects x-www-form-urlencoded
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const { data } = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (data.access_token) {
                localStorage.setItem('vob_token', data.access_token);
                // Set generic user profile
                const userProfile: User = {
                    id: 'jwt-user',
                    email: email,
                    name: 'Advogado',
                    role: 'lawyer',
                };
                setUser(userProfile);
                toast.success('Login via Judicial API realizado!');
            }
        } catch (error: any) {
            console.error('Sign in error:', error);
            toast.error('Erro ao fazer login na API');
            throw error;
        } finally {
            setIsLoading(false);
        }

    };

    const signUp = async (email: string, password: string, name: string) => {
        if (!isSupabaseConfigured()) {
            toast.error('Cadastro não disponível no modo local');
            throw new Error('Supabase not configured');
        }

        setIsLoading(true);
        try {
            const { error } = await supabase!.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: 'lawyer',
                    },
                },
            });

            if (error) throw error;

            toast.success('Cadastro realizado! Verifique seu email para confirmar.');
        } catch (error: any) {
            console.error('Sign up error:', error);
            toast.error(error.message || 'Erro ao criar conta');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        if (!isSupabaseConfigured()) {
            // Mock logout
            setUser(null);
            localStorage.removeItem('vob_user');
            toast.success('Logout realizado');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase!.auth.signOut();
            if (error) throw error;

            setUser(null);
            setSession(null);
            toast.success('Logout realizado com sucesso!');
        } catch (error: any) {
            console.error('Sign out error:', error);
            toast.error(error.message || 'Erro ao fazer logout');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        if (!isSupabaseConfigured()) {
            // Mock reset password
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Email de recuperação enviado para ${email} (simulado)`);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase!.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        } catch (error: any) {
            console.error('Reset password error:', error);
            toast.error(error.message || 'Erro ao enviar email de recuperação');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const activateAccount = async (code: string, _password: string) => {
        setIsLoading(true);
        try {
            // Mock activation logic
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (code === 'MANDAKARU-2025' || code === 'MANDAKARU') {
                const mockUser: User = {
                    id: 'new-user-' + Date.now(),
                    email: 'novo.usuario@vob.com.br',
                    name: 'Novo Usuário',
                    role: 'lawyer',
                };
                setUser(mockUser);
                localStorage.setItem('vob_user', JSON.stringify(mockUser));
                toast.success('Conta ativada com sucesso!');
            } else {
                throw new Error('Código de ativação inválido.');
            }
        } catch (error: any) {
            console.error('Activation error:', error);
            toast.error(error.message || 'Erro ao ativar conta');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        activateAccount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
