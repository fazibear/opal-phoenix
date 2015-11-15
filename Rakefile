require 'bundler'
Bundler.require
Bundler::GemHelper.install_tasks

require 'open-uri'

desc "Update Phoenix JS lib"
task :update_js do
  js_lib_url = 'https://raw.githubusercontent.com/phoenixframework/phoenix/master/priv/static/phoenix.js'
  js_lib_dest = File.join(File.dirname(__FILE__), './lib/phoenix.js')
  open(js_lib_url) do |f|
    File.write(js_lib_dest, f.readlines.join)
  end
end
