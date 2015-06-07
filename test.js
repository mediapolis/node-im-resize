/*jshint laxbreak:true */

var assert = require('assert');
var resize = require('./index');

describe('resize.path()', function() {
  it('returns new relative path with suffix', function() {
    var path = resize.path('./foo.jpg', {prefix: '', suffix: '-bar'});

    assert.equal(path, 'foo-bar.jpg');
  });

  it('returns new relative path with custom format', function() {
    var path = resize.path('./foo.jpg', {
      prefix: '',
      suffix: '-bar',
      format: 'png'
    });

    assert.equal(path, 'foo-bar.png');
  });

  it('returns new absolute path with suffix', function() {
    var path = resize.path('/foo/bar/baz.jpg', {prefix: '', suffix: '-bix'});
    assert.equal(path, '/foo/bar/baz-bix.jpg');
  });

  it('returns new absolute path with custom format', function() {
    var path = resize.path('/foo/bar/baz.jpg', {
      prefix: '',
      suffix: '-bix',
      format: 'png'
    });

    assert.equal(path, '/foo/bar/baz-bix.png');
  });

  it('returns new path with prefix', function() {
    var path = resize.path('/foo/bar/baz.jpg', {prefix: 'prefix-', suffix: ''});
    assert.equal(path, '/foo/bar/prefix-baz.jpg');
  });

  it('returns new path with custom directory', function() {
    var path = resize.path('/foo/bar/baz.jpg', {
      prefix: 'im-',
      suffix: '',
      path: '/tmp'
    });

    assert.equal(path, '/tmp/im-baz.jpg');
  });
});

describe('resize.crop()', function() {
  it('returns crop geometry for horisontal image', function() {
    var image = {width: 5184, height: 2623};
    assert.equal(resize.crop(image, '3:2'), '3936x2623+624+0');
  });

  it('returns crop geometry for vertical image', function() {
    var image = {height: 5184, width: 2623};
    assert.equal(resize.crop(image, '3:2'), '2623x3936+0+624');
  });

  it('returns false for image with correct aspectratio', function() {
    var image = {width: 2000, height: 1000};
    assert.equal(resize.crop(image, '2:1'), false);
  });

  it('returns false if no aspectratio is defined', function() {
    var image = {width: 2000, height: 1000};
    assert.equal(resize.crop(image), false);
  });
});

describe('resize.cmd()', function() {
  var output, image;

  beforeEach(function() {
    image = {
      path: './assets/horizontal.jpg',
      width: 5184,
      height: 2623
    };

    output = {
      versions: [{
        suffix: '-full',
        maxHeight: 1920,
        maxWidth: 1920
      },{
        suffix: '-1200',
        maxHeight: 1200,
        maxWidth: 1200,
        aspect: "3:2"
      }]
    };
  });

  it('sets global path to each version', function() {
    output.path = '/tmp';
    resize.cmd(image, output);

    for (var i = 0; i < output.versions.length; i++) {
      assert.equal(output.versions[i].path.substr(0, 5), '/tmp/');
    }
  });

});

describe('resize.cmdVersion()', function() {
  it('returns convert command for version', function() {
    var image = {
      path: './a.jpg',
      width: 2000,
      height: 1000
    };

    var version = {
      path: 'a-b.jpg',
      maxWidth: 500,
      maxHeight: 500
    };

    var cmd = resize.cmdVersion(image, version);
    var out = 'mpr:./a.jpg -resize "500x500" -write a-b.jpg +delete';

    assert.equal(cmd, out);
  });

  it('sets custom quality if specified', function() {
    var image = {
      path: './a.jpg',
      width: 2000,
      height: 1000
    };

    var version = {
      path: 'a-b.jpg',
      quality: 50,
      maxWidth: 500,
      maxHeight: 500
    };

    var cmd = resize.cmdVersion(image, version);
    var out = 'mpr:./a.jpg -quality 50 -resize "500x500" -write a-b.jpg +delete';

    assert.equal(cmd, out);
  });
});

describe('resize()', function() {
  var output;

  beforeEach(function() {
    output = {
      versions: [{
        suffix: '-full',
        maxHeight: 1920,
        maxWidth: 1920
      },{
        suffix: '-1200',
        maxHeight: 1200,
        maxWidth: 1200,
        aspect: "3:2"
      },{
        suffix: '-800',
        maxHeight: 800,
        maxWidth: 800,
        aspect: "3:2"
      },{
        suffix: '-500',
        maxHeight: 500,
        maxWidth: 500,
        aspect: "3:2"
      },{
        suffix: '-260',
        maxHeight: 260,
        maxWidth: 260,
        aspect: "3:2"
      },{
        suffix: '-150',
        maxHeight: 150,
        maxWidth: 150,
        aspect: "3:2"
      },{
        suffix: '-square-200',
        maxHeight: 200,
        maxWidth: 200,
        aspect: "1:1"
      },{
        suffix: '-square-50',
        maxHeight: 50,
        maxWidth: 50,
        aspect: "1:1"
      }]
    };
  });

  it('resisizes horizontal image', function(done) {
    this.timeout(10000);

    var image = {
      path: './assets/horizontal.jpg',
      width: 5184,
      height: 2623
    };

    var paths = [
      'assets/horizontal-full.jpg',
      'assets/horizontal-1200.jpg',
      'assets/horizontal-800.jpg',
      'assets/horizontal-500.jpg',
      'assets/horizontal-260.jpg',
      'assets/horizontal-150.jpg',
      'assets/horizontal-square-200.jpg',
      'assets/horizontal-square-50.jpg'
    ];

    resize(image, output, function(err, versions) {
      assert.ifError(err);
      assert(versions instanceof Array);

      for(var i = 0; i < versions.length; i++) {
        assert.equal(versions[i].path, paths[i]);
      }

      done();
    });
  });

  it('resisizes vertical image', function(done) {
    this.timeout(10000);

    var image = {
      path: './assets/vertical.jpg',
      width: 1929,
      height: 3456
    };

    var paths = [
      'assets/vertical-full.jpg',
      'assets/vertical-1200.jpg',
      'assets/vertical-800.jpg',
      'assets/vertical-500.jpg',
      'assets/vertical-260.jpg',
      'assets/vertical-150.jpg',
      'assets/vertical-square-200.jpg',
      'assets/vertical-square-50.jpg'
    ];

    resize(image, output, function(err, versions) {
      assert.ifError(err);
      assert(versions instanceof Array);

      for(var i = 0; i < versions.length; i++) {
        assert.equal(versions[i].path, paths[i]);
      }

      done();
    });
  });

  it('resizes transparent image', function(done) {
    this.timeout(10000);

    var image = {
      path: './assets/transparent.png',
      width: 800,
      height: 600
    };

    for (var i = 0; i < output.versions.length; i++) {
      output.versions[i].flatten = true;
      output.versions[i].background = 'red';
      output.versions[i].format = 'jpg';
    }

    var paths = [
      'assets/transparent-full.jpg',
      'assets/transparent-1200.jpg',
      'assets/transparent-800.jpg',
      'assets/transparent-500.jpg',
      'assets/transparent-260.jpg',
      'assets/transparent-150.jpg',
      'assets/transparent-square-200.jpg',
      'assets/transparent-square-50.jpg'
    ];

    resize(image, output, function(err, versions) {
      assert.ifError(err);
      assert(versions instanceof Array);

      for(var i = 0; i < versions.length; i++) {
        assert.equal(versions[i].path, paths[i]);
      }

      done();
    });
  });
});
