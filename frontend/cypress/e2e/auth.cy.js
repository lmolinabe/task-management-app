describe('Authentication', () => {
    const now = new Date();
    const formattedDate = now.getFullYear().toString() +
                          (now.getMonth() + 1).toString().padStart(2, '0') +
                          now.getDate().toString().padStart(2, '0') +
                          now.getHours().toString().padStart(2, '0') +
                          now.getMinutes().toString().padStart(2, '0') +
                          now.getSeconds().toString().padStart(2, '0') +
                          now.getMilliseconds().toString().padStart(3, '0');
    const mockEmail = `test.user.${formattedDate}@example.com`;

    it('should allow a new user to sign up', () => {
      cy.visit('/signup');
      cy.get('input[placeholder="Name"]').type('Test User');
      cy.get('input[placeholder="Email"]').type(mockEmail);
      cy.get('input[placeholder="Password"]').type('P@ssword12345');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/login');
    });
  
    it('should allow an existing user to log in', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Email"]').type(mockEmail);
      cy.get('input[placeholder="Password').type('P@ssword12345');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should allow a logged-in user to log out', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Email"]').type(mockEmail);
      cy.get('input[placeholder="Password"]').type('P@ssword12345');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('a:contains("Logout")').click();
      cy.url().should('include', '/login');
    });
  });  