import React from 'react';
import { useModal } from '../context/ModalContext';
import { ClientFormModal } from './ClientFormModal';
import { ProcessFormModal } from './ProcessFormModal';
import { EventModal } from './EventModal';
import { ServiceFormModal } from './ServiceFormModal';
import { ProcessDetailsModal } from './ProcessDetailsModal';

export const GlobalModals: React.FC = () => {
    const { activeModal, modalData, closeModal } = useModal();

    return (
        <>
            <ClientFormModal
                isOpen={activeModal === 'client'}
                onClose={closeModal}
                clientToEdit={modalData}
            />
            <ProcessFormModal
                isOpen={activeModal === 'process'}
                onClose={closeModal}
            />
            <EventModal
                isOpen={activeModal === 'event'}
                onClose={closeModal}
                eventToEdit={modalData}
            />
            <ServiceFormModal
                isOpen={activeModal === 'service'}
                onClose={closeModal}
                serviceToEdit={modalData}
            />
            {activeModal === 'processDetails' && modalData && (
                <ProcessDetailsModal
                    isOpen={true}
                    onClose={closeModal}
                    process={modalData}
                />
            )}
        </>
    );
};
