/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Login using activation flow
         * @example cy.login()
         */
        login(): Chainable<void>;

        /**
         * Create a client with given name
         * @param name - Client name
         * @example cy.createClient('John Doe')
         */
        createClient(name: string): Chainable<void>;

        /**
         * Create a process for the first available client
         * @param processNumber - Process number
         * @param processTitle - Process title
         * @example cy.createProcess('123456', 'Test Process')
         */
        createProcess(processNumber: string, processTitle: string): Chainable<void>;
    }
}
