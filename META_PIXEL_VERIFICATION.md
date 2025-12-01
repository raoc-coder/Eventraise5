# Meta Pixel Verification Guide

## Quick Verification Steps

### 1. Check Environment Variable
Ensure `NEXT_PUBLIC_META_PIXEL_ID` is set in your production environment (Vercel, etc.)

### 2. View HTML Source
1. Visit `https://www.eventraisehub.com`
2. Right-click → View Page Source (or Ctrl+U / Cmd+U)
3. Search for: `facebook.com/tr`
4. You should see:
   ```html
   <noscript>
     <img height="1" width="1" style="display:none" 
          src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1" />
   </noscript>
   ```

### 3. Use Meta Test Events Tool (MOST RELIABLE)
1. Go to: https://business.facebook.com/events_manager
2. Click "Test Events" in left sidebar
3. Enter URL: `https://www.eventraisehub.com`
4. Visit your site in another browser tab
5. You should see PageView events in real-time

### 4. Install Meta Pixel Helper
1. Install: https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
2. Visit your site
3. Click the extension icon - should show your pixel ID

## If Still Not Detected

1. **Verify Environment Variable**: Check it's set correctly in production
2. **Clear Cache**: Clear site cache and redeploy
3. **Wait 15-30 minutes**: Meta's crawler may need time to re-scan
4. **Use Test Events**: This is more reliable than the URL checker

## Important Notes

- The `<noscript>` tag is server-rendered and should be in the HTML source
- Meta Events Manager's URL checker may not always work - use Test Events instead
- The pixel code is injected immediately on page load for maximum compatibility

