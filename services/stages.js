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
  }

  filterByProduct (productId) {
    const aStages = _.filter(_items, (stage) => stage.product === productId)
    aStages.map((stage) => { stage.resources = _stageResources.filterByStage(stage.id) })
    return aStages
  }

  get stages () {
    return _items
  }
}
