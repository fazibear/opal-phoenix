module Phoenix
  class Push
    include Native

    def initialize(push)
      super(push)
    end

    def receive(msg, &block)
      Push.new `#{@native}.receive(#{msg}, #{callback(block)})`
    end

    def callback(block)
      proc do |e|
        block.call(Hash.new(e))
      end
    end
  end
end
