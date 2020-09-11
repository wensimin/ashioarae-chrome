//初始化定时任务
initAlert();

/**
 * 定时任务
 * 刷新cookie
 */
function initAlert() {
    let alertName = "refreshCookie";
    chrome.alarms.get(alertName, alert => {
            if (!alert) {
                chrome.alarms.create(alertName, {
                    when: new Date().getTime(),
                    periodInMinutes: 60 * 12
                });
            }
        }
    );
    chrome.alarms.onAlarm.addListener(async () => {
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
            title: "ashioarae 定期刷新cookie完成",
            message: message
        });

    })

}