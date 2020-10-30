## List of Action plugins created to-date:

- **Console Log**: Just prints a message to the console. For demo purposes only.

- **Create User**: creates a new User in the database based on user input parameters.

- **Create User From Application**: Creates a new User in the database using only the `id` of a User Registration application. (Difference between this and the previous is this one doesn't require complicated expressions for the paramaters as the heavy lifting to look up the user's responses is done within the plugin.)

- **Change Outcome**: Set the Outcome of an application to the input parameter ("Pending", "Approved", "Rejected")

- **Increment Stage**: Changes the application Stage to the next in the sequence
  - Should be a default Action for all templates `onApplicationCreate`
  - If a new application, will create a corresponding Status set to "Draft"
  - If application is already on final stage, will leave unchanged
- **Change Status**: Changes the application Status to the specifed input parameter
