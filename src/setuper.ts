import * as shell from 'shelljs';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as cache from '@actions/cache';
import * as os from 'os';

export const installYc = async (useCache: boolean) => {
  const ycDir = os.homedir() + '/setup-yc/'
  const ycDirBin = os.homedir() + '/setup-yc-bin'
  const cacheKey = 'setup-yc-cache-key'

  if (useCache) {
    const restored = await cache.restoreCache([ycDirBin], cacheKey)
    core.addPath(ycDirBin + '/bin')
    shell.chmod('+x', `${ycDirBin}/bin/yc`)

    if (restored && isYcAvailable()) {
      core.info('🎉 yc available from cache!')
    } else {
      await downloadInstallYc(ycDir, ycDirBin)

      core.info('📦 yc is being added to cache...')
      await cache.saveCache([ycDirBin], cacheKey)
      core.info('✅ yc is cached successfully!')
    }
  } else {
    await downloadInstallYc(ycDir, ycDirBin)
    core.addPath(ycDirBin + '/bin')
  }

  if (!isYcAvailable()) {
    core.setFailed('❌ yc is still not accessible, please contact action maintainers!')
  }
};

const isYcAvailable: () => boolean =
  () => !!shell.which('yc');

const downloadInstallYc = async (downloadDir: string, binDir: string) => {
  core.info('⌛ yc is installing...')

  const file = downloadDir + 'install.sh'
  const url = `https://storage.yandexcloud.net/yandexcloud-yc/install.sh`
  await exec.exec('curl', [
    '--silent',
    '--create-dirs',
    '--location',
    '--output',
    file,
    url,
  ])
  shell.chmod('+x', file)
  await exec.exec(file, ['-i', `${binDir}`, '-n'], {cwd: downloadDir})
  await exec.exec('rm', ['-rf', downloadDir])
  shell.chmod('+x', `${binDir}/yc`)

  core.info('✅ yc is installed!')
};