(chrome.action||chrome.browserAction).onClicked.addListener((o=>{chrome.tabs.sendMessage(o.id,{action:"iconClicked"})})),chrome.runtime.onMessage.addListener(((o,e,n)=>{"downloadImage"===o.action&&chrome.downloads.download({url:o.url,conflictAction:"uniquify",saveAs:!0})}));