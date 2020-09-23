# Database Schema User

![Database Schema](images/database-schema-user.png)

# Database Area description: User

## User instance

An user is either the Applicant that wants to apply to a application (Registration) in the system or other entities that will manage the workflow of the application. For example the Reviewer, Supervisor, Chief and Director are all part of the crew of users with other types of permissions that will be evaluating the Registration applied by Applicant users.

### user

The `username` is what the user will use to login to the system and the name that show on the User area.

The `password` is the secret used by the user to login - which should be stored using some encryption to be defined.

The `email` might be also used to login the user to the system. The email is confirmed before the account is activated.

The `role` doesn't grant the user permissions. It is now only used to easily differ many users.

**To be considered: Use one SQL function to define the role based on user permissions.**

### organisation

### user organisation
