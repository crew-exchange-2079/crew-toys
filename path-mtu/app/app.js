/* Path MTU Evidence Kit — view logic.
 *
 * All data arrives in window.PMTU_KIT (see the synthetic data.js fixture).
 * Nothing here fetches anything, so the page works from file:// as well as from
 * the loopback server. There is no renderer, no canvas and no 3D: a packet stack
 * is a two-dimensional layout and pretending otherwise would hide the byte counts.
 */
(function () {
  "use strict";

  var D = window.PMTU_KIT || {};
  var UNKNOWN = "END_TO_END_PMTU_UNKNOWN";

  // ---------------------------------------------------------------- helpers
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function num(value, fallback) {
    var n = parseInt(value, 10);
    return isNaN(n) ? fallback : n;
  }

  // ------------------------------------------------------------------- tabs
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { selectTab(tab.dataset.tab); });
    });
  }
  function selectTab(name) {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.setAttribute("aria-selected", tab.dataset.tab === name ? "true" : "false");
    });
    document.querySelectorAll(".panel").forEach(function (panel) {
      panel.hidden = panel.id !== "tab-" + name;
    });
    if (name === "traces" && !$("trace-select").options.length) fillTraces();
    if (name === "graph" && !$("symptom-select").options.length) fillSymptoms();
    if (name === "loopback") renderLoopback();
    if (name === "worksheet") renderWorksheet();
  }

  // ------------------------------------------------------- 1. the four facts
  function renderFacts() {
    var grid = $("facts-grid");
    grid.innerHTML = "";
    (D.facts || []).forEach(function (fact) {
      var card = el("div", "fact");
      card.appendChild(el("div", "fact-kind", fact.kind));
      var value = el("div", "fact-value", fact.value);
      if (fact.value === UNKNOWN) value.classList.add("unknown");
      card.appendChild(value);
      card.appendChild(el("p", "fact-note", fact.means));
      var not = el("p", "fact-note");
      not.textContent = "Never this: " + fact.never;
      card.appendChild(not);
      grid.appendChild(card);
    });

    var host = $("real-evidence");
    host.innerHTML = "";
    host.appendChild(el("p", "fact-note",
      "No router receipt is included. All examples in this public edition are synthetic."));
  }

  // ------------------------------------------------------- 2. the packet stack
  var caseSpecs = {};

  function fillCases() {
    var select = $("case-select");
    select.innerHTML = "";
    (D.cases || []).forEach(function (spec) {
      caseSpecs[spec.id] = spec;
      var option = el("option", null, spec.label);
      option.value = spec.id;
      select.appendChild(option);
    });
  }

  function applySpecToControls(spec) {
    $("link-mtu").value = spec.link_mtu;
    $("ip-version").value = spec.ip_version;
    $("transport").value = spec.transport;
    $("ip-options").value = spec.ip_options_bytes || 0;
    $("ip6-ext").value = spec.ipv6_extension_bytes || 0;
    $("tcp-options").value = spec.tcp_options_bytes || 0;
    $("df-set").checked = !!spec.df;
    $("tunnel-present").checked = spec.tunnel_state !== "none";
    $("outer-ip").value = spec.outer_ip_version || spec.ip_version;
    if (spec.tunnel_overhead_bytes === null) {
      $("tunnel-bytes").value = "";
      $("tunnel-bytes").disabled = true;
    } else {
      $("tunnel-bytes").value = spec.tunnel_overhead_bytes;
      $("tunnel-bytes").disabled = false;
    }
    $("outer-ip").disabled = !spec.tunnel_state || spec.tunnel_state === "none";
  }

  function currentSpec() {
    var tunnelPresent = $("tunnel-present").checked;
    var declared = tunnelPresent && $("tunnel-bytes").value !== "" &&
      !$("tunnel-bytes").disabled;
    return {
      label: (caseSpecs[$("case-select").value] || {}).label || "custom",
      link_mtu: num($("link-mtu").value, 1500),
      ip_version: $("ip-version").value,
      transport: $("transport").value,
      ip_options_bytes: num($("ip-options").value, 0),
      ipv6_extension_bytes: num($("ip6-ext").value, 0),
      tcp_options_bytes: num($("tcp-options").value, 0),
      tunnel_present: tunnelPresent,
      tunnel_overhead_bytes: declared ? num($("tunnel-bytes").value, 0) : null,
      outer_ip_version: tunnelPresent ? $("outer-ip").value : null,
      df: $("df-set").checked
    };
  }

  var COLORS = { ip: "ip", transport: "transport", tunnel: "tunnel",
                 payload: "payload" };

  function renderStack() {
    var spec = currentSpec();
    var caseId = $("case-select").value;
    var built = buildBudget(spec);
    var host = $("stack-bar");
    host.innerHTML = "";
    host.setAttribute("aria-label", built.summary);

    built.segments.forEach(function (seg) {
      var widthPct = (seg.bytes / spec.link_mtu) * 100;
      var node = el("div", "seg " + (COLORS[seg.group] || seg.group));
      if (seg.bytes === null) {
        node.classList.add("unsupplied");
        widthPct = built.unsuppliedWidthPct;
        node.style.width = widthPct.toFixed(2) + "%";
        node.appendChild(el("span", null, "???"));
        node.appendChild(el("small", null, "not declared"));
      } else if (widthPct < 2.5) {
        node.style.width = Math.max(widthPct, 1.1).toFixed(2) + "%";
        node.appendChild(el("span", null, seg.bytes));
      } else {
        node.style.width = widthPct.toFixed(2) + "%";
        node.appendChild(el("span", null, seg.bytes));
        node.appendChild(el("small", null, seg.label));
      }
      if (seg.bytes !== null && seg.bytes < 0) node.classList.add("negative");
      host.appendChild(node);
    });

    $("stack-desc").textContent = built.summary;
    renderObservedStrip(spec);

    // ruler
    var ruler = $("stack-ruler");
    ruler.innerHTML = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (frac) {
      var mark = el("span", null, Math.round(spec.link_mtu * frac));
      mark.style.left = (frac * 100).toFixed(2) + "%";
      ruler.appendChild(mark);
    });

    // verdicts
    var row = $("stack-verdict");
    row.innerHTML = "";
    row.appendChild(verdict("Status", built.status,
      statusClass(built.status), built.statusExplain));
    row.appendChild(verdict("Payload", built.payloadLabel, "computed", built.payloadExplain));
    row.appendChild(verdict("End-to-end PMTU", UNKNOWN, "pmtu",
      "Unchanged by anything on this page. No probe was sent and no path was measured."));
    row.appendChild(verdict("This case", caseId,
      "unknown", (caseSpecs[caseId] || {}).why || ""));

    // layer table
    var body = $("layer-table").querySelector("tbody");
    body.innerHTML = "";
    built.rows.forEach(function (rowData) {
      var tr = el("tr");
      tr.appendChild(el("td", null, rowData.stage));
      var bytes = el("td", "num", rowData.bytes === null ? "UNSUPPLIED" : rowData.bytes);
      if (rowData.bytes === null) bytes.classList.add("src-unsupplied");
      tr.appendChild(bytes);
      var src = el("td", rowData.source === "protocol_fixed" ? "src-fixed"
                   : rowData.source === "unsupplied" ? "src-unsupplied" : "src-supplied",
                   rowData.source);
      tr.appendChild(src);
      tr.appendChild(el("td", "num", rowData.remaining === null ? "UNKNOWN"
        : rowData.remaining));
      tr.appendChild(el("td", null, rowData.note));
      body.appendChild(tr);
    });

    $("refs").textContent = built.refs;
    $("stack-hint").textContent = built.hint || "";
  }

  function renderObservedStrip(spec) {
    var strip = $("observed-strip");
    var receipt = (D.router_receipt || {}).receipt;
    if (!receipt) { strip.hidden = true; return; }
    strip.hidden = false;
    strip.innerHTML = "";
    var facts = (D.router_receipt || {}).facts || {};
    var a = facts.fact_a_local_link_mtu || {};
    var b = facts.fact_b_reported_route_mtu || {};
    strip.appendChild(el("span", "obs-tag", "REAL READ-ONLY ROUTE READ"));
    strip.appendChild(el("span", "obs-item",
      "fact A local link MTU: " + (a.value_bytes === null ? "unreadable"
        : a.value_bytes + " bytes")));
    strip.appendChild(el("span", "obs-item",
      "fact B reported route MTU: " + (b.value_bytes === null
        ? "attribute absent on this route entry" : b.value_bytes + " bytes")));
    strip.appendChild(el("span", "obs-item",
      "fact D end-to-end PMTU: " + UNKNOWN));
    if (spec.observed) {
      strip.appendChild(el("span", "obs-item strong",
        "this bar re-uses that local 1500 as a supplied contract; it is not a path limit"));
    }
  }

  function statusClass(status) {
    if (status === "COMPUTED") return "computed";
    if (status === "UNKNOWN_OVERHEAD") return "unknown-overhead";
    return "invalid-negative";
  }

  function verdict(key, value, cls, note) {
    var box = el("div", "verdict " + cls);
    box.appendChild(el("span", "k", key));
    box.appendChild(el("span", null, value));
    if (note) {
      var small = el("span", "note");
      small.textContent = note;
      box.appendChild(small);
    }
    return box;
  }

  /* An independent re-implementation of the arithmetic, in the browser, so the
     numbers on screen do not come from the Python run that generated data.js.
     If the two ever disagree the layer table and the bar would disagree with each
     other, which is visible rather than silent. */
  var FIXED = { ipv4_min: 20, ipv6_base: 40, tcp_min: 20, udp: 8 };

  function buildBudget(spec) {
    var rows = [];
    var segments = [];
    var remaining = spec.link_mtu;

    function push(stage, bytes, source, note) {
      rows.push({ stage: stage, bytes: bytes, source: source,
                  remaining: bytes === null ? null : remaining - bytes, note: note });
      if (bytes !== null) remaining -= bytes;
    }
    function seg(label, group, bytes) {
      segments.push({ label: label, group: group, bytes: bytes });
    }

    var tunnelPresent = spec.tunnel_present;
    var tunnelDeclared = tunnelPresent && spec.tunnel_overhead_bytes !== null;

    if (tunnelPresent) {
      var outer = spec.outer_ip_version || spec.ip_version;
      if (outer === "ipv4") {
        push("outer_ipv4_header_min", FIXED.ipv4_min, "protocol_fixed",
             "RFC 791 s3.1 — minimum 20 bytes. This header belongs to the encapsulation, not to the packet inside it.");
        seg("outer IPv4 " + FIXED.ipv4_min, "ip", FIXED.ipv4_min);
      } else {
        push("outer_ipv6_base_header", FIXED.ipv6_base, "protocol_fixed",
             "RFC 8200 s3.1 — fixed 40 bytes.");
        seg("outer IPv6 " + FIXED.ipv6_base, "ip", FIXED.ipv6_base);
      }
      if (tunnelDeclared) {
        push("tunnel_overhead", spec.tunnel_overhead_bytes, "supplied_contract",
             "A number the caller supplied for this exact tunnel. Not assumed, not looked up.");
        seg("tunnel " + spec.tunnel_overhead_bytes, "tunnel", spec.tunnel_overhead_bytes);
      } else {
        push("tunnel_overhead", null, "unsupplied",
             "A tunnel is present and nobody published its byte count. Not assumed to be zero and not assumed to be any product's current header.");
        seg("tunnel ???", "tunnel", null);
      }
    }

    if (spec.ip_version === "ipv4") {
      push("ipv4_header_min", FIXED.ipv4_min, "protocol_fixed", "RFC 791 s3.1.");
      seg("IPv4 " + FIXED.ipv4_min, "ip", FIXED.ipv4_min);
      if (spec.ip_options_bytes) {
        push("ipv4_options", spec.ip_options_bytes, "supplied_contract", "caller-declared");
        seg("IPv4 opts " + spec.ip_options_bytes, "ip", spec.ip_options_bytes);
      }
    } else {
      push("ipv6_base_header", FIXED.ipv6_base, "protocol_fixed", "RFC 8200 s3.1.");
      seg("IPv6 " + FIXED.ipv6_base, "ip", FIXED.ipv6_base);
      if (spec.ipv6_extension_bytes) {
        push("ipv6_extension_headers", spec.ipv6_extension_bytes, "supplied_contract", "caller-declared");
        seg("IPv6 ext " + spec.ipv6_extension_bytes, "ip", spec.ipv6_extension_bytes);
      }
    }

    if (spec.transport === "tcp") {
      push("tcp_header_min", FIXED.tcp_min, "protocol_fixed", "RFC 9293 s3.1.");
      seg("TCP " + FIXED.tcp_min, "transport", FIXED.tcp_min);
      if (spec.tcp_options_bytes) {
        push("tcp_options", spec.tcp_options_bytes, "supplied_contract", "caller-declared");
        seg("TCP opts " + spec.tcp_options_bytes, "transport", spec.tcp_options_bytes);
      }
    } else {
      push("udp_header", FIXED.udp, "protocol_fixed", "RFC 768.");
      seg("UDP " + FIXED.udp, "transport", FIXED.udp);
    }

    var status, payload, payloadLabel, payloadExplain, statusExplain, hint = "";
    if (tunnelPresent && !tunnelDeclared) {
      status = "UNKNOWN_OVERHEAD";
      payload = null;
      payloadLabel = "NOT PUBLISHED";
      payloadExplain = "Publishing a payload figure without the tunnel term would invent the number the caller needs.";
      statusExplain = "A required overhead was not supplied, so no budget is published.";
      hint = "This is the case that a real 1500-byte interface number cannot fix. Fill in the tunnel's byte count to get an arithmetic answer.";
    } else if (remaining < 0) {
      status = "INVALID_NEGATIVE";
      payload = remaining;
      payloadLabel = remaining + " bytes";
      payloadExplain = "Headers alone exceed the declared contract. A configuration contradiction, not a measurement.";
      statusExplain = "Headers do not fit inside the declared link MTU.";
    } else {
      status = "COMPUTED";
      payload = remaining;
      payloadLabel = remaining + " bytes";
      payloadExplain = "Remaining after every header above, counted exactly once.";
      statusExplain = "Every required overhead was supplied or protocol-fixed.";
    }

    segments.push({ label: payload === null ? "no payload figure" :
                    (payload < 0 ? "over by " + (-payload) : "payload"),
                     group: payload === null ? "payload" :
                     (payload < 0 ? "negative" : "payload"),
                     bytes: payload === null ? null : payload });

    var frag;
    if (spec.ip_version === "ipv6") {
      frag = "IPv6: routers never fragment (RFC 8200 s4.3) and every link must carry 1280 bytes (s5).";
    } else if (spec.df) {
      frag = "IPv4 with DF set: a too-large packet is dropped and the source told, never split (RFC 791 s3.2).";
    } else {
      frag = "IPv4 without DF: a router may fragment the packet (RFC 791 s3.2).";
    }

    return {
      rows: rows, segments: segments, status: status, payload: payload,
      payloadLabel: payloadLabel, payloadExplain: payloadExplain,
      statusExplain: statusExplain, hint: hint,
      unsuppliedWidthPct: 14,
      summary: spec.label + " — " + spec.link_mtu + " byte contract. " +
        (payload === null ? "No payload figure: the tunnel overhead was never declared. "
                         : (payload < 0 ? "Headers exceed the contract by " + (-payload) + " bytes. "
                                         : payload + " payload bytes after every header. ")) +
        frag + " End-to-end PMTU: " + UNKNOWN + ".",
      refs: "Sources: RFC 791 (IPv4 min header 20 B, fragmentation), RFC 8200 (IPv6 base 40 B, " +
            "no router fragmentation, 1280 B minimum link), RFC 9293 (TCP min header 20 B), " +
            "RFC 768 (UDP 8 B), RFC 1191 / RFC 8201 (packet-too-big carries the next hop's MTU)."
    };
  }

  // --------------------------------------------------------- 3. the traces
  function fillTraces() {
    var select = $("trace-select");
    (D.traces || []).forEach(function (trace) {
      var option = el("option", null, trace.label);
      option.value = trace.id;
      select.appendChild(option);
    });
    renderTrace();
    $("trace-select").addEventListener("change", renderTrace);
    $("btn-replay").addEventListener("click", renderTrace);
  }

  function renderTrace() {
    var id = $("trace-select").value;
    var trace = (D.traces || []).filter(function (t) { return t.id === id; })[0];
    if (!trace) return;
    $("trace-teaches").textContent = trace.teaches;

    var row = $("trace-verdict");
    row.innerHTML = "";
    var cls = trace.report.conclusion.indexOf("UNKNOWN") === 0 ? "unknown"
      : (trace.report.conclusion === "OBSERVED_EXPLICIT_PTB_INTERVAL" ? "confirmed"
         : (trace.report.conclusion === "NO_SIZE_CONSTRAINT_OBSERVED" ? "confirmed"
            : "unknown"));
    row.appendChild(verdict("Conclusion", trace.report.conclusion, cls,
      "One of a closed vocabulary. No other word may appear here."));
    row.appendChild(verdict("Path MTU", "not published", "unknown",
      "path_mtu is null in every report this kit produces, by construction."));
    row.appendChild(verdict("End-to-end PMTU", UNKNOWN, "pmtu", "Always."));

    var body = $("trace-table").querySelector("tbody");
    body.innerHTML = "";
    trace.report.trace.slice(0, 24).forEach(function (record) {
      var tr = el("tr");
      tr.appendChild(el("td", "num", record.attempt));
      tr.appendChild(el("td", "num", record.size));
      var outcome = el("td", null, record.outcome);
      if (record.outcome === "timeout") outcome.style.color = "var(--unknown)";
      if (record.outcome === "packet_too_big") outcome.style.color = "var(--bad)";
      if (record.outcome === "success") outcome.style.color = "var(--good)";
      tr.appendChild(outcome);
      tr.appendChild(el("td", "num", record.ptb_reported_mtu === null ? "—"
        : record.ptb_reported_mtu));
      tr.appendChild(el("td", null, record.reason));
      body.appendChild(tr);
    });

    var not = $("trace-not-prove");
    not.innerHTML = "";
    not.appendChild(el("h3", null, "What this trace does NOT prove"));
    var list = el("ul");
    trace.report.observations.forEach(function (text) {
      list.appendChild(el("li", null, text));
    });
    list.appendChild(el("li", null,
      "No packet left this machine. This is a seeded synthetic model, so its " +
      "conclusion is a property of the model, not of anyone's network."));
    not.appendChild(list);
  }

  // --------------------------------------------------------- 4. loopback
  function renderLoopback() {
    var host = $("loopback-list");
    host.innerHTML = "";
    (D.loopback || []).forEach(function (run) {
      var card = el("div", "lb");
      card.appendChild(el("h4", null, run.title));
      card.appendChild(el("p", "fact-note", run.what));
      var pre = el("pre", "kv", run.summary);
      card.appendChild(pre);
      host.appendChild(card);
    });
    // The raw receipts are filled by the toggle, not on tab select. Pre-filling here
    // made the button a no-op, which is exactly the kind of fake interaction this
    // card's browser proof is supposed to catch.
    $("loopback-raw").textContent = "";
    var sep = $("loopback-separation");
    sep.innerHTML = "";
    sep.appendChild(el("h3", null, "Keep these apart"));
    var list = el("ul");
    [
      "These application examples are invented fixtures; no transfer was performed by this page.",
      "Synthetic application outcomes are not evidence about any router, tunnel, ISP or path.",
      "The server body limit below is an APPLICATION fact. A path MTU is a PATH fact. The same word 'bytes' does not make them the same evidence.",
      "Real observations would belong under fact C. These synthetic examples establish no observed payload size."
    ].forEach(function (text) { list.appendChild(el("li", null, text)); });
    sep.appendChild(list);
  }

  // --------------------------------------------------------- 5. diagnosis
  function fillSymptoms() {
    var select = $("symptom-select");
    (D.symptoms || []).forEach(function (symptom) {
      var option = el("option", null, symptom.declared);
      option.value = symptom.id;
      select.appendChild(option);
    });
    renderSymptom();
    $("symptom-select").addEventListener("change", renderSymptom);
  }

  function renderSymptom() {
    var id = $("symptom-select").value;
    var declared = (D.symptoms || []).filter(function (s) { return s.id === id; })[0];
    var decision = (D.diagnosis || {})[id];
    if (!declared || !decision) return;
    $("symptom-declared").textContent = "Claim under test: " + decision.claim_under_test;

    var row = $("symptom-verdict");
    row.innerHTML = "";
    row.appendChild(verdict("Verdict", decision.verdict,
      decision.verdict.toLowerCase(),
      "Decided from saved evidence only."));
    row.appendChild(verdict("End-to-end PMTU", UNKNOWN, "pmtu", "Never decided by this page."));
    row.appendChild(verdict("Prescribes a change", "no", "confirmed",
      "This kit proposes no change to any MTU, MSS, firewall or router."));

    var obs = $("symptom-observations");
    obs.innerHTML = "";
    decision.observations.forEach(function (text) {
      obs.appendChild(el("li", null, text));
    });
    var missing = $("symptom-missing");
    missing.innerHTML = "";
    if (!decision.missing_evidence.length) {
      missing.appendChild(el("li", null, "Nothing further needed for this verdict."));
    } else {
      decision.missing_evidence.forEach(function (text) {
        missing.appendChild(el("li", null, text));
      });
    }
  }

  // --------------------------------------------------------- 6. worksheet
  function renderWorksheet() {
    var host = $("worksheet");
    host.innerHTML = "";
    (D.worksheet || []).forEach(function (section) {
      var block = el("div", "worksheet-block");
      block.appendChild(el("h3", null, section.title));
      (section.lines || []).forEach(function (line) {
        var row = el("div", "ws-line");
        row.appendChild(el("span", "ws-box"));
        var body = el("div");
        body.appendChild(el("div", "ws-q", line.q));
        if (line.note) body.appendChild(el("div", "ws-note", line.note));
        row.appendChild(body);
        block.appendChild(row);
      });
      host.appendChild(block);
    });
    var tail = el("div", "worksheet-block");
    tail.appendChild(el("h3", null, "The only thing this page will not let you do"));
    tail.appendChild(el("p", "ws-note",
      "Write down the largest packet you have evidence a real hop accepted, or leave it blank. " +
      "Leave it blank if all you have is a local interface MTU, a route attribute, an " +
      "application body limit, or silence on a probe. Each of those is a different fact and " +
      "none of them is the path limit."));
    tail.appendChild(el("p", "footer-pmtu",
      "End-to-end PMTU as of this print: " + UNKNOWN + "."));
    host.appendChild(tail);
  }

  // ------------------------------------------------------------------- init
  function init() {
    $("pmtu-value").textContent = D.end_to_end_pmtu || UNKNOWN;
    $("banner-why").textContent = D.banner_why ||
      "Nothing in this kit measures a real path to a real peer. Everything it shows is a " +
      "protocol constant, a contract number somebody supplied, or a synthetic fixture label.";
    initTabs();
    renderFacts();
    fillCases();
    // Lead with the one real number this card has, when it has one. This has to
    // happen AFTER fillCases() populates the select, or setting .value is a no-op.
    var observed = (D.cases || []).filter(function (spec) { return spec.observed; })[0];
    if (observed) { $("case-select").value = observed.id; }
    applySpecToControls(caseSpecs[$("case-select").value] || {});
    renderStack();
    renderLoopback();
    document.addEventListener("keydown", function (event) {
      if (event.target && ["INPUT", "SELECT", "TEXTAREA"].indexOf(event.target.tagName) >= 0) return;
      var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
      var index = tabs.findIndex(function (tab) { return tab.getAttribute("aria-selected") === "true"; });
      if (event.key === "ArrowRight" && index < tabs.length - 1) { selectTab(tabs[index + 1].dataset.tab); tabs[index + 1].focus(); }
      if (event.key === "ArrowLeft" && index > 0) { selectTab(tabs[index - 1].dataset.tab); tabs[index - 1].focus(); }
    });
    ["ip-version", "transport", "link-mtu", "ip-options", "ip6-ext", "tcp-options",
     "df-set", "tunnel-bytes", "outer-ip"].forEach(function (id) {
      $(id).addEventListener("input", renderStack);
      $(id).addEventListener("change", renderStack);
    });
    $("tunnel-present").addEventListener("change", function () {
      var on = $("tunnel-present").checked;
      $("tunnel-bytes").disabled = !on;
      $("outer-ip").disabled = !on;
      renderStack();
    });
    $("case-select").addEventListener("change", function () {
      applySpecToControls(caseSpecs[$("case-select").value] || {});
      renderStack();
    });
    $("btn-reveal-missing").addEventListener("click", function () {
      $("tunnel-present").checked = true;
      $("tunnel-bytes").value = "";
      $("tunnel-bytes").disabled = true;
      $("outer-ip").disabled = false;
      renderStack();
    });
    $("btn-reset").addEventListener("click", function () {
      applySpecToControls(caseSpecs[$("case-select").value] || {});
      renderStack();
    });
    $("btn-loopback-detail").addEventListener("click", function () {
      var raw = $("loopback-raw");
      var showing = raw.hidden;
      raw.hidden = !showing;
      this.setAttribute("aria-expanded", showing ? "true" : "false");
      this.textContent = showing ? "Hide synthetic records" : "Show synthetic records";
      $("loopback-hint").textContent = showing
        ? "Synthetic example values, not captured receipts."
        : "";
      if (showing) { raw.textContent = JSON.stringify(D.loopback, null, 1); }
    });
    $("btn-print").addEventListener("click", function () { window.print(); });
    window.__pmtuKitReady = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();