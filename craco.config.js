const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Enable SRI for webpack bundles
      webpackConfig.output.crossOriginLoading = 'anonymous';

      webpackConfig.plugins.push(
        new SubresourceIntegrityPlugin({
          hashFuncNames: ['sha384'],
          enabled: process.env.NODE_ENV === 'production',
        })
      );

      return webpackConfig;
    },
  },
};
