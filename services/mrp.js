import { Products } from './products'

/*

Загрузить ресурсы
Загрузить продукцию
Загрузить партии ресурсов
Загрузить списание партий ресурсов

* */

export const Mrp = (fileName) => {
  return new Products(fileName)
}

module.exports = Mrp