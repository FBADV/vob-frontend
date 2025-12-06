// Debug test to see what's happening with process creation
describe('Debug: Process Creation', () => {
    it('should help debug process creation', () => {
        // Login first
        cy.visit('/');
        cy.contains('button', 'Primeiro acesso? Ativar conta', { timeout: 15000 }).click();
        cy.get('input[placeholder="XXXX-XXXX"]').type('MANDAKARU-2025');
        cy.get('input[type="password"]').type('password123');
        cy.contains('button', 'Ativar Conta').click();
        cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');

        // Create a client first!
        cy.visit('/clients');
        cy.contains('Novo Cliente').click();
        cy.contains('label', 'Nome Completo').parent().find('input').type('Debug Test Client');
        cy.contains('label', 'Email').parent().find('input').type('debug@test.com');
        cy.contains('label', 'Telefone / WhatsApp').parent().find('input').type('11999999999');
        cy.contains('label', 'CPF').parent().find('input').type('123.456.789-00');
        cy.contains('button', 'Criar Cliente').click();
        cy.wait(3000); // Wait for client to be created

        // Go to processes
        cy.visit('/processes');
        cy.wait(2000);

        // Take screenshot of initial state
        cy.screenshot('1-processes-initial');

        // Click New Process
        cy.contains('Novo Processo').click();
        cy.wait(2000);

        // Take screenshot of modal
        cy.screenshot('2-modal-opened');

        // Fill ONLY the absolute minimum
        cy.contains('label', 'Número do Processo').parent().parent().find('input').first().type('123456789');
        cy.screenshot('3-after-number');

        cy.contains('label', 'Título do Processo').parent().find('input').type('Test Process Debug');
        cy.screenshot('4-after-title');

        // Select first client
        cy.contains('label', 'Cliente').parent().parent().find('select').select(1, { force: true });
        cy.wait(1000);
        cy.screenshot('5-after-client-selection');

        // Check console for errors
        cy.window().then((win) => {
            cy.log('Console errors check');
        });

        // Scroll to save button
        cy.contains('button', 'Salvar Processo').scrollIntoView({ duration: 500 });
        cy.wait(1000);
        cy.screenshot('6-before-save');

        // Click save
        cy.contains('button', 'Salvar Processo').click({ force: true });
        cy.wait(8000); // Long wait

        cy.screenshot('7-after-save-click');

        // Check if still on page or modal
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Salvar Processo")').length) {
                cy.log('⚠️ Modal still open - save might have failed');
                cy.screenshot('8-modal-still-open');
            } else {
                cy.log('✅ Modal closed');
            }
        });

        // Go to processes page
        cy.visit('/processes');
        cy.wait(3000);
        cy.screenshot('9-processes-after-save');
    });
});
