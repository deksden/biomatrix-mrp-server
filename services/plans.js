import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { Products } from './products'
import { defDateFormat } from './def-date-format'

let _items = []
let _products = {}

/** Class representing commertial plans */
export class Plans {
  /**
   * Create Plans object
   * @param aPath path to directory with all .json files. Plans will be loaded from plans.json
   */
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'plan.json' }))
    }
  }

  /** Load data from file
   * @param aFile filename to load data from
   */
  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
    _products = new Products(this._aPath)
    _items.map((item) => {
      item.date = Moment(item.date, defDateFormat)
      item.products = _products.filterByProduct(item.product)
    })
  }

  /**
   * Calculate qnt of planned sales to specified date
   * @param {number} productId   id of a product
   * @param {Moment} date       date on which calculation is done
   * @return {number} qnt of products planned to sold before specified date
   */
  qntForDate (productId, date) {
    let qnt = 0
    _items.map((item) => {
      if (item.product === productId && item.date.isSameOrBefore(date)) {
        qnt += item.qnt
      }
    })
    return qnt
  }

  get plan () {
    return _items
  }

  get sortedByDate () {
    return _.orderBy(_items, ['date', 'product', 'qnt'])
  }
}
