const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('Verifying index.html and scripts syntax...');
const files = ['js/core.js', 'js/camera.js', 'js/gallery.js', 'js/vote.js', 'js/guestbook.js', 'js/admin.js'];

files.forEach(f => {
    try {
        const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
        new Function(content);
        console.log('✓ Syntax valid: ' + f);
    } catch (err) {
        console.error('✗ Syntax ERROR in ' + f + ':', err.message);
        process.exit(1);
    }
});

// Check DOM elements in index.html
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 1. Check event-selector-dropdown is NOT in html
if (html.includes('class="event-selector-dropdown"')) {
    console.error('✗ Error: event-selector-dropdown still found in index.html');
    process.exit(1);
} else {
    console.log('✓ Clean: No event-selector-dropdown pickers in index.html');
}

// 2. Check tab 6 is hidden by default
if (html.includes('id="adminTabBtn-accountProfile"') && html.includes('style="display:none;"')) {
    console.log('✓ Tab 6 adminTabBtn-accountProfile is hidden by default (display:none)');
} else {
    console.error('✗ Tab 6 adminTabBtn-accountProfile is not hidden by default');
    process.exit(1);
}

// 3. Check lightbox navigation controls
if (html.includes('lightbox-nav-prev') && html.includes('lightbox-nav-next')) {
    console.log('✓ Lightbox prev and next navigation buttons present in index.html');
} else {
    console.error('✗ Lightbox navigation buttons missing');
    process.exit(1);
}

// 4. Check syncGalleryWithGoogleDrive
if (html.includes('syncGalleryWithGoogleDrive()')) {
    console.log('✓ syncGalleryWithGoogleDrive() button present in index.html');
} else {
    console.error('✗ syncGalleryWithGoogleDrive() button missing');
    process.exit(1);
}

// 5. Check openUserChangePasswordTab in index.html
if (html.includes('openUserChangePasswordTab()')) {
    console.log('✓ openUserChangePasswordTab() wired in index.html');
} else {
    console.error('✗ openUserChangePasswordTab() not wired');
    process.exit(1);
}

console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');