module Phoenix
  class Push
    include Native

    def initialize(push)
      super(push)
    end

    def receive(msg, &block)
      Push.new `#{@native}.receive(#{msg}, #{block})`
    end
  end
end
