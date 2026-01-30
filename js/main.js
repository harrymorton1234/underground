/**
 * Main entry point - Bootstrap the game
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('=================================');
    console.log('  UNDERGROUND - A Pixel RPG');
    console.log('=================================');
    console.log('Controls:');
    console.log('  Arrow Keys - Move');
    console.log('  Z - Confirm');
    console.log('  X - Cancel');
    console.log('  C - Menu');
    console.log('  F3 - Debug mode');
    console.log('=================================');

    // Initialize the game
    Game.init().then(() => {
        console.log('Game started!');
    }).catch(error => {
        console.error('Failed to start game:', error);
    });
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        Audio.pauseMusic();
    } else {
        Audio.resumeMusic();
    }
});

// Handle window focus
window.addEventListener('blur', () => {
    // Could pause game here
});

window.addEventListener('focus', () => {
    // Resume game
});

// Prevent context menu on right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Handle errors
window.addEventListener('error', (e) => {
    console.error('Game error:', e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
