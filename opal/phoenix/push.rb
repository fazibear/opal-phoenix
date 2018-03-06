module Phoenix
  class Push
    include Native

    def initialize(push)
      super(push)
    end

    def on(msg, &block)
      Push.new `#{@native}.receive(#{msg}, #{callback(block)})`
    end

    def receive(msg, &block)
      Push.new `#{@native}.receive(#{msg}, #{callback(block)})`
    end

    def callback(block)
      proc do |e|
        block.call(Hash.new(e))
      end
    end

    # on_ handling
    def method_missing(name, *args, &block)
      if match = /on_(.+)/.match(name)
        receive(match[1], &block)
      else
        super(name, args, &block)
      end
    end
  end
end
