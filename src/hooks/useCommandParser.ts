import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useCallback } from 'react';

type CommandAction = () => void;

interface Command {
    keywords: string[];
    action: CommandAction;
    description: string;
}

export const useCommandParser = () => {
    const navigate = useNavigate();
    const { openModal } = useModal();

    const commands: Command[] = [
        // Navigation
        {
            keywords: ['ir para dashboard', 'abrir dashboard', 'início', 'home', 'tela inicial'],
            action: () => navigate('/'),
            description: 'Ir para o Dashboard'
        },
        {
            keywords: ['ir para clientes', 'abrir clientes', 'listar clientes', 'meus clientes'],
            action: () => navigate('/clients'),
            description: 'Ir para Clientes'
        },
        {
            keywords: ['ir para processos', 'abrir processos', 'listar processos', 'meus processos'],
            action: () => navigate('/processes'),
            description: 'Ir para Processos'
        },
        {
            keywords: ['ir para agenda', 'abrir agenda', 'calendário', 'meus compromissos'],
            action: () => navigate('/agenda'),
            description: 'Ir para Agenda'
        },
        {
            keywords: ['ir para financeiro', 'abrir financeiro', 'minhas finanças'],
            action: () => navigate('/financial'),
            description: 'Ir para Financeiro'
        },
        {
            keywords: ['ir para chat', 'abrir chat', 'mensagens', 'conversas'],
            action: () => navigate('/chat'),
            description: 'Ir para Chat'
        },
        {
            keywords: ['ir para configurações', 'abrir configurações', 'ajustes', 'opções'],
            action: () => navigate('/settings'),
            description: 'Ir para Configurações'
        },

        // Creation
        {
            keywords: ['novo cliente', 'adicionar cliente', 'cadastrar cliente', 'criar cliente'],
            action: () => openModal('client'),
            description: 'Novo Cliente'
        },
        {
            keywords: ['novo processo', 'adicionar processo', 'cadastrar processo', 'criar processo'],
            action: () => openModal('process'),
            description: 'Novo Processo'
        },
        {
            keywords: ['novo atendimento', 'adicionar atendimento', 'novo serviço', 'criar atendimento'],
            action: () => openModal('service'),
            description: 'Novo Atendimento'
        },
        {
            keywords: ['nova tarefa', 'adicionar tarefa', 'novo compromisso', 'criar tarefa', 'agendar'],
            action: () => openModal('event'),
            description: 'Nova Tarefa'
        }
    ];

    const processCommand = useCallback((transcript: string): { executed: boolean; command?: string } => {
        const lowerTranscript = transcript.toLowerCase().trim();

        // Check for matches
        // We prioritize longer matches or specific keywords if needed, but for now simple inclusion is fine
        // because the keywords are quite distinct.

        for (const cmd of commands) {
            for (const keyword of cmd.keywords) {
                if (lowerTranscript.includes(keyword)) {
                    cmd.action();
                    return { executed: true, command: cmd.description };
                }
            }
        }

        return { executed: false };
    }, [navigate, openModal]);

    return { processCommand };
};
