# Database Schema User

![Database Schema](images/database-schema-user.png)

# Database Area description: User

## User instance

A user is either the Applicant that wants to apply for an application (Registration) in the system or the other entities (i.e. Reviewer) that will evaluate the application. What will define exact the type of user are permissions (`permission_join`) which is associated with the user and the organisation of the user. So the same user may have different operations available depending on the organisation they selected on login.

### user

The `username` is what the user will use to login to the system and the name that show on the User area.

The `password` is the secret used by the user to login - which should be stored using some encryption to be defined.

The `email` might be also used to login the user to the system. The email is confirmed before the account is activated.

**To be considered:**

- A few more fields will be required in the user table, to be added as needed.

### organisation

The `name` is how the organisation is defined in the system.

The `registration` is an organisation's unique code. It will probably be the registration number of the organisation's company registration for that country, but not necessarily.

The `address` is the physical address where the organisation can be found in the country.

**To be considered:**

- A few more fields will be required in the user table, to be added as needed.
- The `registration` could be stored in a different table that have the `organisation_id`, the license number, expiry and if it's valid. This way when a organisation license is renewed we can create a new entry and link to the organisation, keeping track of old licenses.

### user organisation

The `user_id` links to the user table.

The `organisation_id` links to the organistion.

The `user_role` is just a literal for now that states this user's role in the organisation. It is created based on what permissions the user has to act as the organisation. For example a user that creates the organisation in the system can be the **Organisation Owner** and another user that joins the organisation by default can be an **Employee** or **Member**. Another example is the user that is part of FDA and when associated with the main organisation in the system the default job is **Reviewer**.
