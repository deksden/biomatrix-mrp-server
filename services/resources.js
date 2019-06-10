import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { defDateFormat } from './def-date-format'
import { Stock } from './resource-stock'
import { Vendors } from './vendors'

let _items = []
let _stock = {}
let _vendors = {}

export class Resources {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'resources.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))

    _stock = new Stock(this._aPath)
    _vendors = new Vendors(this._aPath)

    _items.map((item) => {
      item.initialDate = new Moment(item.initialDate, defDateFormat)
      item.stock = _stock.filterByResource(item.id)
      item.vendors = _vendors.filterByResource(item.id)
    })
  }

  findById (id) {
    return _.find(_items, { id })
  }

  get resources () {
    return _items
  }
}
