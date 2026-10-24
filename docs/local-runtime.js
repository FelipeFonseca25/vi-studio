/* Local-only keepalive; no network outside this computer. */
(()=>{const beat=()=>fetch('/heartbeat').catch(()=>{});beat();setInterval(beat,20000);})();
