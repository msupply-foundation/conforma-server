# Database Schema Template

![Database Schema](images/database-schema-template.png)

## Tables description

### Version
* <b>template version</b>
When the Admin user wants to edit an existing <b>application template</b> a new version is created with `isCurrent` as `false`. 
This new version is linked to a duplication of all records in the <b>application template</b> group. The Admin can continue making changes until publishing when the version gets updated with `isCurrent` as `true`. And now the application linked to this template have a new version.

With this versioning we keep previous finalised applications linked to a correct version of the template form & rules. 
<b>To be considered: Should we check if no applications are associated with an existing template and just add changes to the current version instead?</b>

### Form, sections and fields
* <b>template</b> - Representation of the <b>application template</b>. All nested elements are accessible via joined tables and can be created or queried in the same call using GraphQL engine.

    <b>Fields</b>
    - 
    - 
* <b>template sections</b>
* <b>template elements</b>
* <b>element type plugin</b> 

### Permission settings
* <b>template stage</b>
* <b>template permission</b>
* <b>template review stage</b>

### Triggered actions
* <b>template action</b>
* <b>action plugin</b>