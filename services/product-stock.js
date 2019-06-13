import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { defDateFormat } from './def-date-format.js'

let _items = []

export class Stock {
  constructor (aPath) {
    if (aPath) {
      this.loadFromFile(path.format({ dir: aPath, base: 'product-stock.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
    _items.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
    })
  }

  filterByProduct (productId) {
    const data = _.filter(_items, (stock) => stock.product === productId)
    return _.orderBy(data, ['date', 'type', 'qnt'])
  }

  create (item) {
    const id = _.maxBy(_items, 'id') + 1
    const aItem = _.merge({ id }, item)
    _items.push(aItem)
    return aItem
  }

  get stock () {
    return _items
  }
}
