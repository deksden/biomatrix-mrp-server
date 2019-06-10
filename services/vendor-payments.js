import _ from 'lodash'
import fs from 'fs'
import path from 'path'

let _items = []

export class Payments {
  constructor (aPath) {
    if (aPath) {
      this.aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'vendor-payments.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
  }

  filterByVendor (id) {
    return _.filter(_items, (item) => item.vendor === id)
  }

  findById (id) {
    return _.find(_items, { stage: id })
  }

  get payments () {
    return _items
  }
}
