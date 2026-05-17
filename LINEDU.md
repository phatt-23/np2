Web ma bezet na `linedu.cs.vsb.cz`,
kde jsou zakazane inline scritpy a styly a cross-site css a js soubory.

Kdyz navstivim `cs.vsb.cz/kot/TRA0163`, v konzoli mam:
```
Content-Security-Policy: The page’s settings blocked an inline style (style-src-elem) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-GsQC5AaXpdCaKTyWbxBzn7nitfp0Otwn7I/zu0rUKOs=', requires 'unsafe-hashes' for style attributes) or a nonce. <anonymous code>:51:18
Content-Security-Policy: The page’s settings blocked an inline style (style-src-elem) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-dd4J3UnQShsOmqcYi4vN5BT3mGZB/0fOwBA72rsguKc=', requires 'unsafe-hashes' for style attributes) or a nonce. content.js:85:443
Content-Security-Policy: The page’s settings blocked an inline script (script-src-elem) from being executed because it violates the following directive: “script-src 'self'”. Consider using a hash ('sha256-GoYXENcjYncFNIufD3mu0X9Qvy5NKqNtGrQfM/hOPIQ=') or a nonce. content.js:71:183
Content-Security-Policy: The page’s settings blocked an inline script (script-src-elem) from being executed because it violates the following directive: “script-src 'self'”. Consider using a hash ('sha256-k5N7iLJvxBVNPSqeKsRaR77H4cNZaHrXhFgLVoNbT9o=') or a nonce. content.js:71:183
Content-Security-Policy: The page’s settings blocked a style (style-src-elem) at https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css from being applied because it violates the following directive: “style-src 'self'” 6 TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-elem) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-GsQC5AaXpdCaKTyWbxBzn7nitfp0Otwn7I/zu0rUKOs=', requires 'unsafe-hashes' for style attributes) or a nonce. <anonymous code>:56:39
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-tcbDxjMo+xKqM21aCGYbs/QAJqB7yUXC06oPWDapBgc=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: display: contents TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-FEPc733Qvk8kdDpf06szamFX+kZh9XeUZL7q1kyR+V0=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: height:0.6944em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-h3LJfarqTiNL5+jWFQzNC9b8AMRniJSo82jR38bJFE8=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: margin-right:0.0315em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-FEPc733Qvk8kdDpf06szamFX+kZh9XeUZL7q1kyR+V0=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: height:0.6944em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-h3LJfarqTiNL5+jWFQzNC9b8AMRniJSo82jR38bJFE8=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: margin-right:0.0315em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-78QzS7s2DqSZvDD0gCsVL5k0kSVd7K+tw3NU6wHTni0=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: height:0.6833em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-OzsnWRZ0Wd7bDs+/YE01yHtHBXFhzpjRDGufUR59a5Y=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: margin-right:0.0576em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-hcktlmCEwrTRcYgjnTm5tuoe7l7I39IW9wFvjOFFyL4=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: height:0.4306em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-2690F4AaQPruAPRxBv1h1zQ8Tm8DtXwB2rs7U59DLAk=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: margin-right:0.1132em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-78QzS7s2DqSZvDD0gCsVL5k0kSVd7K+tw3NU6wHTni0=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: height:0.6833em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-OzsnWRZ0Wd7bDs+/YE01yHtHBXFhzpjRDGufUR59a5Y=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: margin-right:0.0576em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-hcktlmCEwrTRcYgjnTm5tuoe7l7I39IW9wFvjOFFyL4=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: height:0.4306em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline style (style-src-attr) from being applied because it violates the following directive: “style-src 'self'”. Consider using a hash ('sha256-2690F4AaQPruAPRxBv1h1zQ8Tm8DtXwB2rs7U59DLAk=', requires 'unsafe-hashes' for style attributes) or a nonce.
Source: margin-right:0.1132em; TRA0163
Content-Security-Policy: The page’s settings blocked an inline script (script-src-elem) from being executed because it violates the following directive: “script-src 'self'”. Consider using a hash ('sha256-7CXoWuvS0ttgn0dw4PulusYHkrsTXn+B5PO9FSES0QI=') or a nonce. TRA0163:25:12
```

Stranka nema zadne styly a nefunguje javascript, ktere jsou inline.

Pokud nastavim `svelte.config.js` s:
```
csp: {
    directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"]
    }
},
```

tak mam v konzoli stejne error zpravy.

Co mam udelat aby se stranka vygenerovana pomoci `npm run build` fungovala a aby neporusovala CPS?

