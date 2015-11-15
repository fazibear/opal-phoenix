# opal-phoenix

Opal wrapper for [Phoenix Framework](http://phoenixframework.org) javascript library.

## example

```ruby
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
