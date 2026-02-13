import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { useScrollSpy } from '../hooks/useScrollSpy';
import useSEO from '../hooks/useSEO';
import { API_URL } from '../config';
import DocsSidebar from '../components/DocsSidebar';
import SharedCopyButton from '../components/CopyButton';

const API_BASE = 'https://x402-api.onrender.com';

const SECTION_IDS = ['quickstart', 'protocol', 'api-reference', 'native-wrappers', 'mcp', 'integration', 'security'];

const MCP_TOOLS = [
  { name: 'discover_marketplace', cost: 'Free', desc_en: 'Discover endpoints and total services', desc_fr: 'Decouvrir les endpoints et le nombre de services' },
  { name: 'search_services', cost: '0.05 USDC', desc_en: 'Search APIs by keyword', desc_fr: 'Rechercher des APIs par mot-cle' },
  { name: 'list_services', cost: '0.05 USDC', desc_en: 'List all available services', desc_fr: 'Lister tous les services disponibles' },
  { name: 'find_tool_for_task', cost: '0.05 USDC', desc_en: 'Describe a task, get the best API', desc_fr: 'Decrivez un besoin, obtenez la meilleure API' },
  { name: 'call_api', cost: 'Free', desc_en: 'Call any external API URL', desc_fr: 'Appeler une API externe' },
  { name: 'get_wallet_balance', cost: 'Free', desc_en: 'Check USDC balance on Base', desc_fr: 'Verifier le solde USDC sur Base' },
  { name: 'get_budget_status', cost: 'Free', desc_en: 'Check spending and remaining budget', desc_fr: 'Verifier les depenses et le budget restant' },
];

