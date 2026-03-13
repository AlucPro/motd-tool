class MotdTool < Formula
  desc "Tiny CLI that prints a random message of the day in your terminal"
  homepage "https://github.com/AlucPro/motd-tool"
  url "https://github.com/AlucPro/motd-tool/releases/download/v1.0.3/motd-tool-1.0.3.tgz"
  sha256 "96b32543b7251a150c23dcdff890e5f58e7ecba95ff1e312fa17e67bb2178adb"
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
