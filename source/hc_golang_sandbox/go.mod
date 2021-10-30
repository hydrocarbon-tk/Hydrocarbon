module candlelib/hc_sandbox

go 1.17

require candlelib/hc_recognizer v0.0.0

replace candlelib/hc_recognizer v0.0.0 => ../hc_golang/recognize

require candlelib/hc_completer v0.0.0

replace candlelib/hc_completer v0.0.0 => ../hc_golang/complete
