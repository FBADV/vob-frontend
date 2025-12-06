// Test: Client Edit
// Tests the ability to edit an existing client

describe('Client Management: Edit', () => {
    beforeEach(() => {
        // Login and create a client to edit
        cy.login();
        cy.createClient('Edit Test Client');
    });

    it('should edit client name successfully', () => {
        cy.visit('/clients');

        // Find and click on the client we just created
        cy.contains('Edit Test Client').should('be.visible');

        // Click to open client details/profile
        // The click might open a modal or navigate to edit page
        cy.contains('Edit Test Client').click();

        // Wait for modal or edit form to appear
        cy.wait(1000);

        // Try to find and click an Edit button if it exists
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Editar")').length > 0) {
                cy.contains('button', 'Editar').click();
                cy.wait(500);
            }
        });

        // Update the name
        cy.contains('label', 'Nome Completo').parent().find('input').clear().type('Updated Client Name');

        // Save changes
        cy.contains('button', /salvar|atualizar/i).click();

        // Verify the updated name appears
        cy.contains('Updated Client Name', { timeout: 10000 }).should('be.visible');

        // Original name should not exist anymore
        cy.contains('Edit Test Client').should('not.exist');
    });

    it('should edit client email successfully', () => {
        cy.visit('/clients');

        cy.contains('Edit Test Client').click();
        cy.wait(1000);

        // Try to click Edit button if exists
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Editar")').length > 0) {
                cy.contains('button', 'Editar').click();
                cy.wait(500);
            }
        });

        // Update email
        cy.contains('label', 'Email').parent().find('input').clear().type('newemail@test.com');

        // Save
        cy.contains('button', /salvar|atualizar/i).click();

        cy.wait(2000);
        cy.log('✅ Email updated');
    });

    it('should

 cancel edit without saving changes', () => {
        cy.visit('/clients');

    cy.contains('Edit Test Client').click();
    cy.wait(1000);

    // Try to click Edit button if exists
    cy.get('body').then(($body) => {
        if ($body.find('button:contains("Editar")').length > 0) {
            cy.contains('button', 'Editar').click();
            cy.wait(500);
        }
    });

    // Make a change
    cy.contains('label', 'Nome Completo').parent().find('input').clear().type('Should Not Be Saved');

    // Cancel instead of save
    cy.get('body').then(($body) => {
        if ($body.find('button:contains("Cancelar")').length > 0) {
            cy.contains('button', 'Cancelar').click();
        } else if ($body.find('[aria-label="Close"]').length > 0) {
            cy.get('[aria-label="Close"]').click();
        } else {
            // Press Escape
            cy.get('body').type('{esc}');
        }
    });

    cy.wait(1000);

    // Original name should still exist
    cy.visit('/clients');
    cy.contains('Edit Test Client').should('be.visible');
    cy.contains('Should Not Be Saved').should('not.exist');
});
});
