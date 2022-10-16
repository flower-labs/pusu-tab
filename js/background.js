chrome.contextMenus.create({
    id: "1",
    title: `发送当前标签页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], highlighted: true, currentWindow: true }, function (req) {
            if (req.length > 0) {
                saveTabList(req)
            }
        });
    },
});

chrome.contextMenus.create({
    id: "2",
    title: `更多操作`,
    contexts: ["browser_action"]
});

chrome.contextMenus.create({
    id: "2-1",
    parentId: "2",
    title: `发送全部标签页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], currentWindow: true }, function (req) {
            if (req.length > 0) {
                saveTabList(req)
            }
        });
    }
});

chrome.contextMenus.create({
    id: "2-2",
    parentId: "2",
    title: `发送左侧标签页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], currentWindow: true }, function (req) {
            const leftTabs = [];
            for (let item of req) {
                if (item.active) {
                    break;
                }
                leftTabs.push(item)
            }
            if (leftTabs.length > 0) {
                saveTabList(leftTabs)
            }
        });
    }
});

chrome.contextMenus.create({
    id: "2-3",
    parentId: "2",
    title: `发送右侧标签页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], currentWindow: true }, function (req) {
            let rightTabs = [];
            let activeIndex
            for (let item of req) {
                if (item.active) {
                    activeIndex = item.index;
                }
            }
            if (activeIndex) {
                rightTabs = req.filter(item => item.index > activeIndex)
            }
            if (rightTabs.length > 0) {
                saveTabList(rightTabs)
            }
        });
    }
});

chrome.contextMenus.create({
    id: "2-4",
    parentId: "2",
    title: `发送其他标签页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.query({ url: ["https://*/*", "http://*/*"], active: false, currentWindow: true }, function (req) {
            if (req.length > 0) {
                saveTabList(req)
            } else {
                openLocalPage('pages/index.html')
            }
        });
    }
});

chrome.contextMenus.create({
    type: 'separator',
    contexts: ["browser_action"],
    parentId: "2"
});

chrome.contextMenus.create({
    id: "2-5",
    title: `打开主页`,
    contexts: ["browser_action"],
    onclick: function () {
        // chrome.tabs.create({ index: 0, url: chrome.extension.getURL('pages/index.html') });
        openLocalPage(`pages/index.html`)
    },
    parentId: "2"
});



chrome.contextMenus.create({
    type: 'separator',
    contexts: ["browser_action"],
    parentId: "2"
});

chrome.contextMenus.create({
    id: "2-6",
    parentId: "2",
    title: `帮助中心`,
    contexts: ["browser_action"],
    onclick: function () {
        openLocalPage('help.html')
    }
});


// 保存标签页
const saveTabList = (tabs) => {
    if (tabs.length === 0) return;
    const date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
    tabList = tabs.map(({ title, url }) => ({
        id: generateUUID(),
        title,
        url,
        date: date
    }));

    chrome.storage.local.get("tabs", (storage) => {
        const newtabs = Object.keys(storage).length !== 0 ? [...storage.tabs, ...tabList] : tabList;
        chrome.storage.local.set({ tabs: newtabs });
        closeTabs(tabs)
        openLocalPage('pages/index.html')
    })
}

// 日期格式化
function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
        };
    };
    return fmt;
}

// 生成唯一标识
// refer: https://gist.github.com/solenoid/1372386
const generateUUID = function () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

// 刷新当前页
function refresh() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabsArr) {
        chrome.tabs.reload(tabsArr[0].id, {}, function (tab) {
        });
    });
}


// 打开本地页面
function openLocalPage(url) {
    chrome.tabs.query({ url: `chrome-extension://*/${url}*`, currentWindow: true }, function (tab) {
        if (tab.length >= 1) {
            chrome.tabs.move(tab[0].id, { index: 0 }, function callback() {
                chrome.tabs.highlight({ tabs: 0 }, function callback() {
                });
            });
            chrome.tabs.reload(tab[0].id, {}, function (tab) {
            });
        } else {
            chrome.tabs.create({ index: 0, url: chrome.extension.getURL(url) });
        }
    });
}

// 关闭标签页组
function closeTabs(tabsList) {
    if (tabsList.length === 0) return;
    var readyCloseTabs = [];
    for (let i = 0; i < tabsList.length; i += 1) {
        readyCloseTabs.push(tabsList[i].id);
    }

    chrome.tabs.remove(readyCloseTabs, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
}