const NATIVE_ENDPOINTS = [
  {
    id: 'search', route: '/api/search', method: 'GET', price: '0.005',
    titleKey: 'searchTitle', descKey: 'searchDesc',
    params: [{ name: 'q', type: 'string', required: true, descKey: 'searchParamQ' }],
    curl: `curl "${API_BASE}/api/search?q=bitcoin+price"`,
    response: `{
  "query": "bitcoin price",
  "results": [
    { "title": "Bitcoin Price Today", "url": "https://...", "snippet": "Current BTC price..." }
  ],
  "_payment": { "amount": 0.005, "txHash": "0x..." }
}`,
  },
  {
    id: 'scrape', route: '/api/scrape', method: 'GET', price: '0.005',
    titleKey: 'scrapeTitle', descKey: 'scrapeDesc',
    params: [{ name: 'url', type: 'string', required: true, descKey: 'scrapeParamUrl' }],
    curl: `curl "${API_BASE}/api/scrape?url=https://example.com"`,
    response: `{
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\\nThis domain is for use in examples...",
  "_payment": { "amount": 0.005, "txHash": "0x..." }
}`,
  },
  {
    id: 'twitter', route: '/api/twitter', method: 'GET', price: '0.005',
    titleKey: 'twitterTitle', descKey: 'twitterDesc',
    params: [
      { name: 'user', type: 'string', required: false, descKey: 'twitterParamUser' },
      { name: 'tweet', type: 'string', required: false, descKey: 'twitterParamTweet' },
      { name: 'search', type: 'string', required: false, descKey: 'twitterParamSearch' },
      { name: 'max', type: 'number', required: false, descKey: 'twitterParamMax' },
    ],
    curl: `curl "${API_BASE}/api/twitter?user=elonmusk"`,
    response: `{
  "user": { "name": "Elon Musk", "username": "elonmusk", "followers": 200000000 },
  "_payment": { "amount": 0.005, "txHash": "0x..." }
}`,
  },
  {
    id: 'weather', route: '/api/weather', method: 'GET', price: '0.02',
    titleKey: 'weatherTitle', descKey: 'weatherDesc',
    params: [{ name: 'city', type: 'string', required: true, descKey: 'weatherParamCity' }],
    curl: `curl "${API_BASE}/api/weather?city=Paris"`,
    response: `{
  "city": "Paris",
  "temperature": 12,
  "condition": "Partly cloudy",
  "humidity": 72,
  "_payment": { "amount": 0.02, "txHash": "0x..." }
}`,
  },
  {
    id: 'crypto', route: '/api/crypto', method: 'GET', price: '0.02',
    titleKey: 'cryptoTitle', descKey: 'cryptoDesc',
    params: [{ name: 'coin', type: 'string', required: true, descKey: 'cryptoParamCoin' }],
    curl: `curl "${API_BASE}/api/crypto?coin=bitcoin"`,
    response: `{
  "coin": "bitcoin",
  "price_usd": 97450.32,
  "change_24h": 2.4,
  "market_cap": 1920000000000,
  "_payment": { "amount": 0.02, "txHash": "0x..." }
}`,
  },
  {
    id: 'joke', route: '/api/joke', method: 'GET', price: '0.01',
    titleKey: 'jokeTitle', descKey: 'jokeDesc',
    params: [],
    curl: `curl "${API_BASE}/api/joke"`,
    response: `{
  "type": "twopart",
  "setup": "Why do programmers prefer dark mode?",
  "delivery": "Because light attracts bugs.",
  "_payment": { "amount": 0.01, "txHash": "0x..." }
}`,
  },
  {
    id: 'image', route: '/api/image', method: 'GET', price: '0.05',
    titleKey: 'imageTitle', descKey: 'imageDesc',
    params: [
      { name: 'prompt', type: 'string', required: true, descKey: 'imageParamPrompt' },
      { name: 'size', type: 'string', required: false, descKey: 'imageParamSize' },
      { name: 'quality', type: 'string', required: false, descKey: 'imageParamQuality' },
    ],
    curl: `curl "${API_BASE}/api/image?prompt=a+cat+in+space"`,
    response: `{
  "prompt": "a cat in space",
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "size": "1024x1024",
  "_payment": { "amount": 0.05, "txHash": "0x..." }
}`,
  },
  {
    id: 'translate', route: '/api/translate', method: 'GET', price: '0.005',
    titleKey: 'translateTitle', descKey: 'translateDesc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'translateParamText' },
      { name: 'from', type: 'string', required: false, descKey: 'translateParamFrom' },
      { name: 'to', type: 'string', required: true, descKey: 'translateParamTo' },
    ],
    curl: `curl "${API_BASE}/api/translate?text=Hello&to=fr"`,
    response: `{
  "success": true,
  "translatedText": "Bonjour",
  "from": "en",
  "to": "fr",
  "original": "Hello"
}`,
  },
  {
    id: 'summarize', route: '/api/summarize', method: 'GET', price: '0.01',
    titleKey: 'summarizeTitle', descKey: 'summarizeDesc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'summarizeParamText' },
      { name: 'maxLength', type: 'number', required: false, descKey: 'summarizeParamMax' },
    ],
    curl: `curl "${API_BASE}/api/summarize?text=Long+article+text+here...&maxLength=100"`,
    response: `{
  "success": true,
  "summary": "Brief summary of the text",
  "originalLength": 5000,
  "summaryLength": 150
}`,
  },
  {
    id: 'code', route: '/api/code', method: 'POST', price: '0.005',
    titleKey: 'codeTitle', descKey: 'codeDesc',
    params: [
      { name: 'language', type: 'string', required: true, descKey: 'codeParamLang' },
      { name: 'code', type: 'string', required: true, descKey: 'codeParamCode' },
    ],
    curl: `curl -X POST "${API_BASE}/api/code" -H "Content-Type: application/json" -d '{"language":"python","code":"print(42)"}'`,
    response: `{
  "success": true,
  "language": "python",
  "version": "3.10.12",
  "output": "42\\n",
  "stderr": ""
}`,
  },
  {
    id: 'dns', route: '/api/dns', method: 'GET', price: '0.003',
    titleKey: 'dnsTitle', descKey: 'dnsDesc',
    params: [
      { name: 'domain', type: 'string', required: true, descKey: 'dnsParamDomain' },
      { name: 'type', type: 'string', required: false, descKey: 'dnsParamType' },
    ],
    curl: `curl "${API_BASE}/api/dns?domain=google.com&type=A"`,
    response: `{
  "success": true,
  "domain": "google.com",
  "type": "A",
  "records": ["142.251.41.14"]
}`,
  },
  {
    id: 'qrcode-gen', route: '/api/qrcode-gen', method: 'GET', price: '0.003',
    titleKey: 'qrcodeGenTitle', descKey: 'qrcodeGenDesc',
    params: [
      { name: 'data', type: 'string', required: true, descKey: 'qrcodeGenParamData' },
      { name: 'size', type: 'number', required: false, descKey: 'qrcodeGenParamSize' },
    ],
    curl: `curl "${API_BASE}/api/qrcode-gen?data=https://x402bazaar.org&size=300"`,
    response: `{
  "success": true,
  "imageUrl": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
  "data": "https://x402bazaar.org",
  "size": 300
}`,
  },
  {
    id: 'readability', route: '/api/readability', method: 'GET', price: '0.005',
    titleKey: 'readabilityTitle', descKey: 'readabilityDesc',
    params: [
      { name: 'url', type: 'string', required: true, descKey: 'readabilityParamUrl' },
    ],
    curl: `curl "${API_BASE}/api/readability?url=https://example.com"`,
    response: `{
  "success": true,
  "title": "Example Domain",
  "text": "Full extracted article text...",
  "wordCount": 1200,
  "url": "https://example.com"
}`,
  },
  {
    id: 'sentiment', route: '/api/sentiment', method: 'GET', price: '0.005',
    titleKey: 'sentimentTitle', descKey: 'sentimentDesc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'sentimentParamText' },
    ],
    curl: `curl "${API_BASE}/api/sentiment?text=I+love+this+product"`,
    response: `{
  "success": true,
  "sentiment": "positive",
  "score": 0.85,
  "keywords": ["love", "product"],
  "text": "I love this product"
}`,
  },
  {
    id: 'validate-email', route: '/api/validate-email', method: 'GET', price: '0.003',
    titleKey: 'validateEmailTitle', descKey: 'validateEmailDesc',
    params: [
      { name: 'email', type: 'string', required: true, descKey: 'validateEmailParamEmail' },
    ],
    curl: `curl "${API_BASE}/api/validate-email?email=test@example.com"`,
    response: `{
  "success": true,
  "email": "test@example.com",
  "valid": true,
  "format": true,
  "mxRecords": true,
  "domain": "example.com"
}`,
  },
  {
    id: 'hash', route: '/api/hash', method: 'GET', price: '0.001',
    titleKey: 'hashTitle', descKey: 'hashDesc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'hashParamText' },
      { name: 'algo', type: 'string', required: false, descKey: 'hashParamAlgo' },
    ],
    curl: `curl "${API_BASE}/api/hash?text=hello&algo=sha256"`,
    response: `{
  "success": true,
  "hash": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  "algorithm": "sha256",
  "input_length": 5
}`,
  },
  {
    id: 'uuid', route: '/api/uuid', method: 'GET', price: '0.001',
    titleKey: 'uuidTitle', descKey: 'uuidDesc',
    params: [
      { name: 'count', type: 'number', required: false, descKey: 'uuidParamCount' },
    ],
    curl: `curl "${API_BASE}/api/uuid?count=3"`,
    response: `{
  "success": true,
  "uuids": ["a1b2c3d4-e5f6-...", "b2c3d4e5-f6g7-...", "c3d4e5f6-g7h8-..."],
  "count": 3
}`,
  },
  {
    id: 'base64', route: '/api/base64', method: 'GET', price: '0.001',
    titleKey: 'base64Title', descKey: 'base64Desc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'base64ParamText' },
      { name: 'mode', type: 'string', required: false, descKey: 'base64ParamMode' },
    ],
    curl: `curl "${API_BASE}/api/base64?text=hello&mode=encode"`,
    response: `{
  "success": true,
  "result": "aGVsbG8=",
  "mode": "encode",
  "input_length": 5,
  "output_length": 8
}`,
  },
  {
    id: 'password', route: '/api/password', method: 'GET', price: '0.001',
    titleKey: 'passwordTitle', descKey: 'passwordDesc',
    params: [
      { name: 'length', type: 'number', required: false, descKey: 'passwordParamLength' },
      { name: 'symbols', type: 'string', required: false, descKey: 'passwordParamSymbols' },
      { name: 'numbers', type: 'string', required: false, descKey: 'passwordParamNumbers' },
      { name: 'uppercase', type: 'string', required: false, descKey: 'passwordParamUppercase' },
    ],
    curl: `curl "${API_BASE}/api/password?length=20&symbols=true"`,
    response: `{
  "success": true,
  "password": "Kx7@mP2qLz9$vR4wB5!t",
  "length": 20,
  "options": { "symbols": true, "numbers": true, "uppercase": true }
}`,
  },
  {
    id: 'currency', route: '/api/currency', method: 'GET', price: '0.005',
    titleKey: 'currencyTitle', descKey: 'currencyDesc',
    params: [
      { name: 'from', type: 'string', required: true, descKey: 'currencyParamFrom' },
      { name: 'to', type: 'string', required: true, descKey: 'currencyParamTo' },
      { name: 'amount', type: 'number', required: false, descKey: 'currencyParamAmount' },
    ],
    curl: `curl "${API_BASE}/api/currency?from=USD&to=EUR&amount=100"`,
    response: `{
  "success": true,
  "from": "USD",
  "to": "EUR",
  "amount": 100,
  "converted": 92.50,
  "rate": 0.925,
  "date": "2026-02-13"
}`,
  },
  {
    id: 'timestamp', route: '/api/timestamp', method: 'GET', price: '0.001',
    titleKey: 'timestampTitle', descKey: 'timestampDesc',
    params: [
      { name: 'ts', type: 'number', required: false, descKey: 'timestampParamTs' },
      { name: 'date', type: 'string', required: false, descKey: 'timestampParamDate' },
    ],
    curl: `curl "${API_BASE}/api/timestamp"`,
    response: `{
  "success": true,
  "timestamp": 1739439600,
  "timestamp_ms": 1739439600000,
  "iso": "2026-02-13T10:30:00.000Z",
  "utc": "Fri, 13 Feb 2026 10:30:00 GMT"
}`,
  },
  {
    id: 'lorem', route: '/api/lorem', method: 'GET', price: '0.001',
    titleKey: 'loremTitle', descKey: 'loremDesc',
    params: [
      { name: 'paragraphs', type: 'number', required: false, descKey: 'loremParamParagraphs' },
    ],
    curl: `curl "${API_BASE}/api/lorem?paragraphs=2"`,
    response: `{
  "success": true,
  "paragraphs": ["Lorem ipsum dolor sit amet...", "Sed do eiusmod tempor..."],
  "count": 2,
  "total_words": 150
}`,
  },
  {
    id: 'headers', route: '/api/headers', method: 'GET', price: '0.003',
    titleKey: 'headersTitle', descKey: 'headersDesc',
    params: [
      { name: 'url', type: 'string', required: true, descKey: 'headersParamUrl' },
    ],
    curl: `curl "${API_BASE}/api/headers?url=https://example.com"`,
    response: `{
  "success": true,
  "url": "https://example.com",
  "status": 200,
  "headers": { "content-type": "text/html", "server": "nginx" }
}`,
  },
  {
    id: 'markdown', route: '/api/markdown', method: 'GET', price: '0.001',
    titleKey: 'markdownTitle', descKey: 'markdownDesc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'markdownParamText' },
    ],
    curl: `curl "${API_BASE}/api/markdown?text=**bold**+_italic_"`,
    response: `{
  "success": true,
  "html": "<p><strong>bold</strong> <em>italic</em></p>",
  "input_length": 16,
  "output_length": 42
}`,
  },
  {
    id: 'color', route: '/api/color', method: 'GET', price: '0.001',
    titleKey: 'colorTitle', descKey: 'colorDesc',
    params: [
      { name: 'hex', type: 'string', required: false, descKey: 'colorParamHex' },
      { name: 'rgb', type: 'string', required: false, descKey: 'colorParamRgb' },
    ],
    curl: `curl "${API_BASE}/api/color?hex=FF5733"`,
    response: `{
  "success": true,
  "hex": "#ff5733",
  "rgb": { "r": 255, "g": 87, "b": 51 },
  "hsl": { "h": 9, "s": 100, "l": 60 },
  "css_rgb": "rgb(255, 87, 51)"
}`,
  },
  {
    id: 'json-validate', route: '/api/json-validate', method: 'POST', price: '0.001',
    titleKey: 'jsonValidateTitle', descKey: 'jsonValidateDesc',
    params: [
      { name: 'json', type: 'string', required: true, descKey: 'jsonValidateParamJson' },
    ],
    curl: `curl -X POST "${API_BASE}/api/json-validate" -H "Content-Type: application/json" -d '{"json":"{\\"key\\":\\"value\\"}"}'`,
    response: `{
  "success": true,
  "valid": true,
  "formatted": "{\\n  \\"key\\": \\"value\\"\\n}",
  "type": "object",
  "keys_count": 1
}`,
  },
  {
    id: 'useragent', route: '/api/useragent', method: 'GET', price: '0.001',
    titleKey: 'useragentTitle', descKey: 'useragentDesc',
    params: [
      { name: 'ua', type: 'string', required: false, descKey: 'useragentParamUa' },
    ],
    curl: `curl "${API_BASE}/api/useragent"`,
    response: `{
  "success": true,
  "user_agent": "curl/8.1.2",
  "browser": "curl/8.1.2",
  "os": "Unknown",
  "is_mobile": false,
  "is_bot": false
}`,
  },
  {
    id: 'wikipedia', route: '/api/wikipedia', method: 'GET', price: '0.005',
    titleKey: 'wikipediaTitle', descKey: 'wikipediaDesc',
    params: [
      { name: 'q', type: 'string', required: true, descKey: 'wikipediaParamQ' },
    ],
    curl: `curl "${API_BASE}/api/wikipedia?q=Bitcoin"`,
    response: `{
  "success": true,
  "title": "Bitcoin",
  "extract": "Bitcoin is a cryptocurrency...",
  "description": "Decentralized cryptocurrency",
  "thumbnail": "https://upload.wikimedia.org/...",
  "url": "https://en.wikipedia.org/wiki/Bitcoin"
}`,
  },
  {
    id: 'dictionary', route: '/api/dictionary', method: 'GET', price: '0.005',
    titleKey: 'dictionaryTitle', descKey: 'dictionaryDesc',
    params: [
      { name: 'word', type: 'string', required: true, descKey: 'dictionaryParamWord' },
    ],
    curl: `curl "${API_BASE}/api/dictionary?word=hello"`,
    response: `{
  "success": true,
  "word": "hello",
  "phonetic": "/həˈloʊ/",
  "meanings": [
    {
      "partOfSpeech": "interjection",
      "definitions": ["Used as a greeting"]
    }
  ],
  "sourceUrl": "https://en.wiktionary.org/wiki/hello"
}`,
  },
  {
    id: 'countries', route: '/api/countries', method: 'GET', price: '0.005',
    titleKey: 'countriesTitle', descKey: 'countriesDesc',
    params: [
      { name: 'name', type: 'string', required: true, descKey: 'countriesParamName' },
    ],
    curl: `curl "${API_BASE}/api/countries?name=France"`,
    response: `{
  "success": true,
  "name": "France",
  "official": "French Republic",
  "capital": "Paris",
  "population": 67391582,
  "region": "Europe",
  "subregion": "Western Europe",
  "currencies": ["Euro"],
  "languages": ["French"],
  "flag": "https://flagcdn.com/w320/fr.png",
  "timezones": ["UTC+01:00"]
}`,
  },
  {
    id: 'github', route: '/api/github', method: 'GET', price: '0.005',
    titleKey: 'githubTitle', descKey: 'githubDesc',
    params: [
      { name: 'user', type: 'string', required: false, descKey: 'githubParamUser' },
      { name: 'repo', type: 'string', required: false, descKey: 'githubParamRepo' },
    ],
    curl: `curl "${API_BASE}/api/github?user=torvalds"`,
    response: `{
  "success": true,
  "type": "user",
  "login": "torvalds",
  "name": "Linus Torvalds",
  "bio": "Creator of Linux",
  "public_repos": 5,
  "followers": 200000,
  "following": 0,
  "avatar": "https://avatars.githubusercontent.com/...",
  "url": "https://github.com/torvalds",
  "created_at": "2011-09-03T15:26:22Z"
}`,
  },
  {
    id: 'npm', route: '/api/npm', method: 'GET', price: '0.005',
    titleKey: 'npmTitle', descKey: 'npmDesc',
    params: [
      { name: 'package', type: 'string', required: true, descKey: 'npmParamPackage' },
    ],
    curl: `curl "${API_BASE}/api/npm?package=react"`,
    response: `{
  "success": true,
  "name": "react",
  "description": "React is a JavaScript library for building user interfaces.",
  "latest_version": "18.3.1",
  "license": "MIT",
  "homepage": "https://react.dev",
  "repository": "git+https://github.com/facebook/react.git",
  "keywords": ["react", "frontend", "ui"],
  "author": "Meta",
  "modified": "2025-01-15T12:00:00.000Z"
}`,
  },
  {
    id: 'ip', route: '/api/ip', method: 'GET', price: '0.005',
    titleKey: 'ipTitle', descKey: 'ipDesc',
    params: [
      { name: 'address', type: 'string', required: true, descKey: 'ipParamAddress' },
    ],
    curl: `curl "${API_BASE}/api/ip?address=8.8.8.8"`,
    response: `{
  "success": true,
  "ip": "8.8.8.8",
  "country": "United States",
  "country_code": "US",
  "region": "California",
  "city": "Mountain View",
  "zip": "94035",
  "latitude": 37.386,
  "longitude": -122.0838,
  "timezone": "America/Los_Angeles",
  "isp": "Google LLC",
  "org": "Google Public DNS"
}`,
  },
  {
    id: 'qrcode', route: '/api/qrcode', method: 'GET', price: '0.005',
    titleKey: 'qrcodeTitle', descKey: 'qrcodeDesc',
    params: [
      { name: 'text', type: 'string', required: true, descKey: 'qrcodeParamText' },
      { name: 'size', type: 'number', required: false, descKey: 'qrcodeParamSize' },
    ],
    curl: `curl "${API_BASE}/api/qrcode?text=https://x402bazaar.org&size=200"`,
    response: `[Binary PNG image data]`,
  },
  {
    id: 'time', route: '/api/time', method: 'GET', price: '0.005',
    titleKey: 'timeTitle', descKey: 'timeDesc',
    params: [
      { name: 'timezone', type: 'string', required: true, descKey: 'timeParamTimezone' },
    ],
    curl: `curl "${API_BASE}/api/time?timezone=Europe/Paris"`,
    response: `{
  "success": true,
  "timezone": "Europe/Paris",
  "datetime": "2026-02-13T10:30:00.000+01:00",
  "utc_offset": "+01:00",
  "day_of_week": 5,
  "week_number": 7,
  "abbreviation": "CET",
  "dst": false
}`,
  },
  {
    id: 'holidays', route: '/api/holidays', method: 'GET', price: '0.005',
    titleKey: 'holidaysTitle', descKey: 'holidaysDesc',
    params: [
      { name: 'country', type: 'string', required: true, descKey: 'holidaysParamCountry' },
      { name: 'year', type: 'number', required: false, descKey: 'holidaysParamYear' },
    ],
    curl: `curl "${API_BASE}/api/holidays?country=FR&year=2026"`,
    response: `{
  "success": true,
  "country": "FR",
  "year": 2026,
  "count": 11,
  "holidays": [
    {
      "date": "2026-01-01",
      "name": "Jour de l'an",
      "name_en": "New Year's Day",
      "fixed": true,
      "types": ["Public"]
    }
  ]
}`,
  },
  {
    id: 'geocoding', route: '/api/geocoding', method: 'GET', price: '0.005',
    titleKey: 'geocodingTitle', descKey: 'geocodingDesc',
    params: [
      { name: 'city', type: 'string', required: true, descKey: 'geocodingParamCity' },
    ],
    curl: `curl "${API_BASE}/api/geocoding?city=Paris"`,
    response: `{
  "success": true,
  "query": "Paris",
  "results": [
    {
      "name": "Paris",
      "country": "France",
      "country_code": "FR",
      "latitude": 48.85341,
      "longitude": 2.3488,
      "population": 2138551,
      "timezone": "Europe/Paris"
    }
  ]
}`,
  },
  {
    id: 'airquality', route: '/api/airquality', method: 'GET', price: '0.005',
    titleKey: 'airqualityTitle', descKey: 'airqualityDesc',
    params: [
      { name: 'lat', type: 'number', required: true, descKey: 'airqualityParamLat' },
      { name: 'lon', type: 'number', required: true, descKey: 'airqualityParamLon' },
    ],
    curl: `curl "${API_BASE}/api/airquality?lat=48.85&lon=2.35"`,
    response: `{
  "success": true,
  "latitude": 48.85,
  "longitude": 2.35,
  "time": "2026-02-13T10:00",
  "pm2_5": 12.5,
  "pm10": 18.3,
  "ozone": 45.2,
  "nitrogen_dioxide": 23.1,
  "carbon_monoxide": 250.5,
  "european_aqi": 2,
  "us_aqi": 45
}`,
  },
  {
    id: 'quote', route: '/api/quote', method: 'GET', price: '0.005',
    titleKey: 'quoteTitle', descKey: 'quoteDesc',
    params: [],
    curl: `curl "${API_BASE}/api/quote"`,
    response: `{
  "success": true,
  "id": 123,
  "advice": "Don't compare yourself with anyone in this world. If you do so, you are insulting yourself."
}`,
  },
  {
    id: 'facts', route: '/api/facts', method: 'GET', price: '0.005',
    titleKey: 'factsTitle', descKey: 'factsDesc',
    params: [],
    curl: `curl "${API_BASE}/api/facts"`,
    response: `{
  "success": true,
  "fact": "Cats sleep 70% of their lives.",
  "length": 32
}`,
  },
  {
    id: 'dogs', route: '/api/dogs', method: 'GET', price: '0.005',
    titleKey: 'dogsTitle', descKey: 'dogsDesc',
    params: [
      { name: 'breed', type: 'string', required: false, descKey: 'dogsParamBreed' },
    ],
    curl: `curl "${API_BASE}/api/dogs?breed=husky"`,
    response: `{
  "success": true,
  "image_url": "https://images.dog.ceo/breeds/husky/n02110185_1469.jpg",
  "breed": "husky"
}`,
  },
  // --- BATCH 3: DATA & SOCIAL (session 21) ---
  {
    id: 'news', route: '/api/news', method: 'GET', price: '0.005',
    titleKey: 'newsTitle', descKey: 'newsDesc',
    params: [
      { name: 'topic', type: 'string', required: true, descKey: 'newsParamTopic' },
      { name: 'lang', type: 'string', required: false, descKey: 'newsParamLang' },
    ],
    curl: `curl "${API_BASE}/api/news?topic=artificial+intelligence&lang=en"`,
    response: `{
  "success": true,
  "topic": "artificial intelligence",
  "articles": [
    { "title": "AI Breakthrough in 2026", "source": "TechCrunch", "link": "https://...", "pubDate": "2026-02-13" }
  ],
  "count": 10
}`,
  },
  {
    id: 'stocks', route: '/api/stocks', method: 'GET', price: '0.005',
    titleKey: 'stocksTitle', descKey: 'stocksDesc',
    params: [
      { name: 'symbol', type: 'string', required: true, descKey: 'stocksParamSymbol' },
    ],
    curl: `curl "${API_BASE}/api/stocks?symbol=AAPL"`,
    response: `{
  "success": true,
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 245.32,
  "change": 3.21,
  "changePercent": 1.33,
  "marketState": "REGULAR",
  "exchange": "NASDAQ"
}`,
  },
  {
    id: 'reddit', route: '/api/reddit', method: 'GET', price: '0.005',
    titleKey: 'redditTitle', descKey: 'redditDesc',
    params: [
      { name: 'subreddit', type: 'string', required: true, descKey: 'redditParamSubreddit' },
      { name: 'sort', type: 'string', required: false, descKey: 'redditParamSort' },
      { name: 'limit', type: 'number', required: false, descKey: 'redditParamLimit' },
    ],
    curl: `curl "${API_BASE}/api/reddit?subreddit=programming&sort=hot&limit=5"`,
    response: `{
  "success": true,
  "subreddit": "programming",
  "sort": "hot",
  "posts": [
    { "title": "Why Rust is Taking Over", "author": "u/dev123", "score": 1523, "comments": 234, "url": "https://..." }
  ],
  "count": 5
}`,
  },
  {
    id: 'hn', route: '/api/hn', method: 'GET', price: '0.003',
    titleKey: 'hnTitle', descKey: 'hnDesc',
    params: [
      { name: 'type', type: 'string', required: false, descKey: 'hnParamType' },
      { name: 'limit', type: 'number', required: false, descKey: 'hnParamLimit' },
    ],
    curl: `curl "${API_BASE}/api/hn?type=top&limit=5"`,
    response: `{
  "success": true,
  "type": "top",
  "stories": [
    { "title": "Show HN: x402 Bazaar", "url": "https://x402bazaar.org", "score": 342, "by": "wintyx", "comments": 89 }
  ],
  "count": 5
}`,
  },
  {
    id: 'youtube', route: '/api/youtube', method: 'GET', price: '0.005',
    titleKey: 'youtubeTitle', descKey: 'youtubeDesc',
    params: [
      { name: 'url', type: 'string', required: true, descKey: 'youtubeParamUrl' },
    ],
    curl: `curl "${API_BASE}/api/youtube?url=https://youtube.com/watch?v=dQw4w9WgXcQ"`,
    response: `{
  "success": true,
  "title": "Rick Astley - Never Gonna Give You Up",
  "author_name": "Rick Astley",
  "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "html": "<iframe ...></iframe>"
}`,
  },
  {
    id: 'whois', route: '/api/whois', method: 'GET', price: '0.005',
    titleKey: 'whoisTitle', descKey: 'whoisDesc',
    params: [
      { name: 'domain', type: 'string', required: true, descKey: 'whoisParamDomain' },
    ],
    curl: `curl "${API_BASE}/api/whois?domain=google.com"`,
    response: `{
  "success": true,
  "domain": "google.com",
  "registrar": "MarkMonitor Inc.",
  "registered": "1997-09-15",
  "expires": "2028-09-14",
  "nameservers": ["ns1.google.com", "ns2.google.com"],
  "status": ["clientDeleteProhibited"]
}`,
  },
  {
    id: 'ssl-check', route: '/api/ssl-check', method: 'GET', price: '0.003',
    titleKey: 'sslCheckTitle', descKey: 'sslCheckDesc',
    params: [
      { name: 'domain', type: 'string', required: true, descKey: 'sslCheckParamDomain' },
    ],
    curl: `curl "${API_BASE}/api/ssl-check?domain=google.com"`,
    response: `{
  "success": true,
  "domain": "google.com",
  "issuer": "Google Trust Services",
  "validFrom": "2026-01-15",
  "validTo": "2026-04-15",
  "daysRemaining": 61,
  "protocol": "TLSv1.3"
}`,
  },
  {
    id: 'regex', route: '/api/regex', method: 'GET', price: '0.001',
    titleKey: 'regexTitle', descKey: 'regexDesc',
    params: [
      { name: 'pattern', type: 'string', required: true, descKey: 'regexParamPattern' },
      { name: 'text', type: 'string', required: true, descKey: 'regexParamText' },
      { name: 'flags', type: 'string', required: false, descKey: 'regexParamFlags' },
    ],
    curl: `curl "${API_BASE}/api/regex?pattern=\\d%2B&text=abc123def456&flags=g"`,
    response: `{
  "success": true,
  "pattern": "\\\\d+",
  "flags": "g",
  "matches": [
    { "match": "123", "index": 3, "groups": [] },
    { "match": "456", "index": 9, "groups": [] }
  ],
  "count": 2
}`,
  },
  {
    id: 'diff', route: '/api/diff', method: 'GET', price: '0.001',
    titleKey: 'diffTitle', descKey: 'diffDesc',
    params: [
      { name: 'text1', type: 'string', required: true, descKey: 'diffParamText1' },
      { name: 'text2', type: 'string', required: true, descKey: 'diffParamText2' },
    ],
    curl: `curl "${API_BASE}/api/diff?text1=hello+world&text2=hello+earth"`,
    response: `{
  "success": true,
  "changes": [
    { "type": "equal", "value": "hello " },
    { "type": "removed", "value": "world" },
    { "type": "added", "value": "earth" }
  ],
  "stats": { "added": 1, "removed": 1, "equal": 1 }
}`,
  },
  {
    id: 'math', route: '/api/math', method: 'GET', price: '0.001',
    titleKey: 'mathTitle', descKey: 'mathDesc',
    params: [
      { name: 'expr', type: 'string', required: true, descKey: 'mathParamExpr' },
    ],
    curl: `curl "${API_BASE}/api/math?expr=2*pi%2Bsqrt(16)"`,
    response: `{
  "success": true,
  "expression": "2*pi+sqrt(16)",
  "result": 10.283185307179586
}`,
  },
  // --- BATCH 4: UTILITY (session 21) ---
  {
    id: 'unit-convert', route: '/api/unit-convert', method: 'GET', price: '0.001',
    titleKey: 'unitConvertTitle', descKey: 'unitConvertDesc',
    params: [
      { name: 'value', type: 'number', required: true, descKey: 'unitConvertParamValue' },
      { name: 'from', type: 'string', required: true, descKey: 'unitConvertParamFrom' },
      { name: 'to', type: 'string', required: true, descKey: 'unitConvertParamTo' },
    ],
    curl: `curl "${API_BASE}/api/unit-convert?value=100&from=km&to=miles"`,
    response: `{
  "success": true,
  "value": 100,
  "from": "km",
  "to": "miles",
  "result": 62.1371,
  "category": "length"
}`,
  },
  {
    id: 'csv-to-json', route: '/api/csv-to-json', method: 'GET', price: '0.001',
    titleKey: 'csvToJsonTitle', descKey: 'csvToJsonDesc',
    params: [
      { name: 'csv', type: 'string', required: true, descKey: 'csvToJsonParamCsv' },
    ],
    curl: `curl "${API_BASE}/api/csv-to-json?csv=name,age%0AAlice,30%0ABob,25"`,
    response: `{
  "success": true,
  "rows": [
    { "name": "Alice", "age": "30" },
    { "name": "Bob", "age": "25" }
  ],
  "count": 2,
  "columns": ["name", "age"]
}`,
  },
  {
    id: 'jwt-decode', route: '/api/jwt-decode', method: 'GET', price: '0.001',
    titleKey: 'jwtDecodeTitle', descKey: 'jwtDecodeDesc',
    params: [
      { name: 'token', type: 'string', required: true, descKey: 'jwtDecodeParamToken' },
    ],
    curl: `curl "${API_BASE}/api/jwt-decode?token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc"`,
    response: `{
  "success": true,
  "header": { "alg": "HS256" },
  "payload": { "sub": "1234567890" },
  "expired": false
}`,
  },
  {
    id: 'cron-parse', route: '/api/cron-parse', method: 'GET', price: '0.001',
    titleKey: 'cronParseTitle', descKey: 'cronParseDesc',
    params: [
      { name: 'expr', type: 'string', required: true, descKey: 'cronParseParamExpr' },
    ],
    curl: `curl "${API_BASE}/api/cron-parse?expr=0+9+*+*+1-5"`,
    response: `{
  "success": true,
  "expression": "0 9 * * 1-5",
  "description": "At 09:00, Monday through Friday",
  "fields": {
    "minute": "0",
    "hour": "9",
    "dayOfMonth": "*",
    "month": "*",
    "dayOfWeek": "1-5"
  }
}`,
  },
  {
    id: 'password-strength', route: '/api/password-strength', method: 'GET', price: '0.001',
    titleKey: 'passwordStrengthTitle', descKey: 'passwordStrengthDesc',
    params: [
      { name: 'password', type: 'string', required: true, descKey: 'passwordStrengthParamPassword' },
    ],
    curl: `curl "${API_BASE}/api/password-strength?password=MyP@ssw0rd!2026"`,
    response: `{
  "success": true,
  "score": 85,
  "strength": "strong",
  "entropy": 72.5,
  "checks": { "length": true, "uppercase": true, "lowercase": true, "numbers": true, "symbols": true },
  "suggestions": []
}`,
  },
  {
    id: 'phone-validate', route: '/api/phone-validate', method: 'GET', price: '0.001',
    titleKey: 'phoneValidateTitle', descKey: 'phoneValidateDesc',
    params: [
      { name: 'phone', type: 'string', required: true, descKey: 'phoneValidateParamPhone' },
    ],
    curl: `curl "${API_BASE}/api/phone-validate?phone=%2B33612345678"`,
    response: `{
  "success": true,
  "phone": "+33612345678",
  "valid": true,
  "countryCode": "33",
  "country": "France",
  "type": "mobile",
  "formatted": "+33 6 12 34 56 78"
}`,
  },
  {
    id: 'url-parse', route: '/api/url-parse', method: 'GET', price: '0.001',
    titleKey: 'urlParseTitle', descKey: 'urlParseDesc',
    params: [
      { name: 'url', type: 'string', required: true, descKey: 'urlParseParamUrl' },
    ],
    curl: `curl "${API_BASE}/api/url-parse?url=https://example.com:8080/path?q=test%23hash"`,
    response: `{
  "success": true,
  "protocol": "https:",
  "hostname": "example.com",
  "port": "8080",
  "pathname": "/path",
  "search": "?q=test",
  "hash": "#hash",
  "params": { "q": "test" }
}`,
  },
  {
    id: 'url-shorten', route: '/api/url-shorten', method: 'GET', price: '0.003',
    titleKey: 'urlShortenTitle', descKey: 'urlShortenDesc',
    params: [
      { name: 'url', type: 'string', required: true, descKey: 'urlShortenParamUrl' },
    ],
    curl: `curl "${API_BASE}/api/url-shorten?url=https://x402bazaar.org/docs"`,
    response: `{
  "success": true,
  "original": "https://x402bazaar.org/docs",
  "short": "https://is.gd/abc123"
}`,
  },
  {
    id: 'html-to-text', route: '/api/html-to-text', method: 'GET', price: '0.001',
    titleKey: 'htmlToTextTitle', descKey: 'htmlToTextDesc',
    params: [
      { name: 'html', type: 'string', required: true, descKey: 'htmlToTextParamHtml' },
    ],
    curl: `curl "${API_BASE}/api/html-to-text?html=<h1>Title</h1><p>Content</p>"`,
    response: `{
  "success": true,
  "text": "Title\\nContent",
  "links": [],
  "images": [],
  "wordCount": 2
}`,
  },
  {
    id: 'http-status', route: '/api/http-status', method: 'GET', price: '0.001',
    titleKey: 'httpStatusTitle', descKey: 'httpStatusDesc',
    params: [
      { name: 'code', type: 'number', required: true, descKey: 'httpStatusParamCode' },
    ],
    curl: `curl "${API_BASE}/api/http-status?code=404"`,
    response: `{
  "success": true,
  "code": 404,
  "name": "Not Found",
  "description": "The server cannot find the requested resource.",
  "category": "Client Error"
}`,
  },
];

