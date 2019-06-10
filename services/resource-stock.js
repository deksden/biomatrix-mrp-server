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
    return _.filter(this._stock, (stock) => stock.resource === resourceId)
  }

  get stock () {
    return _items
  }
}
