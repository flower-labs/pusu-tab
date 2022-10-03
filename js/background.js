chrome.contextMenus.create({
    id: "1",
    title: `打开主页`,
    contexts: ["browser_action"],
    onclick: function () {
        chrome.tabs.create({ index: 0, url: chrome.extension.getURL('pages/index.html') });
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
                // 拿到标签后，存储到浏览器，然后在react中获取并展示
                if (req.length > 0) {
                    console.log(req, storage)
                    saveTabList(req)
                    // chrome.tabs.reload(req[0].id, {}, function (tab) {
                    //     console.log('after reload', tab)
                    // });
                }
            });
        })
    },
    parentId: "2"
});


const saveTabList = (tabs) => {
    const date = dateFormat("YYYY-mm-dd HH:MM:SS", new Date())
    tabs = tabs.map(({ title, url }) => ({ title, url }));
    const tabItem = {
        id: generateUUID(),
        title: tabs[0].title,
        url: tabs[0].url,
        date: date
    }
    chrome.storage.local.get("tabs", (storage) => {
        // 整合数据，并新增
        const newtabs = Object.keys(storage).length!==0 ? [...storage.tabs, tabItem] : [tabItem];
        chrome.storage.local.set({ tabs: newtabs });
        chrome.tabs.create({ index: 0, url: chrome.extension.getURL('pages/index.html') });
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