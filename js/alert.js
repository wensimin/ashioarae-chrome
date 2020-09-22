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
                // 第一次刷新是下一天的0点1分
                let nextDay = getNextDay(1);
                chrome.alarms.create(alertName, {
                    when: nextDay,
                    // 12小时进行一次循环
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

    async function refreshCookieAndRetry(t, number) {
        try {
            await t.refreshCookie();
        } catch (e) {
            if (number >= 3) {
                log("自动刷新cookie类型" + t.type + "出现错误  " + e.message, logLevels.error, true);
                return t.domain
            } else {
                log(t.type + " retry " + (number + 1) + " 失败: " + e.message + " 进行重试", logLevels.error);
                return refreshCookieAndRetry(t, number++);
            }
        }
    }

    for (const t of typeList) {
        let config = await getConfig()
        let tarConfig = config.tarConfig;
        if (!tarConfig[t.type]) {
            continue;
        }
        let err = await refreshCookieAndRetry(t, 0);
        if (err) {
            errorList.push(err);
        }
    }
    let message = errorList.length ? errorList.join(",") + " 发生错误" : "没有发生错误"
    log("定期更新cookie " + message, logLevels.info, true);
    chrome.notifications.create(null, {
        type: "basic",
        iconUrl: "../icon/refresh.png",
        title: "ashioarae 刷新cookie完成",
        message: message
    });
}