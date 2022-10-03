chrome.contextMenus.create({
    id: "1",
    title: `打开主页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.create({ index: 0, url: chrome.extension.getURL('WorkBench.html') });
    }
});

chrome.contextMenus.create({
    id: "2",
    title: `标签管理`,
    contexts: ["browser_action"]
});

chrome.contextMenus.create({
    id: "3",
    title: `发送当前标签`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.storage.local.get(function (storage) {
            let opts = storage.options
            chrome.tabs.query({ url: ["https://*/*", "http://*/*"], highlighted: true, currentWindow: true }, function (req) {
                if (req.length > 0) {
                    console.log(req, storage)
                    chrome.tabs.reload(req[0].id, {}, function (tab) {
                    });
                }
            });
        })
    },
    parentId: "2"
});