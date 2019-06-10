import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import _ from 'lodash'
import { Stages } from './stages'
import { Stock } from './product-stock'
import { defDateFormat } from './def-date-format.js'

let _products = []
let _stages = {}
let _stock = {}

export class Products {
  constructor (fileName) {
    this.loadFromFile(fileName)
  }

  loadFromFile (aFile) {
    this._path = path.dirname(aFile)
    _products = JSON.parse(fs.readFileSync(aFile))

    _stages = new Stages(this._path)
    _stock = new Stock(this._path)
    _products.map((product) => {
      product.initialDate = new Moment(product.initialDate, defDateFormat)
      product.stages = _stages.filterByProduct(product.id)
      product.stock = _stock.filterByProduct(product.id)
    })
  }

  findById (id) {
    return _.find(this._products, { id })
  }

  get products () {
    return _products
  }

  get stages () {
    return _stages
  }

  get stock () {
    return _stock
  }
}
