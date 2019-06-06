import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment'
import { defDateFormat } from './def-date-format'
import { Stock } from './resource-stock'

export class Resources {
  constructor (aPath) {
    this._resources = JSON.parse(fs.readFileSync(path.format({ dir: aPath, base: 'resources.json'})))

    this._stock = new Stock(aPath)

    this._resources.map((item) => {
      item.initialDate = new Moment(item.initialDate, defDateFormat)
      item.stock = this._stock.filterByResource(item.id)
    })
  }

  findById (id) {
    return _.find( this._resources, { id })
  }
}
