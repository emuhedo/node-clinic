'use strict'

const fs = require('fs')
const path = require('path')
const test = require('tap').test
const cli = require('./cli.js')

test('clinic flame --visualize-only - no issues', function (t) {
  // collect data
  cli({}, [
    'clinic', 'flame', '--collect-only',
    '--', 'node', '-e', 'require("util").inspect(process)'
  ], function (err, stdout, stderr, tempdir) {
    t.ifError(err)
    t.ok(/Output file is (\d+).clinic-flame/.test(stdout))
    const dirname = stdout.match(/(\d+.clinic-flame)/)[1]
    const dirpath = path.resolve(tempdir, dirname)

    // visualize data
    cli({}, [
      'clinic', 'flame', '--visualize-only', dirpath
    ], function (err, stdout) {
      t.ifError(err)
      t.strictEqual(
        stdout,
        `Generated HTML file is ${dirpath}.html
You can use this command to upload it:
clinic upload ${dirpath}
`)

      // check that HTML file exists
      fs.access(dirpath + '.html', function (err) {
        t.ifError(err)
        t.end()
      })
    })
  })
})

test('clinic flame --visualize-only - missing data', function (t) {
  const arg = 'missing.clinic-flame'
  cli({ relayStderr: false }, [
    'clinic', 'flame', '--visualize-only', arg
  ], function (err, stdout, stderr) {
    t.strictDeepEqual(err, new Error('process exited with exit code 1'))
    t.strictEqual(stdout, '')
    t.ok(stderr.includes(`Unknown argument "${arg}". Pattern: {pid}.clinic-{command}`))
    t.end()
  })
})

test('clinic flame --visualize-only - supports trailing slash', function (t) {
  // collect data
  cli({}, [
    'clinic', 'flame', '--collect-only',
    '--', 'node', '-e', 'require("util").inspect(process)'
  ], function (err, stdout, stderr, tempdir) {
    t.ifError(err)
    t.ok(/Output file is (\d+).clinic-flame/.test(stdout))
    const dirname = stdout.match(/(\d+.clinic-flame)/)[1]
    const dirpath = path.resolve(tempdir, dirname)

    // visualize data
    cli({}, [
      'clinic', 'flame', '--visualize-only', `${dirpath}${path.sep}`
    ], function (err, stdout) {
      t.ifError(err)
      t.strictEqual(
        stdout,
        `Generated HTML file is ${dirpath}.html
You can use this command to upload it:
clinic upload ${dirpath}
`)

      // check that HTML file exists
      fs.access(dirpath + '.html', function (err) {
        t.ifError(err)
        t.end()
      })
    })
  })
})
