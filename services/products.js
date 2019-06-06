import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import _ from 'lodash'
import {Stages} from './stages'
import {Stock} from './product-stock'
import {defDateFormat} from './def-date-format.js'

export class Products {
  constructor (fileName) {
    this._fileName = fileName
    this._path = path.dirname(fileName)
    this._products = JSON.parse(fs.readFileSync(fileName))

    this._stages = new Stages(this._path)
    this._stock = new Stock(this._path)
    this._products.map((product) => {
      product.initialDate = new Moment(product.initialDate, defDateFormat)
      product.stages = this._stages.filterByProduct(product.id)
      product.stock = this._stock.filterByProduct(product.id)
    })
  }

  findById(id) {
    return _.find(this._products, { id })
  }

  get products() {
    return this._products
  }

  get stages() {
    return this._stages
  }

  get stock() {
    return this._stock
  }
}