import * as core from '@actions/core'

import getOptions from './options';
import {installYc} from './setuper';

const main = async () => {
  const {cache} = getOptions()

  await installYc(cache)
}

try {
  main()
} catch (error) {
  core.setFailed(`${error}`)
}