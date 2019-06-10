import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import {Payments} from './vendor-payments'
import { defDateFormat } from './def-date-format'

let _items = []
let _payments = {}

export class Vendors {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromfile(path.format({ dir: aPath, base: 'vendors.json' }))
    }
  }

  loadFromfile (aFile) {
    _items = JSON.parse(fs.readFileSync())

    _payments = new Payments(this._aPath)

    _items.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
      item.payments = _payments.filterByVendor(item.id)
    })
  }

  filterByResource (id) {
    return _.filter(this._items, (item) => item.resource === id)
  }

  get vendors () {
    return _items
  }
}
