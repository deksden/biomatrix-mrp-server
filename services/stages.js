import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import { StageResources } from './stage-resources'

let _items = []
let _stageResources = {}

export class Stages {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'stages.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
    _stageResources = new StageResources(this._aPath)
    _items.map((stage) => { stage.resources = _stageResources.filterByStage(stage.id) })
  }

  filterByProduct (productId) {
    return _.filter(_items, (stage) => stage.product === productId)
  }

  get stages () {
    return _items
  }
}
