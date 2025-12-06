/// <reference types="cypress" />

// ***********************************************
// Custom Commands for VOB E2E Tests
// ***********************************************

/**
 * Login using activation flow
 * @example cy.login()
 */
Cypress.Commands.add('login', () => {
    cy.visit('/');
    cy.contains('button', 'Primeiro acesso? Ativar conta', { timeout: 15000 }).click();
    cy.get('input[placeholder="XXXX-XXXX"]').type('MANDAKARU-2025');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', 'Ativar Conta').click();
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
});

/**
 * Create a client with given name
 * @param name - Client name
 * @example cy.createClient('John Doe')
 */
Cypress.Commands.add('createClient', (name: string) => {
    cy.visit('/clients');
    cy.contains('Novo Cliente').click();

    const cleanName = name.replace(/\s+/g, '');
    cy.contains('label', 'Nome Completo').parent().find('input').type(name);
    cy.contains('label', 'Email').parent().find('input').type(`${cleanName}@test.com`);
    cy.contains('label', 'Telefone / WhatsApp').parent().find('input').type('11999999999');
    cy.contains('label', 'CPF').parent().find('input').type('123.456.789-00');
    cy.contains('button', 'Criar Cliente').click();

    // Wait for modal to close
    cy.contains('button', 'Criar Cliente', { timeout: 10000 }).should('not.exist');
    cy.contains(name, { timeout: 10000 }).should('be.visible');

    // CRITICAL: Wait for client to be available in selects
    cy.wait(3000);
});

/**
 * Create a process for the first available client
 * @param processNumber - Process number
 * @param processTitle - Process title
 * @example cy.createProcess('123456', 'Test Process')
 */
Cypress.Commands.add('createProcess', (processNumber: string, processTitle: string) => {
    cy.visit('/processes');
    cy.contains('Novo Processo', { timeout: 10000 }).click();

    // Wait for form to load
    cy.contains('label', 'Cliente', { timeout: 5000 }).should('be.visible');

    // Fill form
    cy.contains('label', 'Título do Processo').parent().find('input').type(processTitle);
    cy.contains('label', 'Número do Processo').parent().parent().find('input').first().type(processNumber);

    // Select first client
    cy.contains('label', 'Cliente').scrollIntoView();
    cy.wait(500);
    cy.contains('label', 'Cliente').parent().parent().find('select').then($select => {
        const options = $select.find('option');
        if (options.length > 1) {
            const firstClientValue = options.eq(1).val();
            cy.wrap($select).select(firstClientValue as string, { force: true });
        }
    });

    cy.wait(1000);

    // Save
    cy.contains('button', 'Salvar Processo').scrollIntoView({ duration: 500 });
    cy.wait(1000);
    cy.contains('button', 'Salvar Processo').click({ force: true });

    // Wait for save
    cy.wait(5000);
});
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
