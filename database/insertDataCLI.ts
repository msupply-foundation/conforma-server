import insertData from './insertData'
/* Note: this file should have the same relative path route to `database` as server (i.e. ../database) */
insertData(process.argv[2] || 'dev')
