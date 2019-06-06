import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import {defDateFormat} from './def-date-format.js'

export class Stock {
  constructor (aPath) {
    this._stock = JSON.parse(fs.readFileSync(path.format({ dir: aPath, base: 'product-stock.json'})))
    this._stock.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
    })
  }

  filterByProduct (productId) {
    return _.filter(this._stock, (stock) => stock.product === productId)
  }
}
