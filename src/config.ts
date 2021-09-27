import data from '../config.json'
require('dotenv').config()
const isProductionBuild = process.env.NODE_ENV === 'production'
const config: any = data.server

const {
  graphQLendpoint_production,
  graphQLendpoint_dev,
  nodeModulesFolder_production,
  nodeModulesFolder_dev,
} = data.conditional

config.graphQLendpoint = isProductionBuild ? graphQLendpoint_production : graphQLendpoint_dev

config.nodeModulesFolder = isProductionBuild ? nodeModulesFolder_production : nodeModulesFolder_dev

config.jwtSecret = process.env.JWT_SECRET

export default config
