import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import {StageResources} from './stage-resources'

export class Stages {
  constructor (aPath) {
    this._stages = JSON.parse(fs.readFileSync(path.format({ dir: aPath, base: 'stages.json'})))
    this._stageResources = new StageResources(aPath)
  }

  filterByProduct (productId) {
    const aStages = _.filter(this._stages, (stage) => stage.product === productId)
    aStages.map((stage) => stage.resources = this._stageResources.filterByStage(stage.id))
    return aStages
  }
}
