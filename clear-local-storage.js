// Clear all BlueMe local storage data
// Run this in the browser console to clear local authentication data

console.log('🧹 Clearing BlueMe local storage data...');

// Clear all BlueMe-related localStorage items
localStorage.removeItem('blueMeCurrentUser');
localStorage.removeItem('blueMeUsers');
localStorage.removeItem('blueMeCredentials');
localStorage.removeItem('blueme_playlists');
localStorage.removeItem('blueme_audio_library');

// Clear any other potential BlueMe data
Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('blueme') || key.toLowerCase().includes('blue')) {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
    }
});

console.log('✅ All BlueMe local storage data cleared!');
console.log('🔄 Please refresh the page to see the changes.');

// Show remaining localStorage items
console.log('📋 Remaining localStorage items:');
Object.keys(localStorage).forEach(key => {
    console.log('  -', key);
});
