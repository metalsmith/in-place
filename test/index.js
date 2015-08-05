var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var inPlace = require('..');

describe('metalsmith-in-place', function(){
  it('should render a basic template', function(done){
    Metalsmith('test/fixtures/basic')
      .use(inPlace({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

  it('should accept an engine string', function(done){
    Metalsmith('test/fixtures/basic')
      .use(inPlace('swig'))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/basic/expected', 'test/fixtures/basic/build');
        done();
      });
  });

  it('should accept a pattern to match', function(done){
    Metalsmith('test/fixtures/pattern')
      .use(inPlace({ engine: 'swig', pattern: '*.md' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/pattern/expected', 'test/fixtures/pattern/build');
        done();
      });
  });

  it('should mix in global metadata', function(done){
    Metalsmith('test/fixtures/metadata')
      .metadata({ title: 'Global Title' })
      .use(inPlace({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/metadata/expected', 'test/fixtures/metadata/build');
        done();
      });
  });

  it('should preserve binary files', function(done){
    Metalsmith('test/fixtures/binary')
      .use(inPlace({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/binary/expected', 'test/fixtures/binary/build');
        done();
      });
  });

  it('should process swig includes', function(done){
    Metalsmith('test/fixtures/include')
      .use(inPlace({ engine: 'swig' }))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/include/expected', 'test/fixtures/include/build');
        done();
      });
  });
});
