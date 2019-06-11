import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { Products } from './products'
import { defDateFormat } from './def-date-format'

let _items = []
let _products = {}

export class Plans {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'plan.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
    _products = new Products(this._aPath)
    _items.map((item) => {
      item.date = Moment(item.date, defDateFormat)
      item.products = _products.filterByProduct(item.product)
    })
  }

  get plan () {
    return _items
  }

  get sortedByDate () {
    return _.orderBy(_items, ['date', 'product', 'qnt'])
  }
}
