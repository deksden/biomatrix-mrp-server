import fs from 'fs'
import path from 'path'

export class Products {
  constructor (fileName) {
    this._fileName = fileName
    this._path = path.dirname(fileName)
    this._products = JSON.parse(fs.readFileSync(fileName))
    this._stock = JSON.parse(fs.readFileSync(path.format({ dir: this._path, base: 'product-stock.json'})))
    this._stages = JSON.parse(fs.readFileSync(path.format({ dir: this._path, base: 'stages.json'})))
    this._stageResources = JSON.parse(fs.readFileSync(path.format({ dir: this._path, base: 'stage-resources.json'})))
  }
}