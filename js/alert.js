//初始化定时任务
initAlert();

/**
 * 获取下一天的时间戳
 * @param minutes 偏移分钟数
 * @returns {number} 下一天的时间戳
 */
function getNextDay(minutes) {
    let nowDay = new Date();
    nowDay.setHours(0);
    nowDay.setMinutes(minutes);
    nowDay.setSeconds(0);
    nowDay.setMilliseconds(0);
    return nowDay.getTime() + 24 * 60 * 60 * 1000;
}

/**
 * 定时任务
 * 刷新cookie
 */
function initAlert() {
    // 启动浏览器时刷新一次
    refreshCookie().then();
    let alertName = "refreshCookie";
    chrome.alarms.get(alertName, alert => {
            if (!alert) {
                // 每天0点1分进行自动刷新
                let nextDay = getNextDay(1);
                chrome.alarms.create(alertName, {
                    when: nextDay,
                    periodInMinutes: 60 * 12
                });
            }
        }
    );
    chrome.alarms.onAlarm.addListener(refreshCookie);
}

/**
 * 刷新cookie
 * @returns {Promise<void>}
 */
async function refreshCookie() {
    let errorList = []
    for (const t of typeList) {
        let config = await getConfig()
        let tarConfig = config.tarConfig;
        if (!tarConfig[t.type]) {
            continue;
        }
        await $.ajax(t.cookiePage, {
            type: "get", global: false, error: () => {
                errorList.push(t.domain);
            }
        });
    }
    let message = errorList.length ? errorList.join(",") + " 发生错误" : "没有发生错误"
    chrome.notifications.create(null, {
        type: "basic",
        iconUrl: "../icon/refresh.png",
        title: "ashioarae 刷新cookie完成",
        message: message
    });

}