import fs from 'fs'
import path from 'path'
import Moment from 'moment-business-days'
import _ from 'lodash'
import { Stages } from './stages'
import { Stock } from './product-stock'
import { Stock as ResourceStock } from './resource-stock'
import { defDateFormat } from './def-date-format.js'
import { StageResources } from './stage-resources'
import { Resources } from './resources'

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
    const ret = {}

    console.log(`\nPlanning production ${product.caption} ${date.format('DD-MM-YYYY')} qnt=${qnt}`)

    let qntForProd = product.qntStep
    while (qntForProd < (qnt + product.qntMin)) {
      qntForProd += product.qntStep
    }
    console.log(`prodQnt = ${qntForProd}`)
    ret.qntForProd = qntForProd

    // добавить запись о планах производства продукции в остатки
    const stock = new Stock() // get stock API:
    stock.create({ type: 'prod', product: product.id, date: new Moment(date), qnt })

    // спланируем производство партии продукции
    // рассчитаем дату начала этапа:
    const duration = this.prodDuration(productId)
    let startDate
    const endDate = new Moment(date)
    if (product.inWorkingDays) {
      startDate = endDate.businessSubtract(duration)
    } else {
      startDate = endDate.subtract(duration, 'days')
    }
    console.log(`startDate: ${startDate.format('DD-MM-YYYY')}`)

    // получим список этапов производства
    const stagesAPI = new Stages() // получим доступ к нужным API
    const stageResourcesAPI = new StageResources()
    const resourcesAPI = new Resources()
    const resourceStockAPI = new ResourceStock()

    // начальная дата производства и первого этапа:
    let stageStart = new Moment(startDate)
    // отсортируем список этапов по порядку (и по идентификаторам)
    _.orderBy(stagesAPI.filterByProduct(productId), ['order', 'id']).map((stage) => {
      // для этого этапа получим список требуемых ресурсов
      console.log(`stage: ${stage.order} "${stage.caption}"`)
      const stageResources = stageResourcesAPI.filterByStage(stage.id)

      // обработаем список ресурсов
      stageResources.map((stageResource) => {
        // для каждого ресурса получим его количество на складе на начало этапа:
        const stockQnt = resourcesAPI.stockQntForDate(stageResource.resource.id, stageStart)

        // вычислим требуемое количество ресурса для данного этапа
        const reqQnt = qnt / product.baseQnt * stageResource.qnt
        console.log(`Resource: ${stageResource.resource.caption} stock ${stockQnt} req ${reqQnt}`)

        // если есть дефицит ресурсов - спланировать его закупку
        if (reqQnt > (stockQnt - stageResource.resource.minStock)) {
          // заказываем такое количество ресурсов, чтобы на начало этапа было как минимум требуемое количество плюс мин запас
          resourcesAPI.planOrderRes(stageResource.resource.id, stageStart, (reqQnt + stageResource.resource.minStock - stockQnt))
        }

        // увеличить дату на длительность этапа:
        product.inWorkingDays
          ? startDate = startDate.buisnessAdd(stage.duration)
          : startDate = startDate.add(stage.duration, 'days')

        // списать ресурсы на производство датой окончания этапа:
        resourceStockAPI.create({
          resource: stageResource.resource.id,
          type: 'prod',
          date: startDate,
          qnt: -reqQnt,
          comment: `product ${stageResource.resource.id} stage: ${stage.order} ${stage.caption}`
        })
      })
    })
    return ret
  }

  get products () {
    return _items
  }
}
