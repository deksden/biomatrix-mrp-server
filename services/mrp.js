import { Plans } from './plans'

/*

Загрузить ресурсы
Загрузить продукцию
Загрузить партии ресурсов
Загрузить списание партий ресурсов

* */

import { Products } from './products'

export const Mrp = (aPath) => {
  const plans = new Plans(aPath)

  plans.sortedByDate.map((plan) => {
    // на каждую дату вычисляем остаток товара на складе на эту дату.
    const products = new Products() // берем API products
    const qnt = products.stockQntForDate(plan.product, plan.date)
    console.log(`qnt: ${plan.date.format('DD-MM-YYYY')} -> ${qnt}`)
  })
}

module.exports = Mrp
