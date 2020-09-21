# Database Schema Permission

![Database Schema](images/database-schema-permission.png)

## Database Area description: Permission

### Definition
To define what applications have what actions available for what user. We like to define the permission definition using: Who, how and what.
Who => Is the `permission_name`, which describes the type of action and user associated.
How => Is the `permission_policy`. What actions the user with this permission can make.
What => Is the `template_permission` that connects a permission with a application or section.

Before any user are included the permissions can be already created. The permission definition consists in the `permission_policy` and the `permission_name`. Then what will link a permission to a application is the `template_permission`.
Later on the `permission_join` is used to grant the permission to a user or user in a company.

After the user grated a permission to do a certain action on applications/sections of the application, these actions will be displayed in the system. There are also SQL policies created to restrict areas of the database that users have access (based on permissions).

## Tables
* **permission policy**
The `name` and `description` of the poliicy helps the user identify the policy details.
The `rules` will define exactly what actions will be allowed on the linked application.
The `type` is the action type, that would be one of the options: `'Apply'`, `'Review'`, `'Assign'`, ...(few more to be added).
The `default_restrictions` is similar to `restrictions` from the template permission. Basically from the whole set of possibilities that the `rules` should allow the user to make actions on a application template, the restrictions will limit when these actions can be done.
More detailed description of template permissions coming soon: `rules`.

* **permission name**
The `policy_id` links to the permission policy.
The `name` should be a short very descriptive name of a generic permission (not based on a individual application template).

* **permission join**
The `permission_name` links to the permission name.
The `user_id` links to a user with this permission granted. (Can be NULL, if is a user_organisation permission)
The `user_organisation_id` links to a user from a company with this permission granted (Can be NULL, if is a user permission).