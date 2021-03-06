import { Plans } from './plans'

/*

Загрузить ресурсы
Загрузить продукцию
Загрузить партии ресурсов
Загрузить списание партий ресурсов

* */

import { Products } from './products'

export const Mrp = (aPath) => {
  // load plans
  const plans = new Plans(aPath)
  const errors = []

  // обработать все планы в хронологическом порядке:
  plans.sortedByDate.map((plan) => {
    // получаем сведения о продукте
    const products = new Products() // берем API products
    const product = products.findById(plan.product)

    // на каждую дату вычисляем на эту дату остаток товара на складе и планы продаж.
    const stockQnt = products.stockQntForDate(plan.product, plan.date)
    const planQnt = plans.qntForDate(plan.product, plan.date)

    // смотрим текущее сальдо между продажами и производством
    const currentQnt = stockQnt - planQnt
    console.log(`\nproduct "${product.caption}", ${plan.date.format('DD-MM-YYYY')}: stock ${stockQnt}, plan ${planQnt} = ${currentQnt}`)

    if (currentQnt <= product.qntMin) {
      // если текущее сальдо меньше минимального остатка на складе, нужно планировать партию продукции:
      console.log(`Need production: minQnt ${product.qntMin}`)

      const plannedProd = products.planProduction(product.id, plan.date, Math.abs(currentQnt))
      const prodDuration = products.prodDuration(product.id)
      console.log(`Production qnt: ${plannedProd.qntForProd}, ${prodDuration}${product.inWorkingDays ? 'wd' : 'd'}`)
    }
  })

  return plans
}

module.exports = Mrp
