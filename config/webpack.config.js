const argv = require('yargs').argv
const webpack = require('webpack')
const cssnano = require('cssnano')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const project = require('./project.config')
const debug = require('debug')('app:config:webpack')

const __DEV__ = project.globals.__DEV__
const __PROD__ = project.globals.__PROD__
const __TEST__ = project.globals.__TEST__

debug('Creating configuration.')
const webpackConfig = {
  name: 'client',
  target: 'web',
  devtool: project.compiler_devtool,
  resolve: {
    // root       : project.paths.docs(),
    modules: [
      project.paths.docs(),
      project.paths.client(),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.json']
  },
  module: {}
}
// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = project.paths.docs('main.js')

webpackConfig.entry = {
  app: __DEV__
      ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${project.compiler_public_path}__webpack_hmr`)
      : [APP_ENTRY],
  vendor: project.compiler_vendors
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename: `[name].[${project.compiler_hash_type}].js`,
  path: project.paths.dist(),
  publicPath: project.compiler_public_path
}

// ------------------------------------
// Externals
// ------------------------------------
webpackConfig.externals = {}
webpackConfig.externals['react/lib/ExecutionEnvironment'] = true
webpackConfig.externals['react/lib/ReactContext'] = true
webpackConfig.externals['react/addons'] = true

// hints:
// WARNING in entrypoint size limit:
// The following entrypoint(s) combined asset size exceeds the recommended limit (250 kB).
// WARNING in asset size limit: The following asset(s) exceed the recommended size limit (250 kB).
webpackConfig.performance = { hints: false }
// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
  new webpack.DefinePlugin(project.globals),
  new HtmlWebpackPlugin({
    template: project.paths.docs('index.html'),
    hash: false,
    favicon: project.paths.public('favicon.ico'),
    filename: 'index.html',
    inject: 'body',
    minify: {
      collapseWhitespace: true
    }
  })
]

// Ensure that the compiler exits on errors during testing so that
// they do not get skipped and misreported.
if (__TEST__ && !argv.watch) {
  webpackConfig.plugins.push(function () {
    this.plugin('done', function (stats) {
      if (stats.compilation.errors.length) {
        // Pretend no assets were generated. This prevents the tests
        // from running making it clear that there were warnings.
        throw new Error(
            stats.compilation.errors.map(err => err.message || err)
        )
      }
    })
  })
}

if (__DEV__) {
  debug('Enabling plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
  )
} else if (__PROD__) {
  debug('Enabling plugins for production (OccurenceOrder, Dedupe & UglifyJS).')
  webpackConfig.plugins.push(
      // new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          unused: true,
          dead_code: true,
          warnings: false
        }
      })
  )
}

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
  webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor']
      })
  )
}

// ------------------------------------
// Loaders
// ------------------------------------
// JavaScript / JSON
// webpackConfig.module.loaders = [{
webpackConfig.module.rules = [{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: project.compiler_babel
  // exclude: [
  //   path.resolve(__dirname, "../node_modules/element-ui/lib"),
  //   new RegExp(`node_modules\\${path.sep}(?!element\-ui.*)`)
  // ]
}
// , {
//     test   : /\.json$/,
//     loader : 'json-loader'
// }
]

// ------------------------------------
// Style Loaders
// ------------------------------------
// We use cssnano with the postcss loader, so we tell
// css-loader not to duplicate minimization.
const BASE_CSS_LOADER = 'css-loader?sourceMap&-minimize'

// webpackConfig.module.loaders.push({
webpackConfig.module.rules.push({
  test: /\.scss$/,
  // exclude : null,
  // loaders : [
  use: [
    'style-loader',
    BASE_CSS_LOADER,
    {
      loader: 'postcss-loader' // ,
      // options: {
      //   plugins: function () {
      //     return [
      //       require('cssnano')({
      //         autoprefixer: {
      //           add: true,
      //           remove: true,
      //           browsers: ['last 2 versions']
      //         },
      //         discardComments: {
      //           removeAll: true
      //         },
      //         discardUnused: false,
      //         mergeIdents: false,
      //         reduceIdents: false,
      //         safe: true,
      //         sourcemap: true
      //       })
      //     ]
      //   },
      //   sourceMap: 'inline'
      // },
    },
    // 'sass-loader?sourceMap'
    {
      loader: 'sass-loader',
      options: {
        includePaths: [project.paths.docs('styles')]
      }
    }
  ]
})
webpackConfig.module.rules.push({
  test: /\.css$/,
  // exclude : null,
  use: [
    'style-loader',
    BASE_CSS_LOADER,
    {
      loader: 'postcss-loader'
    }
  ]
})

// webpackConfig.sassLoader = {
//     includePaths : project.paths.docs('styles')
// }

// webpackConfig.postcss = [
//     cssnano({
//         autoprefixer : {
//             add      : true,
//             remove   : true,
//             browsers : ['last 2 versions']
//         },
//         discardComments : {
//             removeAll : true
//         },
//         discardUnused : false,
//         mergeIdents   : false,
//         reduceIdents  : false,
//         safe          : true,
//         sourcemap     : true
//     })
// ]

// File loaders
/* eslint-disable */
// webpackConfig.module.loaders.push(
webpackConfig.module.rules.push(
    {
      test: /\.woff(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff'
    },
    {
      test: /\.woff2(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2'
    },
    {
      test: /\.otf(\?.*)?$/,
      loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype'
    },
    {
      test: /\.ttf(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream'
    },
    {test: /\.eot(\?.*)?$/, loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]'},
    {
      test: /\.svg(\?.*)?$/,
      loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml'
    },
    {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
)
/* eslint-enable */

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
  debug('Applying ExtractTextPlugin to CSS loaders.')
  webpackConfig.module.rules.filter(
      (rule) => rule.use && rule.use.find((name) => {
        if (typeof name === 'object') {
          name = name.loader
        }
        // else if (typeof name == 'string') {
        //   /css-loader/.test(name.split('?')[0])
        // }
        return /css-loader/.test(name.split('?')[0])
      })
  ).forEach((rule) => {
    debug('==========================: %O', rule)
    let loaders = []
    if (typeof rule.use === 'object') {
      loaders.push(rule.use.loader)
    } else {
      loaders.push(rule.use)
    }
    const first = loaders[0]
    debug('first use:' + first)
    const rest = loaders.slice(1)
    debug('rest use: ' + rest)
    rule.loader = ExtractTextPlugin.extract({
      fallbackLoader: first,
      loader: rest.join('!')
    })
    // loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
    delete rule.use
  })

  webpackConfig.plugins.push(
      new ExtractTextPlugin({
        fileName: '[name].[contenthash].css',
        allChunks: true
      }),
      // new ExtractTextPlugin('[name].[contenthash].css', {
      //     allChunks : true
      // })
      new webpack.LoaderOptionsPlugin({
        options: {
          sassLoader: {
            includePaths: [project.paths.docs('styles')]
          },
          postcss: function () {
            return [
              cssnano({
                autoprefixer: {
                  add: true,
                  remove: true,
                  browsers: ['last 2 versions']
                },
                discardComments: {
                  removeAll: true
                },
                discardUnused: false,
                mergeIdents: false,
                reduceIdents: false,
                safe: true,
                sourcemap: true
              })
            ]
          }
        }
      })
  )
}

module.exports = webpackConfig