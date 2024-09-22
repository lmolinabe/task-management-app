describe('Task Management', () => {
    const now = new Date();
    const formattedDate = now.getFullYear().toString() +
                          (now.getMonth() + 1).toString().padStart(2, '0') +
                          now.getDate().toString().padStart(2, '0') +
                          now.getHours().toString().padStart(2, '0') +
                          now.getMinutes().toString().padStart(2, '0') +
                          now.getSeconds().toString().padStart(2, '0') +
                          now.getMilliseconds().toString().padStart(3, '0');
    const mockTaskTitle = `My Test Task ${formattedDate}`;

    beforeEach(() => {
      // Log in before each test (you can use a custom command for this)
      cy.signup('testuser@example.com', 'testuser@example.com', 'P@ssword12345');
      cy.login('testuser@example.com', 'P@ssword12345');
      cy.visit('/tasks');
    });
  
    it('should allow a user to create a new task', () => {
      // Click the add button
      cy.get('#new-task-button').click();
      cy.get('#title').type(mockTaskTitle);
      cy.get('#description').type('This is my test task.');
      cy.get('#dueDate').type('2099-01-01'); // Adjust date format as needed
      cy.get('#save-button').click();
      cy.contains(mockTaskTitle).should('exist');
    });
  
    it('should allow a user to edit an existing task', () => {
      // Click the delete button of the existing task
      cy.get('.update-button').first().click();
      cy.get('#description').clear().type('This is my updated test task.');
      cy.get('#save-button').click();
      cy.contains('This is my updated test task.').should('exist');
    });
  
    it('should allow a user to delete an existing task', () => {
      // Click the delete button of the existing task
      cy.get('.delete-button').first().click();
      cy.get('#confirm-button').click();
      cy.contains(mockTaskTitle).should('not.exist');
    });
  });