import _ from 'lodash'
import fs from 'fs'
import path from 'path'

export class Payments {
  constructor (aPath) {
    this._items = JSON.parse(fs.readFileSync(path.format({ dir: aPath, base: 'vendor-payments.json'})))
  }

  filterByVendor (id) {
    return _.filter(this._items, (item) => item.vendor === id)
  }

  findById (id) {
    return _.find( this._items, { stage: id })
  }
}
