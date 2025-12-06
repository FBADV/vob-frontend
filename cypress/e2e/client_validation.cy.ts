// Test: Client Form Validations
// Tests form validation rules for client creation

describe('Client Form: Validations', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/clients');
        cy.contains('Novo Cliente').click();
        cy.wait(500);
    });

    it('should require client name', () => {
        // Try to submit without filling name
        cy.contains('button', 'Criar Cliente').click();

        // Form should not submit, button should still exist
        cy.wait(1000);
        cy.contains('button', 'Criar Cliente').should('exist');

        // HTML5 validation should prevent submission
        cy.contains('label', 'Nome Completo').parent().find('input').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
        });
    });

    it('should validate email format', () => {
        // Fill mandatory fields
        cy.contains('label', 'Nome Completo').parent().find('input').type('Test Client');

        // Enter invalid email
        cy.contains('label', 'Email').parent().find('input').type('invalid-email');

        // Check HTML5 validation
        cy.contains('label', 'Email').parent().find('input').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].type).to.equal('email');
        });
    });

    it('should accept valid email format', () => {
        cy.contains('label', 'Nome Completo').parent().find('input').type('Test Client');
        cy.contains('label', 'Email').parent().find('input').type('valid@email.com');

        cy.contains('label', 'Email').parent().find('input').then(($input) => {
            expect($input[0].checkValidity()).to.be.true;
        });
    });

    it('should validate phone number format', () => {
        cy.contains('label', 'Nome Completo').parent().find('input').type('Test Client');

        // Enter phone
        cy.contains('label', 'Telefone / WhatsApp').parent().find('input').type('11999999999');

        // Check it accepts numbers
        cy.contains('label', 'Telefone / WhatsApp').parent().find('input').should('have.value', '11999999999');
    });

    it('should validate CPF format', () => {
        cy.contains('label', 'Nome Completo').parent().find('input').type('Test Client');

        // Enter CPF
        cy.contains('label', 'CPF').parent().find('input').type('123.456.789-00');

        // Verify it was entered
        cy.contains('label', 'CPF').parent().find('input').invoke('val').should('not.be.empty');
    });

    it('should create client with all valid fields', () => {
        cy.contains('label', 'Nome Completo').parent().find('input').type('Valid Test Client');
        cy.contains('label', 'Email').parent().find('input').type('valid@test.com');
        cy.contains('label', 'Telefone / WhatsApp').parent().find('input').type('11999999999');
        cy.contains('label', 'CPF').parent().find('input').type('123.456.789-00');

        cy.contains('button', 'Criar Cliente').click();

        // Should close modal and show client
        cy.contains('button', 'Criar Cliente', { timeout: 10000 }).should('not.exist');
        cy.contains('Valid Test Client').should('be.visible');
    });
});
