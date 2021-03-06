import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { defDateFormat } from './def-date-format'

let _items = []

export class Stock {
  constructor (aPath) {
    if (aPath) {
      this.loadFromFile(path.format({ dir: aPath, base: 'resource-stock.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
    _items.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
    })
  }

  filterByResource (resourceId) {
    return _.filter(_items, (stock) => stock.resource === resourceId)
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
