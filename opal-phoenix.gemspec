Gem::Specification.new do |s|
  s.name        = 'opal-phoenix'
  s.version     = '0.0.8'
  s.authors     = ['Michał Kalbarczyk']
  s.email       = 'fazibear@gmail.com'
  s.homepage    = 'http://github.com/fazibear/opal-phoenix'
  s.summary     = 'Phoenix client wrapper for opal'
  s.description = 'Phoenix client wrapper for opal'
  s.license     = 'MIT'

  s.files         = `git ls-files`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map { |f| File.basename(f) }
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.require_paths = ['lib']

  s.add_dependency 'opal', '~> 0'
  s.add_development_dependency 'rake', '~> 0'
end
