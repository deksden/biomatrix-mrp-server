import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { defDateFormat } from './def-date-format.js'

let _stock = []

export class Stock {
  constructor (aPath) {
    if (aPath) {
      this.loadFromFile(path.format({ dir: aPath, base: 'product-stock.json' }))
    }
  }

  loadFromFile (aFile) {
    _stock = JSON.parse(fs.readFileSync(aFile))
    _stock.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
    })
  }

  filterByProduct (productId) {
    return _.filter(_stock, (stock) => stock.product === productId)
  }

  get items () {
    return _stock
  }
}
