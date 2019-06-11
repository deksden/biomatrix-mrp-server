import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import _ from 'lodash'
import { Stages } from './stages'
import { Stock } from './product-stock'
import { defDateFormat } from './def-date-format.js'

let _items = []
let _stages = {}
let _stock = {}

export class Products {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'products.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))

    _stages = new Stages(this._aPath)
    _stock = new Stock(this._aPath)
    _items.map((product) => {
      product.initialDate = new Moment(product.initialDate, defDateFormat)
      product.stages = _stages.filterByProduct(product.id)
      product.stock = _stock.filterByProduct(product.id)
    })
  }

  findById (id) {
    return _.find(_items, { id })
  }

  filterByProduct (productId) {
    return _.filter(_items, (item) => item.id === productId)
  }

  stockQntForDate (productId, date) {
    const product = this.findById(productId)
    let qnt = 0
    product.stock.map((item) => {
      if (item.date.isSameOrBefore(date)) {
        qnt += item.qnt
      }
    })
    return qnt
  }

  get products () {
    return _items
  }
}
