'use strict'

const debug = require('debug')('init')
const fs = require('fs-extra')
const kgo = require('kgo')
const json2md = require('json2md')
const spawn = require('child_process').spawn
const path = require('path')

module.exports = function (config, action, program) {
  kgo('npmInit', function (done) {
    debug('Spawning npm init')
    var npm = spawn('npm', ['init'], { stdio: 'inherit' })
    npm.on('close', function (error, data) {
      done(error, data)
    })
  })('copy', ['npmInit'], function (npm, done) {
    debug('Copying/making files: ', path.join(config._dirname, '/temp/'), 'pg', config.packageDir)
    fs.copy(path.join(config._dirname, '/temp/'), config.packageDir, function (error) {
      done(error)
    })
    fs.mkdir('assets')
    fs.mkdir(program.type)
  })('md', ['npmInit'], function (npm, done) {
    var pack = require(path.join(config.packageDir, '/package.json'))
    var mdob = [
      { h1: pack.name },
      { blockquote: pack.description }
    ]
    debug('md', pack)
    done(null, json2md(mdob))
  })('write', ['copy', 'md'], function (copy, md, done) {
    debug('Writing Markdown to README.md', md)
    fs.writeFile('README.md', md, function (error) {
      done(error)
    })
  })(['*'], function (err) {
    debug('Error: ' + err)
    return
  })
}
