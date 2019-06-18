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

  stockQntForDate (resourceId, date) {
    let qnt = 0
    _.orderBy(_stock.filterByResource(resourceId), ['date', 'id']).map((item) => {
      if (item.date.isSameOrBefore(date)) {
        qnt += item.qnt
      }
    })
    return qnt
  }

  /**
   * Запланировать заказ ресурсов
   * @param resourceId  ресурс для заказа
   * @param date        дата когда он должен поступить на склад
   * @param qnt         количество ресурсов, которое в указанную дату должно быть на складе
   */
  planOrderRes (resourceId, date, qnt) {
    // подключим нужные API:
    const vendorsAPI = new Vendors()
    const resourceStockAPI = new Stock()
    const resource = this.findById(resourceId)

    console.log(`Planning order: res ${resource.caption} ${date.format('DD-MM-YYYY')} qnt=${qnt}`)

    // выбрать вендора для этой поставки:
    const vendor = vendorsAPI.selectVendor(resourceId, date)

    if (!vendor) {
      throw new Error('Vendor not found')
    }
    console.log(`Vendor selected: ${vendor.caption}`)
    // рассчитаем количество ресурса для заказа:
    let orderQnt = vendor.orderMin
    while (orderQnt < qnt) {
      orderQnt += vendor.orderStep
    }
    console.log(`Order qnt calculated: ${orderQnt}`)

    const startDate = vendorsAPI.calculateOrderStartDate(vendor.id, date)
    console.log(`Ordered: ${startDate.format(defDateFormat)} qnt=${orderQnt} price=${vendor.invoicePrice}`)
    // записать заказ ресурса в список партий:
    return resourceStockAPI.create({
      type: 'order',
      resource: resourceId,
      date: startDate,
      qnt: orderQnt,
      price: vendor.invoicePrice
    })
  }
}
