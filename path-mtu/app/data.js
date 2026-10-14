/* Synthetic publication fixtures only. No captured network data. */
window.PMTU_KIT = {
 "schema": "path-mtu-evidence-kit/view/v1",
 "synthetic": true,
 "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
 "banner_why": "Synthetic examples only: no route lookup, captured transfer or path measurement is included. Protocol constants and user-supplied contracts are not measured path limits.",
 "facts": [
  {
   "kind": "FACT A \u2014 LOCAL LINK MTU",
   "value": "not collected here",
   "means": "The configured MTU on one interface; no interface value was collected for this edition.",
   "never": "an end-to-end path limit, a PMTU, or anything about a peer"
  },
  {
   "kind": "FACT B \u2014 REPORTED ROUTE MTU",
   "value": "not collected here",
   "means": "whether the route entry carries an explicit mtu attribute, and its value when it does",
   "never": "a measured PMTU or a negotiated value"
  },
  {
   "kind": "FACT C \u2014 OBSERVED SUCCESSFUL PAYLOAD SIZE",
   "value": "not measured; synthetic examples only",
   "means": "a specific peer accepted a body of N bytes, on a specific path, in a specific run",
   "never": "the path MTU, a lower bound for other paths, or a universal limit"
  },
  {
   "kind": "FACT D \u2014 END-TO-END PMTU",
   "value": "END_TO_END_PMTU_UNKNOWN",
   "means": "no approved measurement exists here; this is a value, not an absence, so it survives every export",
   "never": "a number, in any output, at any time"
  }
 ],
 "router_receipt": null,
 "cases": [
  {
   "id": "synthetic-1500-ipv4-tcp",
   "label": "1500 contract \u00b7 IPv4 + TCP",
   "why": "the shape most people picture: 20 byte IPv4, 20 byte TCP",
   "link_mtu": 1500,
   "ip_version": "ipv4",
   "transport": "tcp",
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "tcp_options_bytes": 0,
   "df": false,
   "tunnel_state": "none",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": null
  },
  {
   "id": "synthetic-1500-ipv4-tcp-tunnel-32",
   "label": "1500 contract \u00b7 IPv4 + TCP \u00b7 32 byte tunnel supplied",
   "why": "what declaring an encapsulation overhead actually costs the payload",
   "link_mtu": 1500,
   "ip_version": "ipv4",
   "transport": "tcp",
   "tunnel_state": "supplied",
   "tunnel_overhead_bytes": 32,
   "outer_ip_version": "ipv4",
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "tcp_options_bytes": 0,
   "df": false
  },
  {
   "id": "synthetic-1492-ipv4-tcp-opts12",
   "label": "1492 contract \u00b7 IPv4 + TCP \u00b7 12 option bytes",
   "why": "the 1492 number people paste from other people's configs",
   "link_mtu": 1492,
   "ip_version": "ipv4",
   "transport": "tcp",
   "tcp_options_bytes": 12,
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "df": false,
   "tunnel_state": "none",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": null
  },
  {
   "id": "synthetic-1280-ipv6-tcp-opts12",
   "label": "1280 contract \u00b7 IPv6 + TCP \u00b7 12 option bytes",
   "why": "the smallest link IPv6 requires anywhere (RFC 8200 s5)",
   "link_mtu": 1280,
   "ip_version": "ipv6",
   "transport": "tcp",
   "tcp_options_bytes": 12,
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "df": false,
   "tunnel_state": "none",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": null
  },
  {
   "id": "synthetic-9000-ipv6-udp",
   "label": "9000 contract \u00b7 IPv6 + UDP",
   "why": "a jumbo contract, to show the same arithmetic scales",
   "link_mtu": 9000,
   "ip_version": "ipv6",
   "transport": "udp",
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "tcp_options_bytes": 0,
   "df": false,
   "tunnel_state": "none",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": null
  },
  {
   "id": "synthetic-9000-ipv4-tcp-opts40",
   "label": "9000 contract \u00b7 IPv4 + TCP \u00b7 40 option bytes",
   "why": "the worst realistic IPv4 option block",
   "link_mtu": 9000,
   "ip_version": "ipv4",
   "transport": "tcp",
   "ip_options_bytes": 40,
   "ipv6_extension_bytes": 0,
   "tcp_options_bytes": 0,
   "df": false,
   "tunnel_state": "none",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": null
  },
  {
   "id": "synthetic-1500-ipv4-udp",
   "label": "1500 contract \u00b7 IPv4 + UDP",
   "why": "UDP's fixed 8 byte header, and why datagram traffic differs",
   "link_mtu": 1500,
   "ip_version": "ipv4",
   "transport": "udp",
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "tcp_options_bytes": 0,
   "df": false,
   "tunnel_state": "none",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": null
  },
  {
   "id": "synthetic-1500-ipv6-in-ipv4-tunnel-80",
   "label": "1500 contract \u00b7 IPv6 inside IPv4 \u00b7 80 byte tunnel",
   "why": "double headers: the outer header is charged AND the inner one is",
   "link_mtu": 1500,
   "ip_version": "ipv6",
   "transport": "tcp",
   "tunnel_state": "supplied",
   "tunnel_overhead_bytes": 80,
   "outer_ip_version": "ipv4",
   "tcp_options_bytes": 12,
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "df": false
  },
  {
   "id": "synthetic-1500-ipv6-tunnel-80-unsupplied",
   "label": "1500 contract \u00b7 tunnel PRESENT, overhead NOT declared",
   "why": "the honest unknown, and the case this whole kit exists for",
   "link_mtu": 1500,
   "ip_version": "ipv6",
   "transport": "tcp",
   "tunnel_state": "present_unsupplied",
   "tunnel_overhead_bytes": null,
   "outer_ip_version": "ipv4",
   "tcp_options_bytes": 12,
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "df": false
  },
  {
   "id": "synthetic-68-ipv6-tunnel-80-negative",
   "label": "68 contract \u00b7 IPv6 + TCP \u00b7 80 byte tunnel",
   "why": "headers do not fit inside the contract: a contradiction, shown as one",
   "link_mtu": 68,
   "ip_version": "ipv6",
   "transport": "tcp",
   "tunnel_state": "supplied",
   "tunnel_overhead_bytes": 80,
   "outer_ip_version": "ipv4",
   "tcp_options_bytes": 32,
   "ip_options_bytes": 0,
   "ipv6_extension_bytes": 0,
   "df": false
  }
 ],
 "traces": [
  {
   "id": "clean-path",
   "label": "Everything succeeds up to 9000",
   "teaches": "A success ladder bounds this path from below and nothing else. It does not say where the limit is, because none was reached.",
   "expect_conclusion": "NO_SIZE_CONSTRAINT_OBSERVED",
   "matches_fixture_expectation": true,
   "report": {
    "conclusion": "NO_SIZE_CONSTRAINT_OBSERVED",
    "conclusion_vocabulary": [
     "INSUFFICIENT_SAMPLES",
     "NO_SIZE_CONSTRAINT_OBSERVED",
     "OBSERVED_EXPLICIT_PTB_INTERVAL",
     "PATH_CHANGED_DURING_TEST",
     "PROBE_BUDGET_EXHAUSTED",
     "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
     "UNKNOWN_TRANSIENT_LOSS"
    ],
    "observed_success_interval": {
     "highest_size_with_a_success": 7232,
     "lowest_size_probed": 576,
     "highest_size_probed": 7232,
     "note": "an interval of probed sizes, not a path limit"
    },
    "explicit_ptb": {
     "seen": false,
     "sizes": [],
     "reported_mtu": null
    },
    "repeated_timeout_sizes": [],
    "samples": {
     "attempts": 40,
     "retry_cap_per_size": 3,
     "probe_budget": 40,
     "min_samples_floor": 6,
     "budget_exhausted": true
    },
    "per_size": [
     {
      "size": 576,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1088,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1600,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2112,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2624,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3136,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3648,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4160,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4672,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5184,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5696,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 6208,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 6720,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 7232,
      "attempts": 1,
      "outcomes": [
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     }
    ],
    "observations": [
     "every probed size up to 7232 succeeded, which bounds this synthetic path only from below"
    ],
    "path_mtu": null,
    "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
    "synthetic": true,
    "trace": [
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 1,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 2,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 3,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 4,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 5,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 6,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 7,
      "size": 1600,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 8,
      "size": 1600,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 9,
      "size": 1600,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 10,
      "size": 2112,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 11,
      "size": 2112,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 12,
      "size": 2112,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 13,
      "size": 2624,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 14,
      "size": 2624,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 15,
      "size": 2624,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 16,
      "size": 3136,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 17,
      "size": 3136,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 18,
      "size": 3136,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 19,
      "size": 3648,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 20,
      "size": 3648,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 21,
      "size": 3648,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 22,
      "size": 4160,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 23,
      "size": 4160,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 24,
      "size": 4160,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 25,
      "size": 4672,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 26,
      "size": 4672,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 27,
      "size": 4672,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 28,
      "size": 5184,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 29,
      "size": 5184,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 30,
      "size": 5184,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 31,
      "size": 5696,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 32,
      "size": 5696,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 33,
      "size": 5696,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 34,
      "size": 6208,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 35,
      "size": 6208,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 36,
      "size": 6208,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 37,
      "size": 6720,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 38,
      "size": 6720,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 39,
      "size": 6720,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 40,
      "size": 7232,
      "reason": "path_accepts",
      "oracle_synthetic": true
     }
    ]
   }
  },
  {
   "id": "explicit-ptb-1400",
   "label": "Explicit packet-too-big above 1400",
   "teaches": "An error that actually arrives is the only thing that distinguishes a size boundary from loss. Even then the honest output is an interval between the largest success and the smallest failure.",
   "expect_conclusion": "OBSERVED_EXPLICIT_PTB_INTERVAL",
   "matches_fixture_expectation": true,
   "report": {
    "conclusion": "OBSERVED_EXPLICIT_PTB_INTERVAL",
    "conclusion_vocabulary": [
     "INSUFFICIENT_SAMPLES",
     "NO_SIZE_CONSTRAINT_OBSERVED",
     "OBSERVED_EXPLICIT_PTB_INTERVAL",
     "PATH_CHANGED_DURING_TEST",
     "PROBE_BUDGET_EXHAUSTED",
     "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
     "UNKNOWN_TRANSIENT_LOSS"
    ],
    "observed_success_interval": {
     "highest_size_with_a_success": 1344,
     "lowest_size_probed": 576,
     "highest_size_probed": 5440,
     "note": "an interval of probed sizes, not a path limit"
    },
    "explicit_ptb": {
     "seen": true,
     "sizes": [
      1600,
      1856,
      2112,
      2368,
      2624,
      2880,
      3136,
      3392,
      3648,
      3904,
      4160,
      4416,
      4672,
      4928,
      5184,
      5440
     ],
     "reported_mtu": 1400
    },
    "repeated_timeout_sizes": [],
    "samples": {
     "attempts": 60,
     "retry_cap_per_size": 3,
     "probe_budget": 60,
     "min_samples_floor": 6,
     "budget_exhausted": true
    },
    "per_size": [
     {
      "size": 576,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 832,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1088,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1344,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1600,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1856,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2112,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2368,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2624,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2880,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3136,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3392,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3648,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3904,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4160,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4416,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4672,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4928,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5184,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5440,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     }
    ],
    "observations": [
     "the smallest size that drew an explicit packet-too-big is 1600 and the largest that succeeded is 1344, so this path's threshold lies between them; that is an interval, not a measurement",
     "the error itself carried an MTU of 1400 bytes (RFC 1191 / RFC 8201 carry the next hop's value), still a synthetic number here"
    ],
    "path_mtu": null,
    "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
    "synthetic": true,
    "trace": [
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 1,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 2,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 3,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 4,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 5,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 6,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 7,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 8,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 9,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 10,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 11,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 12,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 13,
      "size": 1600,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 14,
      "size": 1600,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 15,
      "size": 1600,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 16,
      "size": 1856,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 17,
      "size": 1856,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 18,
      "size": 1856,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 19,
      "size": 2112,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 20,
      "size": 2112,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 21,
      "size": 2112,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 22,
      "size": 2368,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 23,
      "size": 2368,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 24,
      "size": 2368,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 25,
      "size": 2624,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 26,
      "size": 2624,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 27,
      "size": 2624,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 28,
      "size": 2880,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 29,
      "size": 2880,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 30,
      "size": 2880,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 31,
      "size": 3136,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 32,
      "size": 3136,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 33,
      "size": 3136,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 34,
      "size": 3392,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 35,
      "size": 3392,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 36,
      "size": 3392,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 37,
      "size": 3648,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 38,
      "size": 3648,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 39,
      "size": 3648,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 40,
      "size": 3904,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 41,
      "size": 3904,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 42,
      "size": 3904,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 43,
      "size": 4160,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 44,
      "size": 4160,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 45,
      "size": 4160,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 46,
      "size": 4416,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 47,
      "size": 4416,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 48,
      "size": 4416,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 49,
      "size": 4672,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 50,
      "size": 4672,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 51,
      "size": 4672,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 52,
      "size": 4928,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 53,
      "size": 4928,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 54,
      "size": 4928,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 55,
      "size": 5184,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 56,
      "size": 5184,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 57,
      "size": 5184,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 58,
      "size": 5440,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 59,
      "size": 5440,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 60,
      "size": 5440,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     }
    ]
   }
  },
  {
   "id": "blackhole-1400",
   "label": "Silent drop above 1400, no error ever",
   "teaches": "Identical probe pattern, opposite certainty. With no error to read, 1400 here is indistinguishable from loss and no size bound may be published.",
   "expect_conclusion": "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
   "matches_fixture_expectation": true,
   "report": {
    "conclusion": "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
    "conclusion_vocabulary": [
     "INSUFFICIENT_SAMPLES",
     "NO_SIZE_CONSTRAINT_OBSERVED",
     "OBSERVED_EXPLICIT_PTB_INTERVAL",
     "PATH_CHANGED_DURING_TEST",
     "PROBE_BUDGET_EXHAUSTED",
     "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
     "UNKNOWN_TRANSIENT_LOSS"
    ],
    "observed_success_interval": {
     "highest_size_with_a_success": 1344,
     "lowest_size_probed": 576,
     "highest_size_probed": 5440,
     "note": "an interval of probed sizes, not a path limit"
    },
    "explicit_ptb": {
     "seen": false,
     "sizes": [],
     "reported_mtu": null
    },
    "repeated_timeout_sizes": [
     1600,
     1856,
     2112,
     2368,
     2624,
     2880,
     3136,
     3392,
     3648,
     3904,
     4160,
     4416,
     4672,
     4928,
     5184,
     5440
    ],
    "samples": {
     "attempts": 60,
     "retry_cap_per_size": 3,
     "probe_budget": 60,
     "min_samples_floor": 6,
     "budget_exhausted": true
    },
    "per_size": [
     {
      "size": 576,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 832,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1088,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1344,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1600,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1856,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2112,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2368,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2624,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2880,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3136,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3392,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3648,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3904,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4160,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4416,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4672,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4928,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5184,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5440,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     }
    ],
    "observations": [
     "size(s) [1600, 1856, 2112, 2368, 2624, 2880, 3136, 3392, 3648, 3904, 4160, 4416, 4672, 4928, 5184, 5440] timed out on every retry with no error of any kind coming back; a silent drop is indistinguishable from loss, a rate limiter or a filtered path, so no size bound can be claimed",
     "retry cap 3 per size: a size needs to fail every retry before it is even recorded as a repeated timeout, and even then it is not a bound"
    ],
    "path_mtu": null,
    "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
    "synthetic": true,
    "trace": [
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 1,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 2,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 3,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 4,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 5,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 6,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 7,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 8,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 9,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 10,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 11,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 12,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 13,
      "size": 1600,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 14,
      "size": 1600,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 15,
      "size": 1600,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 16,
      "size": 1856,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 17,
      "size": 1856,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 18,
      "size": 1856,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 19,
      "size": 2112,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 20,
      "size": 2112,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 21,
      "size": 2112,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 22,
      "size": 2368,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 23,
      "size": 2368,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 24,
      "size": 2368,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 25,
      "size": 2624,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 26,
      "size": 2624,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 27,
      "size": 2624,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 28,
      "size": 2880,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 29,
      "size": 2880,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 30,
      "size": 2880,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 31,
      "size": 3136,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 32,
      "size": 3136,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 33,
      "size": 3136,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 34,
      "size": 3392,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 35,
      "size": 3392,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 36,
      "size": 3392,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 37,
      "size": 3648,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 38,
      "size": 3648,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 39,
      "size": 3648,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 40,
      "size": 3904,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 41,
      "size": 3904,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 42,
      "size": 3904,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 43,
      "size": 4160,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 44,
      "size": 4160,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 45,
      "size": 4160,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 46,
      "size": 4416,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 47,
      "size": 4416,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 48,
      "size": 4416,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 49,
      "size": 4672,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 50,
      "size": 4672,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 51,
      "size": 4672,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 52,
      "size": 4928,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 53,
      "size": 4928,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 54,
      "size": 4928,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 55,
      "size": 5184,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 56,
      "size": 5184,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 57,
      "size": 5184,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 58,
      "size": 5440,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 59,
      "size": 5440,
      "reason": "silent_drop",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 60,
      "size": 5440,
      "reason": "silent_drop",
      "oracle_synthetic": true
     }
    ]
   }
  },
  {
   "id": "transient-loss",
   "label": "Random loss at 25 percent, size-independent",
   "teaches": "A size that fails and then, larger, succeeds is loss. Reordering these two runs and the conclusion would flip with the data, which is the point.",
   "expect_conclusion": "UNKNOWN_TRANSIENT_LOSS",
   "matches_fixture_expectation": true,
   "report": {
    "conclusion": "UNKNOWN_TRANSIENT_LOSS",
    "conclusion_vocabulary": [
     "INSUFFICIENT_SAMPLES",
     "NO_SIZE_CONSTRAINT_OBSERVED",
     "OBSERVED_EXPLICIT_PTB_INTERVAL",
     "PATH_CHANGED_DURING_TEST",
     "PROBE_BUDGET_EXHAUSTED",
     "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
     "UNKNOWN_TRANSIENT_LOSS"
    ],
    "observed_success_interval": {
     "highest_size_with_a_success": 7232,
     "lowest_size_probed": 576,
     "highest_size_probed": 7232,
     "note": "an interval of probed sizes, not a path limit"
    },
    "explicit_ptb": {
     "seen": false,
     "sizes": [],
     "reported_mtu": null
    },
    "repeated_timeout_sizes": [
     6208
    ],
    "samples": {
     "attempts": 40,
     "retry_cap_per_size": 3,
     "probe_budget": 40,
     "min_samples_floor": 6,
     "budget_exhausted": true
    },
    "per_size": [
     {
      "size": 576,
      "attempts": 3,
      "outcomes": [
       "success",
       "timeout",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 1088,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 1600,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "success",
       "timeout"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 2112,
      "attempts": 3,
      "outcomes": [
       "success",
       "timeout",
       "timeout"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 2624,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "timeout"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 3136,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 3648,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4160,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 4672,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 5184,
      "attempts": 3,
      "outcomes": [
       "success",
       "timeout",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": true,
      "mixed_with_ptb": false
     },
     {
      "size": 5696,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 6208,
      "attempts": 3,
      "outcomes": [
       "timeout",
       "timeout",
       "timeout"
      ],
      "success": false,
      "ptb": false,
      "repeated_timeout": true,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 6720,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 7232,
      "attempts": 1,
      "outcomes": [
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     }
    ],
    "observations": [
     "size(s) [576, 1088, 1600, 2112, 2624, 3136, 4160, 4672, 5184] succeeded on one attempt and timed out on another at the same size, so the silence is loss rather than a size boundary"
    ],
    "path_mtu": null,
    "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
    "synthetic": true,
    "trace": [
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 1,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 2,
      "size": 576,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 3,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 4,
      "size": 1088,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 5,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 6,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 7,
      "size": 1600,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 8,
      "size": 1600,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 9,
      "size": 1600,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 10,
      "size": 2112,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 11,
      "size": 2112,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 12,
      "size": 2112,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 13,
      "size": 2624,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 14,
      "size": 2624,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 15,
      "size": 2624,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 16,
      "size": 3136,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 17,
      "size": 3136,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 18,
      "size": 3136,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 19,
      "size": 3648,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 20,
      "size": 3648,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 21,
      "size": 3648,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 22,
      "size": 4160,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 23,
      "size": 4160,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 24,
      "size": 4160,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 25,
      "size": 4672,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 26,
      "size": 4672,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 27,
      "size": 4672,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 28,
      "size": 5184,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 29,
      "size": 5184,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 30,
      "size": 5184,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 31,
      "size": 5696,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 32,
      "size": 5696,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 33,
      "size": 5696,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 34,
      "size": 6208,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 35,
      "size": 6208,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "timeout",
      "ptb_reported_mtu": null,
      "attempt": 36,
      "size": 6208,
      "reason": "transient_loss_draw",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 37,
      "size": 6720,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 38,
      "size": 6720,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 39,
      "size": 6720,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 40,
      "size": 7232,
      "reason": "path_accepts",
      "oracle_synthetic": true
     }
    ]
   }
  },
  {
   "id": "path-change",
   "label": "Threshold moves mid-run",
   "teaches": "A threshold measured across a path change describes a path that no longer exists. The report refuses to average it away.",
   "expect_conclusion": "PATH_CHANGED_DURING_TEST",
   "matches_fixture_expectation": true,
   "report": {
    "conclusion": "PATH_CHANGED_DURING_TEST",
    "conclusion_vocabulary": [
     "INSUFFICIENT_SAMPLES",
     "NO_SIZE_CONSTRAINT_OBSERVED",
     "OBSERVED_EXPLICIT_PTB_INTERVAL",
     "PATH_CHANGED_DURING_TEST",
     "PROBE_BUDGET_EXHAUSTED",
     "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
     "UNKNOWN_TRANSIENT_LOSS"
    ],
    "observed_success_interval": {
     "highest_size_with_a_success": 1344,
     "lowest_size_probed": 576,
     "highest_size_probed": 5440,
     "note": "an interval of probed sizes, not a path limit"
    },
    "explicit_ptb": {
     "seen": true,
     "sizes": [
      1344,
      1600,
      1856,
      2112,
      2368,
      2624,
      2880,
      3136,
      3392,
      3648,
      3904,
      4160,
      4416,
      4672,
      4928,
      5184,
      5440
     ],
     "reported_mtu": 1200
    },
    "repeated_timeout_sizes": [],
    "samples": {
     "attempts": 60,
     "retry_cap_per_size": 3,
     "probe_budget": 60,
     "min_samples_floor": 6,
     "budget_exhausted": true
    },
    "per_size": [
     {
      "size": 576,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 832,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1088,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1344,
      "attempts": 3,
      "outcomes": [
       "success",
       "success",
       "packet_too_big"
      ],
      "success": true,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": true
     },
     {
      "size": 1600,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1856,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2112,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2368,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2624,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 2880,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3136,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3392,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3648,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 3904,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4160,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4416,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4672,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 4928,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5184,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 5440,
      "attempts": 3,
      "outcomes": [
       "packet_too_big",
       "packet_too_big",
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1200,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     }
    ],
    "observations": [
     "the path changed behaviour part way through the run, so a threshold measured across the change would describe a path that no longer exists"
    ],
    "path_mtu": null,
    "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
    "synthetic": true,
    "trace": [
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 1,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 2,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 3,
      "size": 576,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 4,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 5,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 6,
      "size": 832,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 7,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 8,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 9,
      "size": 1088,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 10,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 11,
      "size": 1344,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 12,
      "size": 1344,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 13,
      "size": 1600,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 14,
      "size": 1600,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 15,
      "size": 1600,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 16,
      "size": 1856,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 17,
      "size": 1856,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 18,
      "size": 1856,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 19,
      "size": 2112,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 20,
      "size": 2112,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 21,
      "size": 2112,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 22,
      "size": 2368,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 23,
      "size": 2368,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 24,
      "size": 2368,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 25,
      "size": 2624,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 26,
      "size": 2624,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 27,
      "size": 2624,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 28,
      "size": 2880,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 29,
      "size": 2880,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 30,
      "size": 2880,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 31,
      "size": 3136,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 32,
      "size": 3136,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 33,
      "size": 3136,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 34,
      "size": 3392,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 35,
      "size": 3392,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 36,
      "size": 3392,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 37,
      "size": 3648,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 38,
      "size": 3648,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 39,
      "size": 3648,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 40,
      "size": 3904,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 41,
      "size": 3904,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 42,
      "size": 3904,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 43,
      "size": 4160,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 44,
      "size": 4160,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 45,
      "size": 4160,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 46,
      "size": 4416,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 47,
      "size": 4416,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 48,
      "size": 4416,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 49,
      "size": 4672,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 50,
      "size": 4672,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 51,
      "size": 4672,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 52,
      "size": 4928,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 53,
      "size": 4928,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 54,
      "size": 4928,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 55,
      "size": 5184,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 56,
      "size": 5184,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 57,
      "size": 5184,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 58,
      "size": 5440,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 59,
      "size": 5440,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1200,
      "attempt": 60,
      "size": 5440,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     }
    ]
   }
  },
  {
   "id": "too-few-samples",
   "label": "Two attempts against a 6 sample floor",
   "teaches": "Declaring 'not enough data' is a result. It is the one most tools refuse to publish and the one that saves people from a wrong answer.",
   "expect_conclusion": "INSUFFICIENT_SAMPLES",
   "matches_fixture_expectation": true,
   "report": {
    "conclusion": "INSUFFICIENT_SAMPLES",
    "conclusion_vocabulary": [
     "INSUFFICIENT_SAMPLES",
     "NO_SIZE_CONSTRAINT_OBSERVED",
     "OBSERVED_EXPLICIT_PTB_INTERVAL",
     "PATH_CHANGED_DURING_TEST",
     "PROBE_BUDGET_EXHAUSTED",
     "UNKNOWN_BLACKHOLE_OR_UPSTREAM_LOSS",
     "UNKNOWN_TRANSIENT_LOSS"
    ],
    "observed_success_interval": {
     "highest_size_with_a_success": 1400,
     "lowest_size_probed": 1400,
     "highest_size_probed": 1664,
     "note": "an interval of probed sizes, not a path limit"
    },
    "explicit_ptb": {
     "seen": true,
     "sizes": [
      1664
     ],
     "reported_mtu": 1400
    },
    "repeated_timeout_sizes": [],
    "samples": {
     "attempts": 2,
     "retry_cap_per_size": 1,
     "probe_budget": 2,
     "min_samples_floor": 6,
     "budget_exhausted": true
    },
    "per_size": [
     {
      "size": 1400,
      "attempts": 1,
      "outcomes": [
       "success"
      ],
      "success": true,
      "ptb": false,
      "repeated_timeout": false,
      "ptb_reported_mtu": null,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     },
     {
      "size": 1664,
      "attempts": 1,
      "outcomes": [
       "packet_too_big"
      ],
      "success": false,
      "ptb": true,
      "repeated_timeout": false,
      "ptb_reported_mtu": 1400,
      "mixed_with_timeout": false,
      "mixed_with_ptb": false
     }
    ],
    "observations": [
     "only 2 attempts were made, below the 6-sample floor, so nothing can be concluded from this run"
    ],
    "path_mtu": null,
    "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
    "synthetic": true,
    "trace": [
     {
      "outcome": "success",
      "ptb_reported_mtu": null,
      "attempt": 1,
      "size": 1400,
      "reason": "path_accepts",
      "oracle_synthetic": true
     },
     {
      "outcome": "packet_too_big",
      "ptb_reported_mtu": 1400,
      "attempt": 2,
      "size": 1664,
      "reason": "next_hop_ptb",
      "oracle_synthetic": true
     }
    ]
   }
  }
 ],
 "loopback": [
  {
   "kind": "normal_download",
   "title": "Synthetic successful download",
   "what": "Invented application response; no real transfer.",
   "summary": "200000 payload bytes accepted (synthetic).",
   "observed": {
    "body_bytes": 200000,
    "completed": true
   },
   "synthetic": true
  },
  {
   "kind": "body_limit",
   "title": "Synthetic application body cap",
   "what": "Invented application limit, not a path MTU.",
   "summary": "65536 bytes accepted;65537 bytes refused with HTTP413 (synthetic).",
   "limit_bytes": 65536,
   "accepted_bytes": 65536,
   "refusal_status": 413,
   "synthetic": true
  },
  {
   "kind": "application_stall",
   "title": "Synthetic application stall",
   "what": "Invented server behavior, not a packet-size measurement.",
   "summary": "Small request completes; another request times out (synthetic).",
   "synthetic": true
  }
 ],
 "diagnosis": {
  "https_works_small_messages_only": {
   "symptom": "https_works_small_messages_only",
   "claim_under_test": "a size threshold on this path explains why only small HTTPS requests work",
   "verdict": "UNKNOWN",
   "observations": [
    "small requests working proves the path carries a small bytes, not that it cannot carry more",
    "nothing here measures the largest packet any hop accepts, so no threshold exists to confirm"
   ],
   "missing_evidence": [
    "a saved HTTPS request at the small size that was said to work",
    "a saved transport run with an explicit probe ladder"
   ],
   "evidence_used": [],
   "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
   "prescribes_no_change": true,
   "names_no_provider": true
  },
  "no_packet_too_big_ever_seen": {
   "symptom": "no_packet_too_big_ever_seen",
   "claim_under_test": "no packet-too-big has ever been seen on this path",
   "verdict": "UNKNOWN",
   "observations": [
    "no explicit error was recorded during the runs that were saved",
    "absence of an error is not evidence of absence: the whole point of RFC 1191 filtering is that the error never arrives"
   ],
   "missing_evidence": [
    "a probe ladder that reached sizes above the largest that works"
   ],
   "evidence_used": [],
   "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
   "prescribes_no_change": true,
   "names_no_provider": true
  },
  "application_upload_cap": {
   "symptom": "application_upload_cap",
   "claim_under_test": "the failure is a packet-size problem on the path",
   "verdict": "UNKNOWN",
   "observations": [
    "no saved application experiment exists to compare against"
   ],
   "missing_evidence": [
    "a saved application-level body-limit experiment"
   ],
   "evidence_used": [],
   "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
   "prescribes_no_change": true,
   "names_no_provider": true
  },
  "insufficient_samples": {
   "symptom": "insufficient_samples",
   "claim_under_test": "the saved runs are enough to decide this",
   "verdict": "UNKNOWN",
   "observations": [
    "no transport run was saved at all"
   ],
   "missing_evidence": [
    "a transport run with at least the sample floor"
   ],
   "evidence_used": [],
   "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
   "prescribes_no_change": true,
   "names_no_provider": true
  },
  "large_transfer_stalls": {
   "symptom": "large_transfer_stalls",
   "claim_under_test": "a path size limit is the reason large transfers stall",
   "verdict": "UNKNOWN",
   "observations": [
    "a stall is a symptom with many possible causes; nothing saved here narrows it"
   ],
   "missing_evidence": [
    "a probe ladder with an explicit probe at the stalling size",
    "whether the stall produced any error at all"
   ],
   "evidence_used": [],
   "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
   "prescribes_no_change": true,
   "names_no_provider": true
  },
  "route_mtu_is_the_path_limit": {
   "symptom": "route_mtu_is_the_path_limit",
   "claim_under_test": "the router's reported MTU is this path's limit",
   "verdict": "UNKNOWN",
   "observations": [
    "no saved router receipt exists"
   ],
   "missing_evidence": [
    "a read-only route lookup receipt"
   ],
   "evidence_used": [],
   "end_to_end_pmtu": "END_TO_END_PMTU_UNKNOWN",
   "prescribes_no_change": true,
   "names_no_provider": true
  }
 },
 "symptoms": [
  {
   "id": "https_works_small_messages_only",
   "declared": "HTTPS works for small messages and fails for large ones, so the path MTU must be low.",
   "tempting": "the observed local interface MTU is the culprit",
   "why_tempting": "there is a real number on the router and it looks like an answer"
  },
  {
   "id": "no_packet_too_big_ever_seen",
   "declared": "No packet-too-big has ever been seen, so there is no size limit.",
   "tempting": "absence of evidence treated as evidence of absence",
   "why_tempting": "RFC 1191 filtering means the error usually never arrives at all"
  },
  {
   "id": "application_upload_cap",
   "declared": "Uploads fail above a certain size, so the packet size is wrong.",
   "tempting": "an HTTP body limit read as a network limit",
   "why_tempting": "the number is right there in the response, in bytes"
  },
  {
   "id": "insufficient_samples",
   "declared": "A handful of probes is enough to decide this.",
   "tempting": "a confident verdict from two observations",
   "why_tempting": "two data points always draw a line"
  },
  {
   "id": "large_transfer_stalls",
   "declared": "Large transfers stall, so a path size limit is the cause.",
   "tempting": "stall read as threshold",
   "why_tempting": "size and stall correlate more often than size and a real limit"
  },
  {
   "id": "route_mtu_is_the_path_limit",
   "declared": "The router's reported MTU is this path's limit.",
   "tempting": "a local number promoted to a path fact",
   "why_tempting": "it came from a router and routers are about paths"
  }
 ],
 "worksheet": [
  {
   "title": "1. Separate the four facts before you touch anything",
   "lines": [
    {
     "q": "Local link MTU \u2014 which machine, which interface, what number?",
     "note": "A. Write the machine and interface next to it. Without those it is an anonymous number that will be quoted as a path limit."
    },
    {
     "q": "Reported route MTU \u2014 does the route entry carry an MTU attribute?",
     "note": "B. Most route entries carry none. 'Absent' is a real answer."
    },
    {
     "q": "Largest payload an actual peer actually accepted \u2014 on which path?",
     "note": "C. Include the path and the date. One peer, one path, one run."
    },
    {
     "q": "End-to-end PMTU \u2014 do I have a measurement, or do I have an opinion?",
     "note": "D. If the answer is 'opinion', it stays END_TO_END_PMTU_UNKNOWN no matter how confident the opinion."
    }
   ]
  },
  {
   "title": "2. Can you tell a size threshold from plain loss?",
   "lines": [
    {
     "q": "Did the failure produce an explicit error, or was it silent?",
     "note": "Silent failure is loss, a rate limiter, or a filtered path. All three look identical to the sender."
    },
    {
     "q": "If it was silent, did a LARGER size ever succeed?",
     "note": "If yes, the failures are loss. A size boundary is monotone: above the threshold, nothing larger gets through."
    },
    {
     "q": "Did the same size ever both succeed and fail?",
     "note": "If yes, the path changed or the medium is lossy. No threshold exists in that data."
    },
    {
     "q": "How many attempts, per size, with what retry cap?",
     "note": "One attempt per size is not a sample. Write the number down."
    }
   ]
  },
  {
   "title": "3. Encapsulation",
   "lines": [
    {
     "q": "Is there a tunnel on this path at all?",
     "note": "If yes and its byte count is not declared, no budget can be published. UNSUPPLIED is a result, not a shrug."
    },
    {
     "q": "Who owns that byte count, and did they state it for THIS tunnel?",
     "note": "A vendor's current header size for a product you are not running is not a contract for your path."
    },
    {
     "q": "Am I subtracting the tunnel header once, or once per layer?",
     "note": "Once. An outer IP header plus a tunnel header plus the inner packet's own headers \u2014 each exactly once."
    }
   ]
  },
  {
   "title": "4. Before you call it a network problem",
   "lines": [
    {
     "q": "Is the failure above the transport?",
     "note": "An HTTP body limit, a quota, an app timeout \u2014 all look like a size failure from the outside."
    },
    {
     "q": "Does it fail on a path with no router at all?",
     "note": "If loopback reproduces it, it is not the path."
    },
    {
     "q": "Is anyone else affected at the same moment?",
     "note": "A single machine failing at a threshold is a strong hint about that machine, not about the path."
    }
   ]
  }
 ]
};
