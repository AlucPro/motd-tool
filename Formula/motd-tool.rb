class MotdTool < Formula
  desc "Tiny CLI that prints a random message of the day in your terminal"
  homepage "https://github.com/AlucPro/motd-tool"
  url "https://registry.npmjs.org/motd-tool/-/motd-tool-1.0.1.tgz"
  sha256 "3657c4e0c647991a71437a1dd9ad5bec3e13d3becfa0a3fce2705c089b59460b"
  license "MIT"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    (bin/"xmotd").write_env_script libexec/"bin/xmotd.js", PATH => "#{Formula["node"].opt_bin}:#{ENV["PATH"]}"
  end

  def caveats
    <<~EOS
      Run:
        xmotd init

      to enable automatic once-per-day terminal messages in your shell.
    EOS
  end

  test do
    output = shell_output("#{bin}/xmotd --help")
    assert_match "xmotd - tiny message of the day CLI", output
  end
end
