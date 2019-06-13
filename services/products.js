import fs from 'fs'
import path from 'path'
import Moment from 'moment-business-days'
import _ from 'lodash'
import { Stages } from './stages'
import { Stock } from './product-stock'
import { defDateFormat } from './def-date-format.js'

let _items = []
let _stages = {}
let _stock = {}

export class Products {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'products.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))

    _stages = new Stages(this._aPath)
    _stock = new Stock(this._aPath)
    _items.map((product) => {
      product.initialDate = new Moment(product.initialDate, defDateFormat)
      product.stages = _stages.filterByProduct(product.id)
      product.stock = _stock.filterByProduct(product.id)
    })
  }

  findById (id) {
    return _.find(_items, { id })
  }

  filterByProduct (productId) {
    return _.filter(_items, (item) => item.id === productId)
  }

  stockQntForDate (productId, date) {
    let qnt = 0
    _stock.filterByProduct(productId).map((item) => {
      if (item.date.isSameOrBefore(date)) {
        qnt += item.qnt
      }
    })
    return qnt
  }

  prodDuration (productId) {
    let i = 0
    _stages.filterByProduct(productId).map((stage) => {
      i += stage.duration
    })
    return i
  }

  /**
   * planProduction: Запланировать производство партии продукции:
   * @param productId   код продукта
   * @param date    дата, к которой партия долюна быть произведения (возможно Moment)
   * @param qnt     количество продукции для производства
   *
   * @returns Plans object
   */
  planProduction (productId, date, qnt) {
    // получить продукт, производство которого планируем
    const product = this.findById(productId)

    // добавить запись о планах производства продукции в остатки
    const stock = new Stock() // get stock API:
    stock.create({ type: 'prod', product: product.id, date: new Moment(date), qnt })

    // спланируем производство партии продукции
    // рассчитаем дату начала этапа:
    const duration = this.prodDuration(productId)
    let startDate = {}
    const endDate = new Moment(date)
    if (product.inWorkingDays) {
      startDate = endDate.businessSubtract(duration)
    } else {
      startDate = endDate.subtract(duration, 'days')
    }
    console.log(`startDate: ${startDate.format('DD-MM-YYYY')}`)

    // получим список этапов производства
    const stages = new Stages() // получим доступ к API
    // отсортируем список этапов по порядку (и по идентификаторам)
    _.orderBy(stages.filterByProduct(productId), ['order', 'id']).map((stage) => {
      // для этого этапа получим список требуемых ресурсов
    })

  }

  get products () {
    return _items
  }
}
