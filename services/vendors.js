import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import {Payments} from './vendor-payments'
import { defDateFormat } from './def-date-format'

export class Vendors {
  constructor (aPath) {
    this._items = JSON.parse(fs.readFileSync(path.format({ dir: aPath, base: 'vendors.json'})))

    this._payments = new Payments(aPath)

    this._items.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
      item.payments = this._payments.filterByVendor(item.id)
    })
  }

  filterByResource (id) {
    return _.filter(this._items, (item) => item.resource === id)
  }
}
