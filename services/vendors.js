import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import Moment from 'moment-business-days'
import { Payments } from './vendor-payments'
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
    _items = JSON.parse(fs.readFileSync(aFile))

    _payments = new Payments(this._aPath)

    _items.map((item) => {
      item.date = new Moment(item.date, defDateFormat)
      item.payments = _payments.filterByVendor(item.id)
    })
  }

  filterByResource (id) {
    return _.filter(_items, (item) => item.resource === id)
  }

  get vendors () {
    return _items
  }

  findById (id) {
    return _.find(_items, { id })
  }

  /**
   * Рассчитать дату начала заказа с учетом времени доставки и производства (выполнения заказа)
   * @param vendorId    поставщик
   * @param date        дата завершения заказа
   * @return {moment | moment.Moment | module:moment}   дата начала заказа
   */
  calculateOrderStartDate (vendorId, date) {
    const vendor = this.findById(vendorId)
    if (!vendor) {
      throw new Error(`Vendor with id=${vendorId} not found`)
    }
    const supplyStart = new Moment(date)
    // вычтем из конечной даты длительность заказа
    vendor.inWorkingDays
      ? supplyStart.businessSubtract(vendor.orderDuration)
      : supplyStart.subtract(vendor.orderDuration, 'days')
    // вычтем длительность доставки:
    vendor.deliveryInWorkingDays
      ? supplyStart.businessSubtract(vendor.deliveryDuration)
      : supplyStart.subtract(vendor.deliveryDuration, 'days')
    return supplyStart
  }

  /**
   * Выбрать поставщика
   * @param resourceId  Ресурс
   * @param date        Дата поставки
   */
  selectVendor (resourceId, date) {
    // получить список поставщиков этого ресурса, сортированный по дате (от самых последних к более ранним)
    console.log(`Select vendor: res=${resourceId}, date=${date.format('DD-MM-YYYY')}`)
    const resVendors = _.orderBy(this.filterByResource(resourceId), ['date', 'id'], ['desc', 'asc'])
    let selectedVendor = null

    if (resVendors.some((vendor) => {
      console.log(`testing vendor: ${vendor.caption} (from ${vendor.date.format('DD-MM-YYYY')})`)
      // проверим этого вендора на пригодность по дате поставки:
      const supplyStart = this.calculateOrderStartDate(vendor.id, date)
      console.log(`calculated supplystart is ${supplyStart.format('DD-MM-YYYY')}`)
      // теперь в supplyStart находится самая ранняя дата доставки для этого вендора
      if (supplyStart.isSameOrAfter(vendor.date)) {
        console.log('vendor selected')
        selectedVendor = vendor
        return true
      }
      return false
    })) {
      return selectedVendor
    }
    return null
  }
}
