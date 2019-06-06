import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import {Resources} from './resources'

export class StageResources {
  constructor (aPath) {
    this._stage_resources = JSON.parse(fs.readFileSync(path.format({ dir: aPath, base: 'stage-resources.json'})))
    this._resources = new Resources(aPath)
    this._stage_resources.map((stageResource) => stageResource.resource = this._resources.findById(stageResource.resource))
  }

  filterByStage (stageId) {
    return _.filter(this._stage_resources, (stageResource) => stageResource.stage === stageId)
  }

  findById (id) {
    return _.find( this._stage_resources, { stage: id })
  }
}
