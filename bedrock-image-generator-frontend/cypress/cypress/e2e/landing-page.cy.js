describe('Landing Page', () => {
    it('should render landing page', () => {
        cy.visit('http://localhost:3000');

        cy.viewport(1500, 750);

        cy.get('[data-cy="title"]')
            .should('be.visible')
            .and('have.text', 'RockArt');

        cy.get('[data-cy="textfield-prompt"]').should('be.visible');
        cy.get('[data-cy="textfield-negative-text"]').should('be.visible');

        cy.get('[data-cy="num-images-slider"]')
            .find('input[value="1"]')
            .should('be.visible')
            .and('be.enabled');

        cy.get('[data-cy="cfgScale-slider"]')
            .find('input[value="7.5"]')
            .should('be.visible')
            .and('be.enabled');

        cy.get('[data-cy="radio-group"]')
            .should('be.visible');

        cy.get('[data-cy="radio-group"]')
            .find('input[value="landscape"]')
            .should('be.checked')
            .and('be.enabled');

        cy.get('[data-cy="generate-button"]')
            .should('be.visible')
            .and('have.text', 'Generate with Bedrock')
            .and('be.disabled');

        cy.get('[data-cy="reset-button"]')
            .should('be.visible')
            .and('have.text', 'Reset')
            .and('be.disabled');

        cy.get('[data-cy="textfield-prompt"]').type('some text');
        cy.get('[data-cy="title"]').click();

        cy.get('[data-cy="generate-button"]')
            .should('be.enabled');
    })
});