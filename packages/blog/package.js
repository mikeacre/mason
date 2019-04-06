Package.describe({
  name: 'bearly:blog',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.1');

  api.use([
    'ecmascript',
    'meteor-base',
    'summernote:standalone',
    'mongo',
    'kadira:blaze-layout',
    'fourseven:scss',
    'blaze-html-templates',
    'kadira:flow-router',

    'check',
    'underscore',
    'manuel:reactivearray',
    'reactive-var',
    'manuel:reactivearray',
    'tracker',
    'peerlibrary:aws-sdk',
    'raix:handlebar-helpers',
    'http'
    ]);

  api.addFiles([
    'server/blog.js',   
    'collections/blog-collections.js', 
  ], 'server')

  api.addFiles([
    'client/blog.js',
    'client/blog.html',
    'client/blog.scss',    
    'client/bootblog.html',
    'client/bootblog.js',
    'client/bootblog.scss',
    'client/index.js',
    'client/page.html',
    'client/page.js',
    'client/switch.scss',
    'collections/blog-collections.js',
  ], 'client')


  Npm.depends({ 'simpl-schema': "1.4.2" });
  

});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('blog');
  api.mainModule('blog-tests.js');
});
