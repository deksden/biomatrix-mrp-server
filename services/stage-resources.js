import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import { Resources } from './resources'

let _items = []
let _resources = {}

export class StageResources {
  constructor (aPath) {
    if (aPath) {
      this._aPath = aPath
      this.loadFromFile(path.format({ dir: aPath, base: 'stage-resources.json' }))
    }
  }

  loadFromFile (aFile) {
    _items = JSON.parse(fs.readFileSync(aFile))
    _resources = new Resources(this._aPath)
    _items.map((stageResource) => { stageResource.resource = _resources.findById(stageResource.resource) })
  }

  filterByStage (stageId) {
    return _.filter(this._stage_resources, (stageResource) => stageResource.stage === stageId)
  }

  findById (id) {
    return _.find(this._stage_resources, { stage: id })
  }

  get stageResources () {
    return _items
  }
}
