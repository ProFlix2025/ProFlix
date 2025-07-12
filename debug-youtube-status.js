// Debug script to test YouTube embedding status
const testUrls = [
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
];

console.log('🔍 YouTube Fix Status Check');
console.log('===========================');

testUrls.forEach((url, index) => {
  console.log(`\n${index + 1}. Testing: ${url}`);
  console.log(`   Domain: ${new URL(url).hostname}`);
  console.log(`   Expected: ${url.includes('nocookie') ? 'Should work on .app domains' : 'May fail on .app domains'}`);
});

console.log('\n🎯 The Fix:');
console.log('- Changed from: youtube.com');
console.log('- Changed to: youtube-nocookie.com');
console.log('- Referrer policy: no-referrer-when-downgrade');
console.log('- Removed origin parameter for production domains');

console.log('\n📊 Test Results:');
console.log('- Open /verify-youtube-fix.html to see actual embedding tests');
console.log('- Check /video/40 for LearnTube video with YouTube embedding');
console.log('- Expected: Thumbnails load, videos should play with nocookie fix');