# opal-phoenix [![Gem Version](https://badge.fury.io/rb/opal-phoenix.svg)](http://badge.fury.io/rb/opal-phoenix) [![Code Climate](https://codeclimate.com/github/fazibear/opal-phoenix/badges/gpa.svg)](https://codeclimate.com/github/fazibear/opal-phoenix)

Opal wrapper for [Phoenix Framework](http://phoenixframework.org) javascript library.

## usage

### Server side
config.ru, Rakefile, Rails, Sinatra, etc.

```ruby
require 'opal-phoenix'
```

Gemfile

```ruby
gem 'opal-phoenix'
```

### Browser side

```ruby
require 'phoenix'

# setup socket
socket = Phoenix::Socket.new('ws://localhost:4000/ws')

socket.on_error do
  $console.log 'socket error!'
end

socket.on_close do
  $console.log 'socket closed!'
end

# connect to socket
socket.connect

# setup channel
channel = socket.channel('lobby', params: {asd: 'xcvxcv'})

channel.on_error do
  $console.log 'channel error!'
end

channel.on_close do
  $console.log 'channel closed!'
end

channel.on 'msg' do |payload|
  $console.log "payload: #{payload}"
end

# join channel
channel
  .join
  .receive('ok') { $console.log 'ok' }
  .receive('failed') { $console.log 'failed' }

# push a message
channel
  .push("msg", {a: :b})
  .receive('ok') { $console.log 'ok' }
  .receive('failed') { $console.log 'failed' }
```