const STATIC_ENDPOINTS = {
  marketplace: [
    { method: 'GET', route: '/', price: null, description: 'Discovery: marketplace info + endpoints' },
    { method: 'GET', route: '/services', price: '0.05', description: 'List all registered services' },
    { method: 'GET', route: '/search?q=', price: '0.05', description: 'Search services by keyword' },
    { method: 'POST', route: '/register', price: '1.00', description: 'Register a new service' },
  ],
  native: NATIVE_ENDPOINTS.map(ep => ({ method: ep.method, route: ep.route, price: ep.price, description: ep.id })),
};

function DocsCodeBlock({ code }) {
  return (
    <div className="relative group">
      <SharedCopyButton text={code} copiedLabel="Copied" />
      <pre className="bg-[#0d1117] border border-white/10 rounded-xl p-3 sm:p-5 pt-12 overflow-x-auto text-xs sm:text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function parseEndpoints(raw) {
  const marketplace = [];
  const native = [];
  Object.entries(raw).forEach(([key, desc]) => {
    const match = key.match(/^(GET|POST)\s+(.+)$/);
    if (!match) return;
    const method = match[1];
    const route = match[2];
    const priceMatch = desc.match(/\((\d+(?:\.\d+)?)\s*USDC\)/);
    const price = priceMatch ? priceMatch[1] : null;
    const description = desc.replace(/\s*\(\d+(?:\.\d+)?\s*USDC\)/, '').trim();
    const entry = { method, route, price, description };
    if (route.startsWith('/api/')) native.push(entry);
    else marketplace.push(entry);
  });
  return { marketplace, native };
}

export default function Docs() {
  const { t, lang } = useTranslation();
  const d = t.docs || {};
  const [endpointsRaw, setEndpointsRaw] = useState(undefined);
  const activeSection = useScrollSpy(SECTION_IDS);

  useSEO({
    title: 'Documentation',
    description: 'Complete technical documentation for x402 Bazaar — protocol spec, API reference, native wrappers, MCP integration and security.'
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(API_URL + '/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => setEndpointsRaw(data.endpoints || null))
      .catch(() => { if (!controller.signal.aborted) setEndpointsRaw(null); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      if (SECTION_IDS.includes(id)) {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  const handleNavigate = (id) => {
    if (!SECTION_IDS.includes(id)) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const sections = [
    { id: 'quickstart', label: d.sidebarQuickstart || 'Quickstart' },
    { id: 'protocol', label: d.sidebarProtocol || 'Protocol' },
    { id: 'api-reference', label: d.sidebarApiRef || 'API Reference' },
    { id: 'native-wrappers', label: d.sidebarNative || 'Native Wrappers' },
    { id: 'mcp', label: d.sidebarMcp || 'MCP Server' },
    { id: 'integration', label: d.sidebarIntegration || 'Integration' },
    { id: 'security', label: d.sidebarSecurity || 'Security' },
  ];

  const parsed = endpointsRaw ? parseEndpoints(endpointsRaw) : null;
  const apiData = parsed || STATIC_ENDPOINTS;

  const PriceBadge = ({ price }) => (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
      price ? 'bg-[#FF9900]/10 text-[#FF9900]' : 'bg-[#34D399]/10 text-[#34D399]'
    }`}>
      {price ? `${price} USDC` : (d.free || 'Free')}
    </span>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#FF9900] text-xs font-medium mb-4">
          Documentation
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{d.title || 'Documentation'}</h1>
        <p className="text-gray-400 text-lg max-w-2xl">{d.subtitle || ''}</p>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="flex gap-8">
        <DocsSidebar sections={sections} activeSection={activeSection} onNavigate={handleNavigate} />

        <main className="flex-1 min-w-0 space-y-16">

          {/* ========== QUICKSTART ========== */}
          <section id="quickstart">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">{d.quickstartTitle || 'Quickstart'}</h2>
              <span className="text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2.5 py-0.5 rounded-full">{d.quickstartBadge || '5 min'}</span>
            </div>
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{d.quickstartStep1Title || 'Step 1 — Install the CLI'}</h3>
                <p className="text-gray-400 text-sm mb-4">{d.quickstartStep1Desc || ''}</p>
                <DocsCodeBlock code="npx x402-bazaar init" />
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{d.quickstartStep2Title || 'Step 2 — Make your first call'}</h3>
                <p className="text-gray-400 text-sm mb-4">{d.quickstartStep2Desc || ''}</p>
                <DocsCodeBlock code={`curl ${API_BASE}/api/joke`} />
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{d.quickstartStep3Title || 'Step 3 — Handle the 402 response'}</h3>
                <p className="text-gray-400 text-sm mb-4">{d.quickstartStep3Desc || ''}</p>
                <DocsCodeBlock code={`{
  "error": "Payment Required",
  "payment_details": {
    "amount": 0.01,
    "currency": "USDC",
    "network": "base",
    "chainId": 8453,
    "recipient": "0xfb1c...2430",
    "action": "Random Joke API"
  }
}`} />
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{d.quickstartStep4Title || 'Step 4 — Pay & retry'}</h3>
                <p className="text-gray-400 text-sm mb-4">{d.quickstartStep4Desc || ''}</p>
                <DocsCodeBlock code={`# Pay 0.01 USDC to the recipient address on Base
# Then retry with the transaction hash:

curl -H "X-Payment-TxHash: 0xabc123..." \\
  ${API_BASE}/api/joke`} />
              </div>
              <div className="rounded-xl p-5 bg-[#34D399]/5 border border-[#34D399]/20">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#34D399] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-[#34D399] text-sm font-medium">{d.quickstartSuccess || 'You just made your first x402 payment!'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ========== PROTOCOL ========== */}
          <section id="protocol">
            <h2 className="text-2xl font-bold text-white mb-6">{d.protocolTitle || 'The x402 Protocol'}</h2>
            <div className="glass-card rounded-xl p-6 mb-6">
              <div className="space-y-4">
                {[d.protocolStep1, d.protocolStep2, d.protocolStep3, d.protocolStep4, d.protocolStep5].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF9900]/15 text-[#FF9900] flex items-center justify-center text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-gray-300 text-sm pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="text-white font-semibold mb-3">{d.protocolResponseTitle || '402 Response Format'}</h3>
            <DocsCodeBlock code={`{
  "error": "Payment Required",
  "payment_details": {
    "amount": 0.05,
    "currency": "USDC",
    "network": "base",
    "chainId": 8453,
    "recipient": "0xServerWallet...",
    "action": "Search services"
  }
}`} />
          </section>

          {/* ========== API REFERENCE ========== */}
          <section id="api-reference">
            <h2 className="text-2xl font-bold text-white mb-6">{d.apiRefTitle || 'API Reference'}</h2>

            {endpointsRaw === undefined && (
              <p className="text-gray-500 text-sm mb-4 animate-pulse">{d.apiRefLoading || 'Loading endpoints...'}</p>
            )}
            {endpointsRaw === null && (
              <div className="text-yellow-400/80 text-sm mb-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
                {d.apiRefError || 'Could not load live endpoints.'}
              </div>
            )}

            <h3 className="text-white font-semibold mb-3">{d.apiRefMarketplace || 'Marketplace'}</h3>
            <div className="overflow-x-auto glass-card rounded-xl p-4 mb-8">
              <table className="w-full text-sm min-w-[360px] sm:min-w-[480px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-3 pr-4">{d.thMethod || 'Method'}</th>
                    <th className="pb-3 pr-4">{d.thRoute || 'Route'}</th>
                    <th className="pb-3 pr-4">{d.thCost || 'Cost'}</th>
                    <th className="pb-3">{d.thDescription || 'Description'}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {apiData.marketplace.map((ep, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">{ep.method}</td>
                      <td className="py-3 pr-4 font-mono text-blue-400">{ep.route}</td>
                      <td className="py-3 pr-4"><PriceBadge price={ep.price} /></td>
                      <td className="py-3 text-sm">{ep.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-white font-semibold mb-3">{d.apiRefNative || 'Native Wrappers'}</h3>
            <div className="overflow-x-auto glass-card rounded-xl p-4">
              <table className="w-full text-sm min-w-[360px] sm:min-w-[480px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-3 pr-4">{d.thMethod || 'Method'}</th>
                    <th className="pb-3 pr-4">{d.thRoute || 'Route'}</th>
                    <th className="pb-3 pr-4">{d.thCost || 'Cost'}</th>
                    <th className="pb-3">{d.thDescription || 'Description'}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {(parsed ? apiData.native : NATIVE_ENDPOINTS).map((ep, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs">{ep.method}</td>
                      <td className="py-3 pr-4 font-mono text-blue-400">{parsed ? ep.route : ep.route}</td>
                      <td className="py-3 pr-4"><PriceBadge price={ep.price} /></td>
                      <td className="py-3 text-sm">{parsed ? ep.description : (d[ep.titleKey] || ep.id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========== NATIVE WRAPPERS ========== */}
          <section id="native-wrappers">
            <h2 className="text-2xl font-bold text-white mb-2">{d.nativeTitle || 'Native Wrappers'}</h2>
            <p className="text-gray-400 text-sm mb-8">{(d.nativeSubtitle || '').replace('{count}', NATIVE_ENDPOINTS.length)}</p>

            <div className="space-y-8">
              {NATIVE_ENDPOINTS.map(ep => (
                <div key={ep.id} className="glass-card rounded-xl p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-white font-bold text-lg">{d[ep.titleKey] || ep.id}</h3>
                    <PriceBadge price={ep.price} />
                    <code className="text-xs font-mono text-gray-500">{ep.method} {ep.route}</code>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{d[ep.descKey] || ''}</p>

                  {ep.params.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">{d.nativeParams || 'Parameters'}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-white/10">
                              <th className="text-left pb-2 pr-4">{d.nativeParamName || 'Name'}</th>
                              <th className="text-left pb-2 pr-4">{d.nativeParamType || 'Type'}</th>
                              <th className="text-left pb-2 pr-4">{d.nativeParamRequired || 'Required'}</th>
                              <th className="text-left pb-2">{d.nativeParamDesc || 'Description'}</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300">
                            {ep.params.map(p => (
                              <tr key={p.name} className="border-b border-white/5">
                                <td className="py-2 pr-4 font-mono text-[#FF9900]">{p.name}</td>
                                <td className="py-2 pr-4">{p.type}</td>
                                <td className="py-2 pr-4">{p.required ? (d.nativeYes || 'Yes') : (d.nativeNo || 'No')}</td>
                                <td className="py-2">{d[p.descKey] || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">{d.nativeExample || 'Example Request'}</h4>
                  <DocsCodeBlock code={ep.curl} />

                  <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mt-4 mb-2">{d.nativeResponse || 'Example Response'}</h4>
                  <DocsCodeBlock code={ep.response} />
                </div>
              ))}
            </div>
          </section>

          {/* ========== MCP SERVER ========== */}
          <section id="mcp">
            <h2 className="text-2xl font-bold text-white mb-3">{d.mcpTitle || 'MCP Server'}</h2>
            <p className="text-gray-400 text-sm mb-6">{d.mcpDesc || ''}</p>

            <h3 className="text-white font-semibold mb-3">{d.mcpToolsTitle || 'Available Tools'}</h3>
            <div className="space-y-2 mb-6">
              {MCP_TOOLS.map(tool => (
                <div key={tool.name} className="glass-card rounded-lg p-3 flex items-center gap-3">
                  <code className="text-[#FF9900] font-mono text-xs bg-[#FF9900]/10 px-2 py-1 rounded shrink-0">{tool.name}</code>
                  <span className="text-gray-400 text-sm flex-1">{lang === 'fr' ? tool.desc_fr : tool.desc_en}</span>
                  <span className={`shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    tool.cost === 'Free' ? 'bg-[#34D399]/10 text-[#34D399]' : 'bg-[#FF9900]/10 text-[#FF9900]'
                  }`}>
                    {tool.cost === 'Free' ? (lang === 'fr' ? 'Gratuit' : 'Free') : tool.cost}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-white font-semibold mb-3">{d.mcpInstall || 'Install with one command:'}</h3>
            <DocsCodeBlock code="npx x402-bazaar init" />

            <div className="mt-4">
              <Link to="/mcp" className="text-[#FF9900] hover:text-[#FFB84D] text-sm font-medium no-underline inline-flex items-center gap-1">
                {d.mcpFullDoc || 'Full MCP documentation'} →
              </Link>
            </div>
          </section>

          {/* ========== INTEGRATION ========== */}
          <section id="integration">
            <h2 className="text-2xl font-bold text-white mb-3">{d.integrationTitle || 'Integration'}</h2>
            <p className="text-gray-400 text-sm mb-6">{d.integrationDesc || ''}</p>

            <h3 className="text-white font-semibold mb-3">{d.integrationJs || 'JavaScript (Node.js)'}</h3>
            <DocsCodeBlock code={`async function payAndRequest(url, wallet, options = {}) {
  const res = await fetch(url, options);
  const body = await res.json();
  if (res.status !== 402) return body;

  const { amount, recipient } = body.payment_details;
  const transfer = await wallet.createTransfer({
    amount, assetId: 'usdc', destination: recipient,
  });
  const confirmed = await transfer.wait();
  const txHash = confirmed.getTransactionHash();

  const retryRes = await fetch(url, {
    ...options,
    headers: { ...options.headers, 'X-Payment-TxHash': txHash },
  });
  return retryRes.json();
}`} />

            <h3 className="text-white font-semibold mt-6 mb-3">{d.integrationPy || 'Python (requests + web3)'}</h3>
            <DocsCodeBlock code={`import requests

BAZAAR = "https://x402-api.onrender.com"

def pay_and_request(url, wallet_key):
    res = requests.get(url)
    if res.status_code != 402:
        return res.json()

    details = res.json()["payment_details"]
    # Send USDC to details["recipient"] on Base
    tx_hash = send_usdc(details["recipient"], details["amount"], wallet_key)

    return requests.get(url, headers={
        "X-Payment-TxHash": tx_hash
    }).json()

# Usage
data = pay_and_request(f"{BAZAAR}/api/weather?city=Paris", KEY)`} />

            <div className="mt-4">
              <Link to="/integrate" className="text-[#FF9900] hover:text-[#FFB84D] text-sm font-medium no-underline inline-flex items-center gap-1">
                {d.integrationFullDoc || 'Full integration guide'} →
              </Link>
            </div>
          </section>

          {/* ========== SECURITY ========== */}
          <section id="security">
            <h2 className="text-2xl font-bold text-white mb-6">{d.securityTitle || 'Security'}</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { title: d.securityBudgetTitle, desc: d.securityBudgetDesc },
                { title: d.securityReplayTitle, desc: d.securityReplayDesc },
                { title: d.securityOnchainTitle, desc: d.securityOnchainDesc },
                { title: d.securityRateTitle, desc: d.securityRateDesc },
                { title: d.securitySsrfTitle, desc: d.securitySsrfDesc },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-3">{d.securityBestTitle || 'Best Practices'}</h3>
              <ul className="space-y-2">
                {[d.securityBest1, d.securityBest2, d.securityBest3].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* ERC-8004 Agent Identity */}
            <div className="glass-card rounded-xl p-5 mt-6 border border-violet-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
                  <svg className="w-4.5 h-4.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-sm">{d.erc8004Title || 'ERC-8004 Agent Identity'}</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">{d.erc8004Desc || ''}</p>
              <p className="text-gray-500 text-xs mb-2">{d.erc8004Endpoint || 'Verify any agent identity for free:'}</p>
              <DocsCodeBlock code={`curl ${API_BASE}/api/agent/0xYourAgentAddress`} />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
