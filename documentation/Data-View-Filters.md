# Data View Filters

Data View Tables can be filtered, sorted and searched comprehensively in the front end. However, since the type and structure of the data being displayed could be anything, we sometimes need to give explicit definitions of exactly how filtering, searching and sorting should work -- although the defaults are often fine in simple cases.

<!-- toc -->
## Contents <!-- omit in toc -->
- [Search](#search)
- [Sorting](#sorting)
- [Filters](#filters)
- [Handling complex data structures](#handling-complex-data-structures)

*Please ensure you are familiar with how [Data View and Data View Column Definitions](Data-View.md) work in general before diving into filter definitions here*

## Search

The front-end can display a standard "Search" input field at the top of the table for quick search-based filtering of the table results. However, you need to configure exactly what is being searched.

This is done by specifying an array of searchable fields in the `table_search_columns` field of the `data_view` table.

E.g. in a "Users" table, the `table_search_columns` might be:  
`[ fullName, email ]`

Any text entered into the Search input will be matched to the values of these columns, using partial string matching (case insensitive):

- search text "arl" would match "Carl", "Arlo", "earl@myplace.com"

These searches *only* use text matching though, so the specified search columns should contain text data. If you need to narrow the results by more complex data structures, then you can specify [Filter definitions](#filters)

If no `table_search_columns` (i.e. `null`) are provided, the "Search" input will not appear in the front end.

## Sorting

In the front-end, clicking on a column header will sort the table by that column (and clicking again reverses the order). If the column is a "basic" column (i.e. maps to an actual database column), then the default sort should be adequate, and no specific definition is required. However, if you have a column whose data is defined by a [value_expression](Data-View.md#data_view_column_definition-table) then you will need to define how it should be sorted. (If not, then the user will receive a "Column not sortable" notification when they try to sort by it.)

We do this by specifying *another* column in the field `sort_column` for `data_view_column_definition`s, which is what the database will sort by when clicking on this column.

For example, if you have an "Address" column, that is build by combining a number of different fields (e.g. `address`, `province`, `country`), then you could specify any one of these as the value to sort by when clicking your custom "Address" column.

It's also possible to convert complex data types to simplified "text" (or other simple data) versions of the values (see [Handling complex data structures](#handling-complex-data-structures) for more info), in which case you can specify this simplified column as the sort column for the more complex display value.

## Filters



## Handling complex data structures